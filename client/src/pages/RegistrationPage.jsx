import React, { useState } from 'react';
import { 
  Users, HardDrive, Cpu, Bot, Wrench, Building2, Zap, 
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Key, Shield, Plus, Trash2 
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';

export const DEPARTMENTS = [
  { id: 'IT', name: 'Information Technology', icon: HardDrive, color: 'border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/10' },
  { id: 'COMPS', name: 'Computer Engineering', icon: Cpu, color: 'border-cyber-green/50 text-cyber-green bg-cyber-green/10' },
  { id: 'AIML', name: 'AI & Data Science', icon: Bot, color: 'border-purple-400/50 text-purple-400 bg-purple-500/10' },
  { id: 'MECHANICAL', name: 'Mechanical Eng.', icon: Wrench, color: 'border-amber-400/50 text-amber-400 bg-amber-500/10' },
  { id: 'CIVIL', name: 'Civil Engineering', icon: Building2, color: 'border-orange-400/50 text-orange-400 bg-orange-500/10' },
  { id: 'ELECTRICAL', name: 'Electrical Eng.', icon: Zap, color: 'border-yellow-400/50 text-yellow-400 bg-yellow-500/10' }
];

export default function RegistrationPage({ onRegistered, onCancel }) {
  const [teamName, setTeamName] = useState('');
  const [department, setDepartment] = useState('COMPS');
  const [college, setCollege] = useState('');
  
  // Flexible: Minimum 2, Maximum 4 members
  const [members, setMembers] = useState([
    { name: '', email: '', roll_no: '' },
    { name: '', email: '', roll_no: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredData, setRegisteredData] = useState(null);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
    setError('');
  };

  const handleAddMember = () => {
    soundService.playClick();
    if (members.length < 4) {
      setMembers([...members, { name: '', email: '', roll_no: '' }]);
      setError('');
    }
  };

  const handleRemoveMember = (index) => {
    soundService.playClick();
    if (members.length > 2) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundService.playClick();

    if (!teamName.trim()) {
      setError('Please enter your Team Name.');
      soundService.playWrong();
      return;
    }

    if (!department) {
      setError('Please select your Engineering Department.');
      soundService.playWrong();
      return;
    }

    if (members.length < 2 || members.length > 4) {
      setError('Team must register between 2 and 4 students (Minimum 2, Maximum 4).');
      soundService.playWrong();
      return;
    }

    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) {
        setError(`Please enter the Full Name for Student ${i + 1} (${i === 0 ? 'Team Leader' : `Member ${i + 1}`}).`);
        soundService.playWrong();
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.registerTeam({
        team_name: teamName.trim(),
        department,
        college: college.trim(),
        members
      });

      if (res.success && res.team) {
        soundService.playCorrect();
        setRegisteredData(res);
      } else {
        setError(res.error || 'Registration failed. Please try again.');
        soundService.playWrong();
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Network communication failure. Please check backend connection.');
      soundService.playWrong();
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation Screen
  if (registeredData) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-2xl border border-cyber-green/50 bg-slate-900/90 backdrop-blur shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-cyber-green/20 border border-cyber-green text-cyber-green flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-extrabold font-display text-cyber-green mb-1">
            TEAM REGISTERED!
          </h2>
          <p className="text-sm font-mono text-slate-400 mb-6">
            Your official team profile has been created for BUG HUNT 2026.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left mb-6 space-y-2 font-mono text-sm">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">TEAM ID:</span>
              <span className="text-cyber-cyan font-bold text-base">{registeredData.team.team_id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">TEAM NAME:</span>
              <span className="text-slate-200 font-bold">{registeredData.team.team_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">DEPARTMENT:</span>
              <span className="text-amber-400 font-bold">{registeredData.team.department}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500">PASS CODE:</span>
              <span className="text-purple-400 font-bold tracking-wider">{registeredData.team.pass_code}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 block mb-1">REGISTERED STUDENTS ({registeredData.members?.length || members.length}):</span>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-0.5">
                {registeredData.members?.map((m, idx) => (
                  <li key={idx}>
                    {m.name} {idx === 0 && <span className="text-cyber-green">(Leader)</span>}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <button
            onClick={() => onRegistered(registeredData.team, registeredData.members)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold font-mono text-sm tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            ENTER WAITING ROOM
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 py-10 px-4 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full p-6 md:p-8 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyber-green" />
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-100">
                Official Team Registration
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Register between 2 and 4 students per competition team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-mono mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Team Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Team Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => { setTeamName(e.target.value); setError(''); }}
                placeholder="e.g. Binary Bandits"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyber-green focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                College / Institute Name
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Tech Institute of Engineering"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:border-cyber-green focus:outline-none"
              />
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Select Engineering Department <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {DEPARTMENTS.map((d) => {
                const Icon = d.icon;
                const isSelected = department === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => { soundService.playClick(); setDepartment(d.id); }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                      isSelected
                        ? `${d.color} shadow-lg ring-1 ring-cyber-cyan`
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-mono text-xs font-bold">{d.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 to 4 Students Roster */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Team Roster ({members.length} Students — Min 2, Max 4)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Student 1 will act as Team Lead</span>
              </div>

              {members.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3 py-1.5 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Member ({members.length + 1}/4)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      STUDENT {index + 1} {index === 0 && <span className="text-cyber-green">(TEAM LEAD)</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                      {index >= 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-400 hover:bg-rose-500/20 font-mono flex items-center gap-1 transition"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      placeholder={`Student ${index + 1} Full Name *`}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:border-cyber-cyan focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={member.roll_no}
                      onChange={(e) => handleMemberChange(index, 'roll_no', e.target.value)}
                      placeholder="Roll / Reg No"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono focus:border-cyber-cyan focus:outline-none"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono focus:border-cyber-cyan focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-500 text-slate-950 font-bold font-mono text-sm tracking-wider hover:opacity-90 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_#00ff8840]"
          >
            {loading ? (
              <span>ENROLLING TEAM...</span>
            ) : (
              <>
                <span>REGISTER TEAM & ENTER ARENA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
