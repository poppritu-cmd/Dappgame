import { useState } from 'react';
import { fundTestnetAccount } from '../services/stellar';

interface BalanceDisplayProps {
  balance: string;
  isLoading: boolean;
  address: string;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, isLoading, address, onRefresh }: BalanceDisplayProps) {
  const [funding, setFunding] = useState(false);

  const handleFund = async () => {
    setFunding(true);
    try {
      await fundTestnetAccount(address);
      onRefresh();
    } catch {
    } finally {
      setFunding(false);
    }
  };

  const isZero = parseFloat(balance) === 0 && !isLoading;

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl px-6 py-4 flex items-center gap-4 mb-5">
      <span className="text-muted text-sm">XLM Balance</span>
      <span className="text-2xl font-bold text-positive">
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-muted border-t-brand rounded-full inline-block animate-[spin_0.8s_linear_infinite]" />
        ) : (
          `${parseFloat(balance).toFixed(2)} XLM`
        )}
      </span>
      {isZero && (
        <button onClick={handleFund} disabled={funding} className="bg-brand/20 text-brand px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand/30 transition-colors cursor-pointer disabled:opacity-50 border border-brand/30">
          {funding ? 'Funding...' : 'Fund 10K XLM'}
        </button>
      )}
      <button onClick={onRefresh} disabled={isLoading} className="ml-auto bg-dark-border/50 text-ink px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand/20 transition-colors cursor-pointer disabled:opacity-50 border border-dark-border">
        Refresh
      </button>
    </div>
  );
}
