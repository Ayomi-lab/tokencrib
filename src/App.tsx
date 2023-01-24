import './App.css';
import MintNft from './MintNft';
import MintToken from './MintToken';
import SendSol from './SendSol';
function App() {
  return (
    <>
    <div className="Heading">
      <h1> TOKEN CRIB</h1>
    </div>
    <div className="App">
        <header className="App-header">
          <MintToken />
          <MintNft />
          <SendSol />
        </header>
    </div></>
  );
}

export default App;
