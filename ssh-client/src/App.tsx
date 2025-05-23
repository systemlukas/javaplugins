import './App.css'; // Keep existing App.css for now, can be cleaned later
import Terminal from './components/Terminal'; // Import the Terminal component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SSH Client Interface</h1>
      </header>
      <main>
        <Terminal />
      </main>
    </div>
  );
}

export default App;
