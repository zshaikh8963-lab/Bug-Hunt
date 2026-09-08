import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CompetitionBanner from './components/CompetitionBanner';
import RulesModal from './components/RulesModal';
import AntiCheatModal from './components/AntiCheatModal';

// Competition Pages
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import Round1Page from './pages/Round1Page';
import Round2Page from './pages/Round2Page';
import Round3Page from './pages/Round3Page';
import LeaderboardPage from './pages/LeaderboardPage';
import ProjectorPage from './pages/ProjectorPage';
import CertificateVerificationPage from './pages/CertificateVerificationPage';
import AdminPage from './pages/AdminPage';

import { api } from './services/api';
import { subscribeToState } from './services/socket';
import { soundService } from './services/sound';

const getInitialView = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash === '#projector' || pathname.includes('/projector') || search.includes('projector')) return 'projector';
    if (hash === '#admin' || pathname.includes('/admin') || search.includes('admin')) return 'admin';
    if (hash === '#leaderboard' || pathname.includes('/leaderboard') || search.includes('leaderboard')) return 'leaderboard';
    if (hash === '#register' || pathname.includes('/register') || search.includes('register')) return 'register';
    if (hash === '#waiting' || pathname.includes('/waiting')) return 'waiting';
    if (hash === '#r1') return 'r1';
    if (hash === '#r2') return 'r2';
    if (hash === '#r3') return 'r3';
    if (hash.startsWith('#verify') || pathname.startsWith('/verify')) return 'verify';
  }
  return 'landing';
};

export default function App() {
  // Navigation & Routing State
  const [currentView, setCurrentView] = useState(getInitialView);
  const [verifyCertId, setVerifyCertId] = useState('');

  // Active Team & Squad State
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem('bughunt_team');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('bughunt_members');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Tournament Status State
  const [compStatus, setCompStatus] = useState({
    status: 'WAITING',
    active_round: 0,
    is_paused: false,
    message: ''
  });

  // Modals & Anti-Cheat State
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [antiCheatOpen, setAntiCheatOpen] = useState(false);
  const [strikeCount, setStrikeCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Helper for synchronized view navigation and hash history
  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'landing') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else if (['admin', 'leaderboard', 'projector', 'register', 'waiting', 'r1', 'r2', 'r3'].includes(view)) {
      window.location.hash = `#${view}`;
    }
  };

  // 1. Initial URL & Hash Routing Handler
  useEffect(() => {
    const handleUrlRouting = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Projector mode: #projector or /projector
      if (hash === '#projector' || pathname.includes('/projector') || search.includes('projector')) {
        setCurrentView('projector');
        return;
      }

      // Admin mode: #admin or /admin or ?admin
      if (hash === '#admin' || pathname.includes('/admin') || search.includes('admin')) {
        setCurrentView('admin');
        return;
      }

      // Leaderboard: #leaderboard or /leaderboard or ?leaderboard
      if (hash === '#leaderboard' || pathname.includes('/leaderboard') || search.includes('leaderboard')) {
        setCurrentView('leaderboard');
        return;
      }

      // Registration: #register or /register
      if (hash === '#register' || pathname.includes('/register') || search.includes('register')) {
        setCurrentView('register');
        return;
      }

      // Waiting room: #waiting or /waiting
      if (hash === '#waiting' || pathname.includes('/waiting')) {
        setCurrentView('waiting');
        return;
      }

      // Round direct hashes
      if (hash === '#r1' || pathname.includes('/r1')) {
        setCurrentView('r1');
        return;
      }
      if (hash === '#r2' || pathname.includes('/r2')) {
        setCurrentView('r2');
        return;
      }
      if (hash === '#r3' || pathname.includes('/r3')) {
        setCurrentView('r3');
        return;
      }

      // Verification mode: #verify/BH-XXXX or /verify/BH-XXXX
      const verifyMatch = window.location.hash.match(/#verify\/(.+)/i) || 
                          window.location.pathname.match(/\/verify\/(.+)/i);
      if (verifyMatch && verifyMatch[1]) {
        setVerifyCertId(decodeURIComponent(verifyMatch[1]));
        setCurrentView('verify');
        return;
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);

    // Keyboard shortcut for event organizers: Ctrl+Shift+A -> Admin
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        soundService.playClick();
        navigateTo('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2. Fetch Tournament Status and Poll/Subscribe via Socket.IO
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getCompetitionStatus();
        if (res.success) {
          setCompStatus(res);
        }
      } catch (err) {
        // Fallback
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 6000);

    // Socket.IO real-time state synchronization
    const unsubscribeState = subscribeToState((state) => {
      if (!state) return;
      setCompStatus(prev => ({
        ...prev,
        status: state.status,
        active_round: state.active_round,
        is_paused: state.is_paused,
        message: state.message || ''
      }));

      // Audio notification for pause / resume
      if (state.is_paused) {
        soundService.playWarning();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeState();
    };
  }, []);

  // 3. React to Active Round Transitions from Organizer
  // NOTE: Only auto-advance if team is waiting in the waiting room!
  useEffect(() => {
    if (!team || isDisqualified) return;

    const round = compStatus.active_round;

    // Only auto-advance if team is waiting in the lobby
    if (currentView === 'waiting') {
      if (round === 1) {
        soundService.playVictory();
        navigateTo('r1');
      } else if (round === 2) {
        soundService.playVictory();
        navigateTo('r2');
      } else if (round === 3) {
        soundService.playVictory();
        navigateTo('r3');
      }
    }
  }, [compStatus.active_round, team, currentView, isDisqualified]);

  // 4. Anti-Cheating Protocol (Window Blur & Tab Switch Detector)
  useEffect(() => {
    const isCompeting = ['r1', 'r2', 'r3'].includes(currentView);
    if (!isCompeting || !team || isDisqualified) return;

    let debounceTimer = null;

    const handleViolation = async (reason) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        soundService.playWarning();
        try {
          const res = await api.recordViolation(team.team_id, 'TAB_SWITCH', reason);
          if (res.success) {
            setStrikeCount(res.strikes || strikeCount + 1);
            if (res.is_disqualified) {
              setIsDisqualified(true);
            }
            setAntiCheatOpen(true);
          }
        } catch (e) {
          setStrikeCount(prev => prev + 1);
          setAntiCheatOpen(true);
        }
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab switched / window hidden');
      }
    };

    const handleBlur = () => {
      handleViolation('Window lost focus / unfocused');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [currentView, team, isDisqualified, strikeCount]);

  // 5. Save Team and Squad to LocalStorage
  const updateTeamSession = (newTeam, newMembers = null) => {
    setTeam(newTeam);
    if (newTeam) {
      localStorage.setItem('bughunt_team', JSON.stringify(newTeam));
    } else {
      localStorage.removeItem('bughunt_team');
    }

    if (newMembers) {
      setMembers(newMembers);
      localStorage.setItem('bughunt_members', JSON.stringify(newMembers));
    } else if (newTeam === null) {
      setMembers([]);
      localStorage.removeItem('bughunt_members');
    }
  };

  // 6. Navigation Actions
  const handleStartRegistration = () => {
    soundService.playClick();
    setCurrentView('register');
  };

  const handleRegistered = (registeredTeam, registeredMembers) => {
    updateTeamSession(registeredTeam, registeredMembers);
    soundService.playCorrect();

    // If Round 1 is currently active, jump right in, else go to Waiting Room
    if (compStatus.active_round === 1) {
      setCurrentView('r1');
    } else {
      setCurrentView('waiting');
    }
  };

  const handleResumeSession = async (code) => {
    soundService.playClick();
    try {
      const res = await api.loginTeam(code);
      if (res.success && res.team) {
        updateTeamSession(res.team, res.members || []);
        soundService.playCorrect();

        if (res.team.is_disqualified) {
          setIsDisqualified(true);
          setAntiCheatOpen(true);
          return;
        }

        // Determine appropriate screen
        const active = compStatus.active_round;
        if (active === 1) {
          setCurrentView('r1');
        } else if (active === 2) {
          setCurrentView('r2');
        } else if (active === 3) {
          setCurrentView('r3');
        } else {
          setCurrentView('waiting');
        }
      } else {
        alert(res.error || 'Team not found with the provided identifier.');
        soundService.playWrong();
      }
    } catch (e) {
      alert('Error verifying team session. Please check server connection.');
    }
  };

  const handleLogout = () => {
    soundService.playClick();
    updateTeamSession(null, []);
    setCurrentView('landing');
  };

  const handleRoundCompleted = async (roundNum) => {
    soundService.playVictory();
    // Refresh team data to get updated scores
    if (team) {
      try {
        const res = await api.getTeamSession(team.team_id);
        if (res.success && res.team) {
          updateTeamSession(res.team);
        }
      } catch (e) {
        // Fallback
      }
    }

    // Determine next screen based on active round
    if (roundNum === 1) {
      if (compStatus.active_round === 2) {
        setCurrentView('r2');
      } else {
        setCurrentView('waiting');
      }
    } else if (roundNum === 2) {
      if (compStatus.active_round === 3) {
        setCurrentView('r3');
      } else {
        setCurrentView('waiting');
      }
    } else if (roundNum === 3) {
      setCurrentView('leaderboard');
    }
  };

  const handleRunDemo = async () => {
    soundService.playClick();
    try {
      const res = await api.runDemoSimulation();
      if (res.success) {
        soundService.playVictory();
        alert('Demo simulation active! 4 teams (Alpha, Beta, Gamma, Delta) generated with scores and certificates. Switching to live Leaderboard.');
        setCurrentView('leaderboard');
      } else {
        alert(res.error || 'Failed to trigger demo simulation');
      }
    } catch (e) {
      alert('Simulation error: ' + e.message);
    }
  };

  // Check if current view is full screen (Projector or Admin)
  const isFullScreenView = currentView === 'projector' || currentView === 'admin';

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col font-sans selection:bg-cyber-cyan/30 selection:text-white">
      
      {/* Top Navbar (hidden on Projector display for clean presentation) */}
      {!isFullScreenView && (
        <Navbar
          currentScreen={currentView}
          setView={navigateTo}
          participant={team ? { team_name: team.team_name, college: team.department, participant_id: team.team_id } : null}
          onLogout={handleLogout}
          competitionStatus={compStatus.status}
          onNavigate={(target) => {
            if (target === 'rules') setIsRulesOpen(true);
            else navigateTo(target);
          }}
        />
      )}

      {/* Global Competition Banner (Pause, Round Alerts) */}
      {!isFullScreenView && (
        <CompetitionBanner
          status={compStatus.status}
          isPaused={compStatus.is_paused}
          message={compStatus.message}
        />
      )}

      {/* Competition Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Anti-Cheat 3-Strike Warning & Disqualification Modal */}
      <AntiCheatModal
        isOpen={antiCheatOpen}
        strikeCount={strikeCount}
        isDisqualified={isDisqualified}
        onClose={() => setAntiCheatOpen(false)}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 w-full flex flex-col">
        
        {currentView === 'landing' && (
          <LandingPage
            onStartRegistration={() => navigateTo('register')}
            onResumeSession={handleResumeSession}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAdmin={() => navigateTo('admin')}
            onOpenProjector={() => navigateTo('projector')}
            onRunDemo={handleRunDemo}
            compStatus={compStatus}
          />
        )}

        {currentView === 'register' && (
          <RegistrationPage
            onRegistered={handleRegistered}
            onCancel={() => navigateTo('landing')}
          />
        )}

        {currentView === 'waiting' && (
          <WaitingRoomPage
            team={team}
            members={members}
            compStatus={compStatus}
            onOpenRules={() => setIsRulesOpen(true)}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'r1' && (
          <Round1Page
            team={team || { team_id: 'DEMO-001', team_name: 'Tournament Team', department: 'COMPS' }}
            onRoundCompleted={() => handleRoundCompleted(1)}
            onLeaderboardClick={() => navigateTo('leaderboard')}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'r2' && (
          <Round2Page
            team={team || { team_id: 'DEMO-001', team_name: 'Tournament Team', department: 'COMPS' }}
            onRoundCompleted={() => handleRoundCompleted(2)}
            onLeaderboardClick={() => navigateTo('leaderboard')}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'r3' && (
          <Round3Page
            team={team || { team_id: 'DEMO-001', team_name: 'Tournament Team', department: 'COMPS' }}
            onRoundCompleted={() => handleRoundCompleted(3)}
            onLeaderboardClick={() => navigateTo('leaderboard')}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardPage
            onBack={() => navigateTo('landing')}
            onOpenProjector={() => navigateTo('projector')}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {currentView === 'projector' && (
          <ProjectorPage 
            onBack={() => navigateTo('landing')}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {currentView === 'verify' && (
          <CertificateVerificationPage
            certId={verifyCertId}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage
            onBack={() => navigateTo('landing')}
            onOpenLeaderboard={() => navigateTo('leaderboard')}
            onOpenProjector={() => navigateTo('projector')}
          />
        )}

        {!['landing', 'register', 'waiting', 'r1', 'r2', 'r3', 'leaderboard', 'projector', 'verify', 'admin'].includes(currentView) && (
          <LandingPage
            onStartRegistration={() => navigateTo('register')}
            onResumeSession={handleResumeSession}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAdmin={() => navigateTo('admin')}
            onOpenProjector={() => navigateTo('projector')}
            onRunDemo={handleRunDemo}
            compStatus={compStatus}
          />
        )}

      </main>

    </div>
  );
}
