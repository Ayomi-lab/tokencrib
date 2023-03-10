import { 
    clusterApiUrl, 
    Connection, 
    Transaction, 
    Keypair, 
    PublicKey, 
    LAMPORTS_PER_SOL, 
    sendAndConfirmTransaction, 
    SystemProgram 
} from '@solana/web3.js';
import { getAccount, 
    getAssociatedTokenAddress, 
    NATIVE_MINT, 
    createAssociatedTokenAccountInstruction, 
    createSyncNativeInstruction, 
    transfer, 
    getOrCreateAssociatedTokenAccount,
    closeAccount
} from '@solana/spl-token';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';



// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;
  
function SendSol() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        // Generate a new wallet keypair and airdrop SOL
    const fromWallet = Keypair.generate();

    let associatedTokenAccount: PublicKey;

  
        async function wrapSol() {
            const airdropSignature = await connection.requestAirdrop(
                fromWallet.publicKey,
                2 * LAMPORTS_PER_SOL,
            );
    
            await connection.confirmTransaction(airdropSignature);
            associatedTokenAccount = await getAssociatedTokenAddress(
                NATIVE_MINT,
                fromWallet.publicKey
            );
            console.log(associatedTokenAccount.toBase58())
    
            // Create token account to hold your wrapped SOL
            const ataTransaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    fromWallet.publicKey,
                    associatedTokenAccount,
                    fromWallet.publicKey,
                    NATIVE_MINT
                )
            );
    
            await sendAndConfirmTransaction(connection, ataTransaction, [fromWallet]);
    
            // Transfer SOL to associated token account and use SyncNative to update wrapped SOL balance
            const solTransferTransaction = new Transaction()
            .add(
                SystemProgram.transfer({
                    fromPubkey: fromWallet.publicKey,
                    toPubkey: associatedTokenAccount,
                    lamports: LAMPORTS_PER_SOL // the SOL that we're sending over
                }),
                createSyncNativeInstruction(
                    associatedTokenAccount
                )
            );
    
            await sendAndConfirmTransaction(connection, solTransferTransaction, [fromWallet]);
            const accountInfo = await getAccount(connection, associatedTokenAccount);
            console.log(`Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`);
        }

        async function unwrapSol() {
            const walletBalance = await connection.getBalance(fromWallet.publicKey);
            console.log(`Balance before unwrapping WSOL: ${walletBalance}`)
            await closeAccount(
                connection, 
                fromWallet, 
                associatedTokenAccount, 
                fromWallet.publicKey, 
                fromWallet
            );
            const walletBalancePostClose = await connection.getBalance(fromWallet.publicKey);
            console.log(`Balance after unwrapping WSOL: ${walletBalancePostClose}`)
        }

        async function sendSol() {
            // airdrop SOL to send
            const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    
            // Wait for airdrop confirmation
            await connection.confirmTransaction(fromAirdropSignature);
    
            // Generate a new wallet to receive newly minted token
            const toWallet = new PublicKey("22Re63UrbY9VdDf8FLQ6KQTdMrrY5D2YoiSYTGwfdhJj")
    
            // Get the token account of the fromWallet address, and if it does not exist, create it
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,
                fromWallet,
                NATIVE_MINT,
                fromWallet.publicKey
            );
    
            // Get the token account of the toWallet address, and if it does not exist, create it
            const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, NATIVE_MINT, toWallet);
    
            // Transfer the new token to the "toTokenAccount" we just created
            const signature = await transfer(
                connection,
                fromWallet,
                fromTokenAccount.address,
                toTokenAccount.address,
                fromWallet.publicKey,
                LAMPORTS_PER_SOL
            );
            console.log('Transfer tx:', signature);
        }


    return (
        <div className='NFT'>
          <div style={{ width: '200px', backgroundColor: 'white', padding: '20px' }} className = 'sendSol'>
            Send SOL Section
                <AwesomeButton type='secondary' onPress={wrapSol}>WRAP SOL</AwesomeButton>
                <br />
                <AwesomeButton type='secondary' onPress={unwrapSol}>UNWRAP SOL</AwesomeButton>
                <br />
                <AwesomeButton type='secondary' onPress={sendSol}>SEND SOL</AwesomeButton>
            </div>
        </div>
    );
}
  export default SendSol;