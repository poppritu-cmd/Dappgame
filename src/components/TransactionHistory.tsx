import { useState, useEffect, useCallback } from 'react';
import { getTransactionHistory } from '../services/stellar';

interface TransactionHistoryProps {
  address: string;
  refreshKey?: number;
}

interface Payment {
  id: string;
  type: string;
  paging_token: string;
  transaction_successful: boolean;
  source_account: string;
  from?: string;
  to?: string;
  amount?: string;
  created_at: string;
}

export function TransactionHistory({ address, refreshKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const records = await getTransactionHistory(address, 15);
      setTransactions(records as Payment[]);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const truncateAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink">Recent Transactions</h2>
        <button onClick={fetchHistory} disabled={loading} className="text-xs text-muted hover:text-brand transition-colors cursor-pointer">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="flex justify-center py-8">
          <span className="w-5 h-5 border-2 border-muted border-t-brand rounded-full inline-block animate-[spin_0.8s_linear_infinite]" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-muted text-sm text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {transactions.map((tx) => {
            const isIncoming = tx.to === address;
            return (
              <div key={tx.id} className="flex items-center justify-between bg-dark-bg rounded-xl px-4 py-3 border border-dark-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isIncoming ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
                    {isIncoming ? '↓' : '↑'}
                  </div>
                  <div>
                    <span className="text-sm text-ink block">
                      {isIncoming ? 'Received' : 'Sent'} {tx.amount ? `${parseFloat(tx.amount).toFixed(2)} XLM` : ''}
                    </span>
                    <span className="text-xs text-muted">
                      {isIncoming ? `from ${truncateAddr(tx.from || '')}` : `to ${truncateAddr(tx.to || '')}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted block">{new Date(tx.created_at).toLocaleDateString()}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand hover:underline"
                  >
                    Explorer
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
