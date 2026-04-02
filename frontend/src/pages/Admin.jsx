import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useElection } from '../hooks/useElection';
import { useVoter } from '../hooks/useVoter';

const Admin = () => {
  const { phase, getPhase, advancePhase, addCandidate } = useElection();
  const { registerVoter } = useVoter();

  const [address, setAddress] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');

  useEffect(() => {
    getPhase();
  }, [getPhase]);

  const handleAdvancePhase = async () => {
    await advancePhase(toast);
    getPhase(); 
  };

  const handleRegisterVoter = async (e) => {
    e.preventDefault();
    if (!address) return toast.error('Enter a valid Ethereum address');
    const success = await registerVoter(address, toast);
    if (success) setAddress('');
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName || !candidateParty) return toast.error('Enter all candidate details');
    const success = await addCandidate(candidateName, candidateParty, toast);
    if (success) {
      setCandidateName('');
      setCandidateParty('');
    }
  };

  const PHASES = ['SETUP', 'REGISTRATION', 'VOTING', 'ENDED'];

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Election Administration</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold mb-4">Phase Management</h2>
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <span className="text-gray-500 font-medium">Current Phase:</span>
            <span className="ml-2 font-bold text-blue-600 text-lg">{PHASES[phase]}</span>
          </div>
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
              disabled={phase !== 0}
            />
            <input 
              type="text" 
              placeholder="Party Affiliation" 
              value={candidateParty}
              onChange={(e) => setCandidateParty(e.target.value)}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={phase !== 0}
            />
            <button 
              type="submit"
              disabled={phase !== 0}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                phase !== 0 ? 'bg-gray-300 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Register Candidate
            </button>
            {phase !== 0 && <p className="text-sm text-red-500">Candidates can only be added during SETUP phase.</p>}
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
