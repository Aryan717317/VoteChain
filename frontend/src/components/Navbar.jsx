import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import { formatAddress } from '../utils/formatAddress';

const Navbar = () => {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-wider">
          Vote<span className="text-blue-500">Chain</span>
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/vote" className="hover:text-blue-400 transition-colors">Vote</Link>
          <Link to="/results" className="hover:text-blue-400 transition-colors">Results</Link>
          <Link to="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>
          
          <button 
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {account ? formatAddress(account) : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
