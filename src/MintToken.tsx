import { 
  clusterApiUrl, 
  Connection, 
  PublicKey, 
  Keypair, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer, 
  Account, 
  getMint, 
  getAccount
} from '@solana/spl-token';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';
// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;


function MintToken() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate();
	let fromTokenAccount: Account; 
	let mint: PublicKey;
  const toWallet = new PublicKey("22Re63UrbY9VdDf8FLQ6KQTdMrrY5D2YoiSYTGwfdhJj");


  async function createToken() {
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    // Create new token mint
    mint = await createMint(
        connection, 
        fromWallet, 
        fromWallet.publicKey, 
        null, 
        9 // 9 here means we have a decmial of 9 0's
    );
    console.log(`Create token: ${mint.toBase58()}`);

    // Get the token account of the fromWallet address, and if it does not exist, create it
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );
    console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
  }

  async function mintToken() {      
    // Mint 1 new token to the "fromTokenAccount" account we just created
    const signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        10000000000 // 10 billion
    );
    console.log(`Mint signature: ${signature}`);
  }

  async function checkBalance() {
    // get the supply of tokens we have minted into existance
    const mintInfo = await getMint(connection, mint);
    console.log(mintInfo.supply);

    // get the amount of tokens left in the account
    const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
    console.log(tokenAccountInfo.amount);
  }

  async function sendToken() {
    // Get the token account of the toWallet address, and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);
    console.log(`toTokenAccount ${toTokenAccount.address}`);

    const signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        1000000000 // 1 billion
    );
    console.log(`finished transfer with ${signature}`);
  }


  return (
    <div className='NFT'>
        <div style={{ width: '200px', backgroundColor: 'purple', padding: '20px' }} className='sendSol2'>
        Mint Token Section
            <AwesomeButton type='danger' onPress={createToken}>CREATE TOKEN</AwesomeButton>
            <br />
            <AwesomeButton type='danger' onPress={mintToken}>MINT TOKEN</AwesomeButton>
            <br />
            <AwesomeButton type='danger' onPress={checkBalance}>CHECK BALANCE</AwesomeButton>
            <br />
            <AwesomeButton type='danger' onPress={sendToken}>SEND TOKEN</AwesomeButton>
        </div>
    </div>
  );
}

export default MintToken;