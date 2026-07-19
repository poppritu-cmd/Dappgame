import type { TransactionStatus } from '../types';

interface Props {
  status: TransactionStatus;
  onClose: () => void;
}

export function TransactionStatusDisplay({ status, onClose }: Props) {
  if (status.state === 'idle') return null;

  const borderClass = status.state === 'pending' ? 'border-warning/50' : status.state === 'success' ? 'border-positive/50' : 'border-negative/50';

  return (
    <div className={`fixed bottom-5 right-5 bg-dark-card border ${borderClass} rounded-2xl p-4 min-w-[300px] shadow-lg z-50 animate-[slideUp_0.3s_ease]`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-muted">Transaction</span>
        <button onClick={onClose} className="text-muted hover:text-ink cursor-pointer text-lg">x</button>
      </div>

      {status.state === 'pending' && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-muted border-t-brand rounded-full inline-block animate-[spin_0.8s_linear_infinite]" />
          <span className="text-sm text-ink">{status.message}</span>
        </div>
      )}

      {status.state === 'success' && (
        <div className="flex flex-col gap-2">
          <span className="text-positive font-semibold text-sm">Success</span>
          <span className="text-sm text-ink">{status.message}</span>
          {status.hash && (
            <a href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`} target="_blank" rel="noopener noreferrer" className="text-brand text-sm hover:underline">
              View on Explorer
            </a>
          )}
        </div>
      )}

      {status.state === 'error' && (
        <div className="flex flex-col gap-2">
          <span className="text-negative font-semibold text-sm">Error</span>
          <span className="text-sm text-muted">{status.error}</span>
        </div>
      )}
    </div>
  );
}
