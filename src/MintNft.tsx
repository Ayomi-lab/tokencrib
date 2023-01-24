import { clusterApiUrl, 
    Connection, 
    PublicKey, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    Transaction, 
    sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    Account, 
    createSetAuthorityInstruction, 
    AuthorityType
} from '@solana/spl-token';
import { AwesomeButton } from 'react-awesome-button';
import 'react-awesome-button/dist/styles.css';



// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;
  
function MintNft() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate();
	let fromTokenAccount: Account; 
	let mint: PublicKey;


  async function createNft() {
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    // Create new NFT mint
    mint = await createMint(
        connection, 
        fromWallet, 
        fromWallet.publicKey, 
        null, 
        0 // only allow whole tokens
    );
        
    console.log(`Create NFT: ${mint.toBase58()}`);

    // Get the NFT account of the fromWallet address, and if it does not exist, create it
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    console.log(`Create NFT Account: ${fromTokenAccount.address.toBase58()}`);
    }

    async function mintNft() {
        // Mint 1 new token to the "fromTokenAccount" account we just created
        const signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            1
        );
        console.log(`Mint signature: ${signature}`);
    }
    async function lockNft() {
        // Create our transaction to change minting permissions
        let transaction = new Transaction().add(createSetAuthorityInstruction(
            mint,
            fromWallet.publicKey,
            AuthorityType.MintTokens,
            null
        ));
      
        // Send transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
        console.log(`Lock signature: ${signature}`);
    }
  
  
    return (
        <div  className='NFT'>
          <div style={{ width: '200px', backgroundColor: 'orange', padding: '20px' }} className = 'mint'>
          Mint NFT Section
                <AwesomeButton onPress={createNft}>Create NFT</AwesomeButton>
                <br />
                <AwesomeButton onPress={mintNft}>Mint NFT</AwesomeButton>
                <br />
                <AwesomeButton onPress={lockNft}>Lock NFT</AwesomeButton>
            </div>
        </div>
    );
}
  export default MintNft;