import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto mt-16 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
        Secure, Transparent, <span className="text-blue-600">Decentralized</span> Voting
      </h1>
      <p className="text-xl text-gray-600 mb-10">
        VoteChain empowers communities to host verifiable elections on the Ethereum blockchain. No tampering, no fraud.
      </p>
      
      <div className="flex gap-4 justify-center">
        <Link 
          to="/vote" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1"
        >
          Cast Your Vote
        </Link>
        <Link 
          to="/results" 
          className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm transition-all"
        >
          View Results
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-blue-500 text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Secure</h3>
          <p className="text-gray-600">Cryptographically secured voting process backed by Ethereum smart contracts.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-blue-500 text-3xl mb-4">👁️</div>
          <h3 className="text-xl font-bold mb-2">Transparent</h3>
          <p className="text-gray-600">Every vote is recorded on the public ledger. Results are verifiable by anyone.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-blue-500 text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Immutable</h3>
          <p className="text-gray-600">Once cast, votes cannot be altered or deleted. Your voice permanently matters.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
