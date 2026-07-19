import { useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, checkWalletConnected, getWalletAddress } from '../services/stellar';

export function useWallet() {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const connected = await checkWalletConnected();
        if (connected) {
          const addr = await getWalletAddress();
          if (addr) {
            setAddress(addr);
            setIsConnected(true);
          }
        }
      } catch {
        setIsConnected(false);
      }
    }
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setIsConnected(true);
      localStorage.setItem('wallet_address', addr);
    } catch (err: any) {
      const msg = err?.message || 'Failed to connect wallet';
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      setAddress('');
      setIsConnected(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to disconnect');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError,
  };
}
