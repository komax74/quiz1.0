import { useState, useEffect } from 'react';
import { checkConnection, setupConnectionHandling } from '../lib/supabase';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkInitialConnection = async () => {
      const online = await checkConnection();
      setIsOnline(online);
      setIsChecking(false);
    };

    checkInitialConnection();

    return setupConnectionHandling((online) => {
      setIsOnline(online);
      setIsChecking(false);
    });
  }, []);

  return { isOnline, isChecking };
}