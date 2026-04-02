import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <WalletProvider>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Toaster position="bottom-right" />
          <Navbar />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vote" element={<Vote />} />
              <Route path="/results" element={<Results />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </WalletProvider>
    </Router>
  );
}

export default App;
