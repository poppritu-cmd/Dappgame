interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  address: string;
  onConnect: () => void;
  onDisconnect: () => void;
  error: string | null;
}

export function WalletConnect({
  isConnected,
  isConnecting,
  address,
  onConnect,
  onDisconnect,
  error,
}: WalletConnectProps) {
  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 justify-center flex-wrap">
        <span className="text-sm font-semibold text-positive">Connected</span>
        <span className="bg-dark-card px-3 py-1.5 rounded-lg font-mono text-sm text-ink border border-dark-border">{short}</span>
        <button onClick={onDisconnect} className="bg-negative/20 text-negative px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-negative/30 transition-colors cursor-pointer border border-negative/30">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-brand text-dark-bg px-6 py-3 rounded-2xl font-semibold text-base hover:bg-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
      >
        {isConnecting ? (
          <span className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
        ) : (
          'Connect Wallet'
        )}
      </button>
      {error && <span className="text-negative text-sm">{error}</span>}
    </div>
  );
}
