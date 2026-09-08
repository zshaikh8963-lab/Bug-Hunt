import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useAntiCheat = (sessionToken, isEnabled = true) => {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Handle visibility change / blur
  const handleVisibilityChange = useCallback(() => {
    if (!isEnabled || !sessionToken) return;

    if (document.hidden) {
      // User switched away from tab
      setTabSwitches(prev => {
        const next = prev + 1;
        // Record to server
        api.recordTabSwitch(sessionToken).catch(err => console.error('Failed to log violation:', err));
        return next;
      });
      setWarningMessage('Tab switch detected! Leaving the competition window is logged as a security violation.');
      setShowWarningModal(true);
    }
  }, [isEnabled, sessionToken]);

  // Window blur
  const handleWindowBlur = useCallback(() => {
    if (!isEnabled || !sessionToken) return;
    // Debounce or record blur
  }, [isEnabled, sessionToken]);

  // Accidental refresh / navigation guard
  const handleBeforeUnload = useCallback((e) => {
    if (!isEnabled) return;
    e.preventDefault();
    e.returnValue = 'You have an active Bug Hunt session in progress. Are you sure you want to leave?';
    return e.returnValue;
  }, [isEnabled]);

  // Prevent right-click context menu during gameplay
  const handleContextMenu = useCallback((e) => {
    if (!isEnabled) return;
    e.preventDefault();
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isEnabled, handleVisibilityChange, handleWindowBlur, handleBeforeUnload, handleContextMenu]);

  return {
    tabSwitches,
    showWarningModal,
    warningMessage,
    closeWarningModal: () => setShowWarningModal(false)
  };
};
