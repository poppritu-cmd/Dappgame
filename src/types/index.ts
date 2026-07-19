export type GameStatus = 'waiting' | 'playing' | 'won' | 'lost' | 'draw';

export interface GameState {
  board: ('X' | 'O' | null)[];
  playerX: string;
  playerO: string;
  currentTurn: string;
  status: GameStatus;
  winner: string | null;
  betAmount: string;
  gameId: string;
}

export interface TransactionStatus {
  state: 'idle' | 'pending' | 'success' | 'error';
  hash: string | null;
  message: string | null;
  error: string | null;
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  network: string;
}
