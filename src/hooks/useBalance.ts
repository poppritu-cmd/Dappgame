import { useState, useEffect, useCallback } from 'react';
import { getBalance } from '../services/stellar';

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
      setBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch: fetchBalance };
}
