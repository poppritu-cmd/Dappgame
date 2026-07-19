import { useState, useCallback } from 'react';
import type { TransactionStatus } from '../types';

export function useTransactionStatus() {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    state: 'idle',
    hash: null,
    message: null,
    error: null,
  });

  const setPending = useCallback((message: string) => {
    setTxStatus({ state: 'pending', hash: null, message, error: null });
  }, []);

  const setSuccess = useCallback((hash: string, message: string) => {
    setTxStatus({ state: 'success', hash, message, error: null });
  }, []);

  const setError = useCallback((error: string) => {
    setTxStatus((prev) => ({
      ...prev,
      state: 'error',
      error,
      message: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setTxStatus({ state: 'idle', hash: null, message: null, error: null });
  }, []);

  return { txStatus, setPending, setSuccess, setError, reset };
}
