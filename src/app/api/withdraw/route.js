import { 
  makeSTXTokenTransfer, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode 
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export async function POST(request) {
  try {
    const { userAddress, amount } = await request.json();

    // Validate input
    if (!userAddress || !amount || amount <= 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get treasury private key from environment
    const treasuryPrivateKey = process.env.CASINO_TREASURY_PRIVATE_KEY;
    if (!treasuryPrivateKey) {
      return Response.json({ error: 'Treasury not configured' }, { status: 500 });
    }

    // Determine network
    const network = process.env.NODE_ENV === 'production' 
      ? new StacksMainnet() 
      : new StacksTestnet();

    // Convert amount to microSTX
    const amountInMicroSTX = Math.floor(amount * 1000000);

    console.log('🏦 Processing withdrawal:', {
      userAddress,
      amount,
      amountInMicroSTX,
      network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
    });

    // Create STX transfer transaction
    const txOptions = {
      recipient: userAddress,
      amount: amountInMicroSTX,
      senderKey: treasuryPrivateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      memo: 'Casino Withdrawal'
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    const result = await broadcastTransaction(transaction, network);

    console.log('✅ Withdrawal transaction broadcasted:', result.txid);

    return Response.json({
      success: true,
      txId: result.txid,
      amount: amount,
      userAddress: userAddress
    });

  } catch (error) {
    console.error('❌ Withdrawal API error:', error);
    return Response.json({ 
      error: 'Withdrawal failed', 
      details: error.message 
    }, { status: 500 });
  }
}