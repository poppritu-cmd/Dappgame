<div align="center">

# Stellar Tic Tac Toe

### Blockchain-powered Tic Tac Toe on Stellar — Bet XLM, play on-chain, winner takes the pot.

[![CI](https://github.com/poppritu-cmd/Dappgame/actions/workflows/ci.yml/badge.svg)](https://github.com/poppritu-cmd/Dappgame/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Built%20on-Stellar%20Testnet-blue)](https://stellar.org)

**[Live Demo](https://visionary-biscochitos-aece08.netlify.app)** · **[GitHub](https://github.com/poppritu-cmd/Dappgame)**

<br/>

<img width="1902" height="882" alt="image" src="https://github.com/user-attachments/assets/b17732de-36c8-46ba-81df-68ad1cde5096" />

<img width="1896" height="550" alt="image" src="https://github.com/user-attachments/assets/156e74e8-63d2-47ea-ba59-775b0fad2336" />

</div>

---

## Overview

Stellar Tic Tac Toe is a fully functional Web3 game where two players connect their Stellar wallets, place XLM bets, and compete in Tic Tac Toe with every move tracked on the Stellar blockchain.

Built for the **Stellar Dev Advocacy Level 3** challenge.


---

## Features

| Level | Feature | Status |
|-------|---------|--------|
| **Level 1** | Connect Freighter wallet | Done |
| | Wallet disconnect | Done |
| | Fetch & display XLM balance | Done |
| | Send XLM on testnet | Done |
| | Transaction feedback (hash) | Done |
| **Level 2** | Multi-wallet via Stellar SDK | Done |
| | Error handling (not found, rejected, insufficient) | Done |
| | Smart contract deployed on testnet | Done |
| | Contract called from frontend | Done |
| | Transaction status tracking | Done |
| **Level 3** | Soroban smart contract (Rust) | Done |
| | Event streaming & real-time state | Done |
| | CI/CD pipeline (GitHub Actions) | Done |
| | Mobile responsive (Wise-inspired design) | Done |
| | Error handling & loading states | Done |
| | 9 frontend tests + 6 contract tests | Done |
| | Production-ready architecture | Done |
| | Cross-account game sharing | Done |

---

## How to Play

```
 1. CONNECT          2. CREATE           3. SHARE           4. JOIN & PLAY
 ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
 │ Freighter │  ──►  │ Set bet  │  ──►  │ Copy ID  │  ──►  │ Paste ID │
 │  Wallet   │       │  amount  │       │ & share  │       │  & play  │
 └──────────┘       └──────────┘       └──────────┘       └──────────┘
```

1. **Connect** your Freighter wallet to Stellar Testnet
2. **Create** a game with an XLM bet amount
3. **Share** the encoded Game ID with your opponent
4. **Join** by pasting the Game ID
5. **Play** — take turns placing X and O
6. **Win** — winner receives the bet via on-chain XLM transfer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 (Wise-inspired design) |
| **Wallet** | @stellar/freighter-api |
| **Blockchain** | @stellar/stellar-sdk (Horizon API) |
| **Smart Contract** | Soroban (Rust) |
| **Testing** | Vitest (frontend) + Rust tests (contract) |
| **Linting** | oxlint |
| **CI/CD** | GitHub Actions |
| **Deployment** | Netlify |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Freighter Wallet](https://www.freighter.app/) browser extension

### Install

```bash
git clone https://github.com/poppritu-cmd/Dappgame.git
cd Dappgame
npm install
```

### Development

```bash
npm run dev
```

### Test

```bash
npm test
```

### Build

```bash
npm run build
```

---

## Smart Contract

**Contract Address:** `CCVGKQA35KNL5H5ZMOV5MINOPUO4TIDM6GZ6DMQDCQPMST6TM6N4P4WQ`
**Wallet Address:** `GACMLTEWZ23NGJ5WZ2THYGLODFYTEKECB7J2U33H3DCSW2PEAQUEIZED`

The Soroban smart contract lives in `contracts/tic_tac_toe/` and implements:

- **Game creation** with bet amounts
- **Player joining** with auth checks
- **Move validation** (turn order, position taken)
- **Win detection** (rows, columns, diagonals)
- **Draw detection**

```bash
cd contracts/tic_tac_toe
cargo test
```

### Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 1 | `GameNotFound` | Game ID doesn't exist |
| 2 | `AlreadyStarted` | Game already in progress |
| 3 | `NotYourTurn` | Wrong player making move |
| 4 | `InvalidPosition` | Position out of bounds |
| 5 | `PositionTaken` | Cell already occupied |
| 6 | `GameNotInProgress` | Game already ended |

---

## Project Structure

```
Dappgame/
├── contracts/tic_tac_toe/       # Soroban smart contract (Rust)
│   ├── src/lib.rs
│   └── Cargo.toml
├── src/
│   ├── components/              # React UI components
│   │   ├── LandingPage.tsx      # Wise-inspired landing page
│   │   ├── WalletConnect.tsx    # Wallet connect/disconnect
│   │   ├── BalanceDisplay.tsx   # XLM balance display
│   │   ├── GameBoard.tsx        # Tic Tac Toe board
│   │   └── TransactionStatusDisplay.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useBalance.ts
│   │   ├── useGame.ts
│   │   └── useTransactionStatus.ts
│   ├── services/                # Stellar integration
│   │   ├── stellar.ts           # SDK: connect, balance, send
│   │   └── contract.ts          # Game logic + share encoding
│   ├── types/                   # TypeScript types
│   ├── __tests__/               # Vitest tests (9 passing)
│   ├── App.tsx
│   └── main.tsx
├── .github/workflows/ci.yml    # CI/CD pipeline
├── DESIGN.md                    # Wise design system
└── package.json
```

---

## Error Handling

| Error | User Message |
|-------|-------------|
| Wallet not found | "Please install Freighter extension" |
| Connection rejected | "Wallet connection rejected by user" |
| Insufficient balance | "Insufficient balance for the bet" |
| Not your turn | Move blocked silently |
| Position taken | Cell disabled, no action |
| Transaction failed | Error toast with details |
| Game not found | "Game not found" (invalid ID) |

---

## CI/CD

GitHub Actions pipeline runs on every push and PR:

- TypeScript type checking
- Linting (oxlint)
- Unit tests (Vitest)
- Build verification

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Stellar, Soroban, and React**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-black?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-green?style=for-the-badge)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>
