import { Horizon, Networks, TransactionBuilder, Operation, Asset, Memo } from '@stellar/stellar-sdk';
import { isConnected, getAddress, requestAccess, signTransaction } from '@stellar/freighter-api';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

export const NETWORK_PASSPHRASE = Networks.TESTNET;

export async function checkWalletConnected(): Promise<boolean> {
  try {
    const result = await isConnected();
    if (!result.isConnected) return false;
    const addrResult = await getAddress();
    return !!addrResult.address;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected.isConnected) {
    throw new Error('Freighter wallet not found. Please install the Freighter browser extension.');
  }

  const accessResult = await requestAccess();
  if (accessResult.error) {
    throw new Error(accessResult.error.message || 'Wallet connection rejected by user');
  }
  if (!accessResult.address) {
    throw new Error('Wallet connection rejected by user');
  }

  return accessResult.address;
}

export async function getWalletAddress(): Promise<string> {
  const result = await getAddress();
  if (result.error) throw new Error(result.error.message);
  return result.address;
}

export async function disconnectWallet(): Promise<void> {
  localStorage.removeItem('wallet_address');
}

export async function getBalance(address: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${HORIZON_URL}/accounts/${address}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return '0';
    const data = await res.json();
    const native = data.balances?.find((b: { asset_type: string }) => b.asset_type === 'native');
    return native ? native.balance : '0';
  } catch {
    return '0';
  }
}

export async function fundTestnetAccount(address: string): Promise<void> {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${address}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Failed to fund account');
  }
}

export async function sendXLM(
  from: string,
  to: string,
  amount: string,
  memo?: string
): Promise<{ hash: string }> {
  const account = await server.loadAccount(from);

  const transaction = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: to,
        asset: Asset.native(),
        amount: amount,
      })
    )
    .addMemo(memo ? Memo.text(memo) : Memo.text('Stellar Tic Tac Toe'))
    .setTimeout(180)
    .build();

  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: from,
  });

  if (signResult.error) {
    throw new Error(signResult.error.message || 'Transaction signing failed');
  }

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(signedTx);

  return { hash: result.hash };
}

export async function getTransactionHistory(address: string, limit = 10) {
  try {
    const payments = await server
      .payments()
      .forAccount(address)
      .limit(limit)
      .order('desc')
      .call();
    return payments.records;
  } catch {
    return [];
  }
}

export { server };
