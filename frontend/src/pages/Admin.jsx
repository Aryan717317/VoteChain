import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useElection } from '../hooks/useElection';
import { useVoter } from '../hooks/useVoter';
import { WalletContext } from '../context/WalletContext';

const Admin = () => {
  const { phase, error, getPhase, advancePhase, addCandidate, resetPhase, adminAddress } = useElection();
  const { registerVoter } = useVoter();
  const { account, connectWallet } = useContext(WalletContext);

  const [address, setAddress] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');

  useEffect(() => {
    getPhase();
  }, [getPhase]);

  const isAdminConnected = account && adminAddress && account.toLowerCase() === adminAddress.toLowerCase();

  const handleAdvancePhase = async () => {
    if (!isAdminConnected) return toast.error("Only the election admin can perform this action.");
    try {
      await advancePhase(toast);
      getPhase(); 
    } catch (e) {
      console.error(e);
      toast.error(`UI Error: ${e.message}`);
    }
  };

  const handleResetPhase = async () => {
    if (!isAdminConnected) return toast.error("Only the election admin can perform this action.");
    if (window.confirm("Are you sure you want to reset the election back to SETUP phase?")) {
      try {
        await resetPhase(toast);
        getPhase();
      } catch (e) {
        console.error(e);
        toast.error(`UI Error: ${e.message}`);
      }
    }
  };

  const handleRegisterVoter = async (e) => {
    e.preventDefault();
    if (!isAdminConnected) return toast.error("Only the election admin can perform this action.");
    if (!address) return toast.error('Enter a valid Ethereum address');
    try {
      const success = await registerVoter(address, toast);
      if (success) setAddress('');
    } catch (e) {
      console.error(e);
      toast.error(`UI Error: ${e.message}`);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!isAdminConnected) return toast.error("Only the election admin can perform this action.");
    if (!candidateName || !candidateParty) return toast.error('Enter all candidate details');
    try {
      const success = await addCandidate(candidateName, candidateParty, toast);
      if (success) {
        setCandidateName('');
        setCandidateParty('');
      }
    } catch (e) {
      console.error(e);
      toast.error(`UI Error: ${e.message}`);
    }
  };

  const PHASES = ['SETUP', 'REGISTRATION', 'VOTING', 'ENDED'];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
      <h1 className="text-4xl font-bold mb-8">Election Administration</h1>

      {/* Connection Guards */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-red-800 font-medium">
            Error: Could not connect to the election contract. Please check if your MetaMask is on the local network (31337) and that you have deployed the contracts.
          </p>
        </div>
      )}

      {account && adminAddress && !isAdminConnected && !error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded shadow-sm">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied: Not Admin</h2>
          <p className="text-red-700 mb-2">
            The connected wallet is <strong>{account}</strong>, but the election admin is <strong>{adminAddress}</strong>.
          </p>
          <p className="text-red-700 font-medium">
            Please switch your MetaMask account to the admin address to manage the election!
          </p>
        </div>
      )}

      {phase === null && !error && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-xl p-8 shadow-2xl">
          <div className="text-center max-w-sm">
            {!account ? (
              <>
                <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Admin Access Restricted</h2>
                <p className="text-gray-600 mb-8">Please connect your authorized administrator wallet to manage the election.</p>
                <button 
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
                >
                  Connect Admin Wallet
                </button>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                <h2 className="text-xl font-bold mb-2">Syncing with Blockchain</h2>
                <p className="text-gray-600">Verifying election state and permissions...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress Indicator */}



      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold mb-4">Phase Management</h2>
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="text-gray-500 font-medium">Current Phase:</span>
            <span className="ml-2 font-bold text-blue-600 text-lg">
              {phase !== null ? PHASES[phase] : 'Connecting...'}
            </span>
          </div>
          <div className="flex gap-3">
            {phase > 0 && (
              <button 
                onClick={handleResetPhase}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-bold transition-all"
              >
                Reset to SETUP
              </button>
            )}
            <button 
              onClick={handleAdvancePhase}
              disabled={phase >= 3}
              className={`px-6 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 ${
                phase === 2 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : phase >= 3 
                    ? 'bg-gray-300 text-gray-500' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {phase === 2 ? 'Close Polls & End Election' : `Advance to ${PHASES[phase + 1] || 'None'}`}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Add Candidate</h2>
          <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Candidate Name" 
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={phase > 1}
            />
            <input 
              type="text" 
              placeholder="Party Affiliation" 
              value={candidateParty}
              onChange={(e) => setCandidateParty(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={phase > 1}
            />
            <button 
              type="submit"
              disabled={phase > 1}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                phase > 1 ? 'bg-gray-300 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Register Candidate
            </button>
            {phase > 1 && <p className="text-sm text-red-500">Candidates can only be added during SETUP or REGISTRATION phase.</p>}
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Whitelist Voter</h2>
          <form onSubmit={handleRegisterVoter} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Voter ETH Address (0x...)" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={phase !== 1}
            />
            <button 
              type="submit"
              disabled={phase !== 1}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                phase !== 1 ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Whitelist Address
            </button>
            {phase !== 1 && <p className="text-sm text-red-500">Voters can only be whitelisted during REGISTRATION phase.</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
