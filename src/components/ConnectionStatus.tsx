import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionStatus() {
  const { isOnline, isChecking } = useConnectionStatus();

  if (isChecking) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center">
        <WifiOff className="h-5 w-5 mr-2" />
        <span>Connessione persa. Riconnessione in corso...</span>
      </div>
    );
  }

  return null;
}