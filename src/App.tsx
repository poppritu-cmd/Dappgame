import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { WalletConnect } from './components/WalletConnect';
import { BalanceDisplay } from './components/BalanceDisplay';
import { GameBoard } from './components/GameBoard';
import { TransactionStatusDisplay } from './components/TransactionStatusDisplay';
import { useWallet } from './hooks/useWallet';
import { useBalance } from './hooks/useBalance';
import { useGame } from './hooks/useGame';
import { useTransactionStatus } from './hooks/useTransactionStatus';
import { sendXLM } from './services/stellar';

type View = 'landing' | 'lobby' | 'game' | 'history';

function App() {
  const wallet = useWallet();
  const balance = useBalance(wallet.address);
  const game = useGame();
  const txStatus = useTransactionStatus();
  const [view, setView] = useState<View>('landing');
  const [betAmount, setBetAmount] = useState('1');
  const [joinGameId, setJoinGameId] = useState('');

  const { refetch } = balance;

  useEffect(() => {
    game.setWalletAddress(wallet.address);
  }, [wallet.address, game]);

  useEffect(() => {
    if (wallet.isConnected) {
      refetch();
    }
  }, [wallet.isConnected, refetch]);

  useEffect(() => {
    if (wallet.isConnected && view === 'landing') {
      setView('lobby');
    }
  }, [wallet.isConnected, view]);

  const handleCreateGame = async () => {
    if (!wallet.isConnected || !wallet.address) return;
    if (parseFloat(betAmount) <= 0) {
      txStatus.setError('Bet amount must be greater than 0');
      return;
    }
    if (parseFloat(balance.balance) < parseFloat(betAmount)) {
      txStatus.setError('Insufficient balance');
      return;
    }
    try {
      txStatus.setPending('Creating game...');
      const gameId = await game.startNewGame(wallet.address, betAmount);
      txStatus.setSuccess('', `Game created! ID: ${gameId}`);
      setView('game');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create game';
      txStatus.setError(msg);
    }
  };

  const handleJoinGame = async () => {
    if (!wallet.isConnected || !wallet.address || !joinGameId) return;
    if (parseFloat(balance.balance) < parseFloat(betAmount)) {
      txStatus.setError('Insufficient balance to join');
      return;
    }
    try {
      txStatus.setPending('Joining game...');
      const cleaned = joinGameId.trim();
      const gameId = cleaned.startsWith('stt:')
        ? cleaned.slice(4).trim()
        : cleaned;
      await game.joinGame(gameId, wallet.address);
      txStatus.setSuccess('', 'Game joined! Make your move.');
      setView('game');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join game';
      txStatus.setError(msg);
    }
  };

  const handleCellClick = async (position: number) => {
    if (!wallet.address) return;
    try {
      txStatus.setPending('Submitting move...');
      const updatedGame = await game.playMove(position, wallet.address);
      if (!updatedGame) return;

      if (updatedGame.status === 'won' || updatedGame.status === 'lost') {
        const winnerAddr = updatedGame.winner;
        const loserAddr =
          winnerAddr === updatedGame.playerX
            ? updatedGame.playerO
            : updatedGame.playerX;
        if (winnerAddr === wallet.address) {
          try {
            txStatus.setPending('Sending winnings...');
            const result = await sendXLM(
              loserAddr,
              wallet.address,
              updatedGame.betAmount,
              `Stellar TTT - Game ${updatedGame.gameId}`
            );
            txStatus.setSuccess(
              result.hash,
              `You won ${updatedGame.betAmount} XLM!`
            );
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Transfer failed';
            txStatus.setError(`Game won but transfer failed: ${msg}`);
          }
        } else {
          txStatus.setSuccess(
            '',
            `Game over. You lost ${updatedGame.betAmount} XLM.`
          );
        }
        balance.refetch();
      } else {
        txStatus.setSuccess('', 'Move submitted!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Move failed';
      txStatus.setError(msg);
    }
  };

  if (view === 'landing') {
    return (
      <LandingPage
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        address={wallet.address}
        balance={balance.balance}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onStartGame={() => setView('lobby')}
        error={wallet.error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-x-color to-o-color bg-clip-text text-transparent">
          Stellar Tic Tac Toe
        </h1>
        <p className="text-muted mt-2 text-sm">
          Real-time multiplayer on Stellar Testnet
        </p>
        <div className="mt-5">
          <WalletConnect
            isConnected={wallet.isConnected}
            isConnecting={wallet.isConnecting}
            address={wallet.address}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
            error={wallet.error}
          />
        </div>
      </header>

      {wallet.isConnected && (
        <div className="max-w-2xl mx-auto w-full px-4">
          <BalanceDisplay
            balance={balance.balance}
            isLoading={balance.isLoading}
            address={wallet.address}
            onRefresh={balance.refetch}
          />
        </div>
      )}

      <nav className="max-w-2xl mx-auto w-full px-4 mb-5">
        <div className="bg-dark-bg rounded-xl p-1 flex gap-1">
          {(['lobby', 'game', 'history'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              disabled={v === 'game' && !game.currentGame}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 ${
                view === v
                  ? 'bg-brand text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4">
        {view === 'lobby' && (
          <div className="flex flex-col gap-6">
            {wallet.isConnected ? (
              <>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-ink font-bold text-lg mb-4 text-white">
                    Create New Game
                  </h2>
                  <label className="block text-muted text-sm mb-1.5">
                    Bet Amount (XLM)
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white text-base outline-none focus:border-brand mb-4 transition-colors"
                  />
                  <button
                    onClick={handleCreateGame}
                    disabled={game.isJoining}
                    className="w-full bg-brand text-ink py-3.5 rounded-2xl font-semibold text-base hover:bg-brand-hover transition-all cursor-pointer disabled:opacity-50"
                  >
                    Create Game
                  </button>
                </div>

                <div className="text-center text-muted font-semibold">OR</div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-ink font-bold text-lg mb-4 text-white">
                    Join Existing Game
                  </h2>
                  <label className="block text-muted text-sm mb-1.5">
                    Game ID
                  </label>
                  <input
                    type="text"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    placeholder="Paste game ID here (e.g. G1)"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white text-base outline-none focus:border-brand mb-4 transition-colors"
                  />
                  <button
                    onClick={handleJoinGame}
                    disabled={game.isJoining || !joinGameId}
                    className="w-full bg-brand text-ink py-3.5 rounded-2xl font-semibold text-base hover:bg-brand-hover transition-all cursor-pointer disabled:opacity-50"
                  >
                    {game.isJoining ? 'Joining...' : 'Join Game'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Welcome to Stellar Tic Tac Toe
                </h2>
                <p className="text-muted">
                  Connect your Freighter wallet to start playing!
                </p>
                <p className="text-muted mt-5 leading-loose">
                  Play Tic Tac Toe on the Stellar blockchain
                  <br />
                  Real-time multiplayer with Convex
                  <br />
                  Bet XLM against other players
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'game' && game.currentGame && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-dark-card px-4 py-2.5 rounded-lg mb-5">
              <span className="text-muted text-sm">Game ID:</span>
              <code className="text-brand text-sm">
                {game.currentGame.gameId}
              </code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(game.currentGame!.gameId)
                }
                className="bg-dark-bg text-muted px-2 py-1 rounded text-xs font-semibold hover:text-white transition-colors cursor-pointer border border-dark-border"
              >
                Copy
              </button>
            </div>
            <GameBoard
              game={game.currentGame}
              currentPlayer={wallet.address}
              onCellClick={handleCellClick}
            />
            <button
              onClick={() => {
                game.stopPolling();
                setView('lobby');
              }}
              className="bg-dark-card text-white px-6 py-2.5 rounded-2xl font-semibold text-sm border border-dark-border hover:bg-dark-border transition-all cursor-pointer"
            >
              Back to Lobby
            </button>
          </div>
        )}

        {view === 'history' && (
          <div>
            <h2 className="text-ink font-bold text-xl mb-4 text-white">
              Game History
            </h2>
            <p className="text-muted text-center py-10">
              Games are accessed by their Game ID. Copy the Game ID from
              an active game to rejoin it.
            </p>
          </div>
        )}
      </main>

      <TransactionStatusDisplay
        status={txStatus.txStatus}
        onClose={txStatus.reset}
      />

      <footer className="text-center py-8 text-muted text-sm">
        <p>Stellar Tic Tac Toe - Real-time Multiplayer</p>
        <p className="mt-1">
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline no-underline"
          >
            Stellar
          </a>
          {' | '}
          <a
            href="https://convex.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline no-underline"
          >
            Convex
          </a>
          {' | '}
          <a
            href="https://github.com/poppritu-cmd/Dappgame"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline no-underline"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
