import { useState } from 'react';
import { sendXLM } from '../services/stellar';

interface SendXLMProps {
  address: string;
  balance: string;
  onSuccess: (hash: string) => void;
  onError: (error: string) => void;
  onPending: (message: string) => void;
}

export function SendXLM({ address, balance, onSuccess, onError, onPending }: SendXLMProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [sending, setSending] = useState(false);

  const isValidAddress = to.startsWith('G') && to.length === 56;
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const hasEnoughBalance = parsedAmount <= parseFloat(balance);
  const canSend = isValidAddress && isValidAmount && hasEnoughBalance && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    onPending(`Sending ${parsedAmount} XLM...`);
    try {
      const { hash } = await sendXLM(address, to, amount, memo || undefined);
      onSuccess(hash);
      setTo('');
      setAmount('');
      setMemo('');
    } catch (err: any) {
      onError(err?.message || 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-ink mb-4">Send XLM</h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted mb-1 block">Recipient Address</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="G..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-ink placeholder-muted font-mono focus:outline-none focus:border-brand/50 transition-colors"
          />
          {to && !isValidAddress && (
            <span className="text-negative text-xs mt-1 block">Invalid Stellar address</span>
          )}
        </div>

        <div>
          <label className="text-xs text-muted mb-1 block">Amount (XLM)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-ink placeholder-muted focus:outline-none focus:border-brand/50 transition-colors"
          />
          {amount && !isValidAmount && (
            <span className="text-negative text-xs mt-1 block">Enter a valid amount</span>
          )}
          {amount && isValidAmount && !hasEnoughBalance && (
            <span className="text-negative text-xs mt-1 block">Insufficient balance</span>
          )}
        </div>

        <div>
          <label className="text-xs text-muted mb-1 block">Memo (optional)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note..."
            maxLength={28}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-ink placeholder-muted focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full bg-brand text-dark-bg font-semibold py-3 rounded-xl hover:bg-brand-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <span className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
              Sending...
            </>
          ) : (
            'Send XLM'
          )}
        </button>
      </div>
    </div>
  );
}
