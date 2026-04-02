import { useEffect, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { WalletContext } from '../context/WalletContext';
import { useElection } from '../hooks/useElection';
import { useVoter } from '../hooks/useVoter';
import { useResults } from '../hooks/useResults';
import CandidateCard from '../components/CandidateCard';

const Vote = () => {
  const { account } = useContext(WalletContext);
  const { phase, getPhase } = useElection();
  const { isRegistered, hasVoted, checkVoterRegistration, castVote } = useVoter();
  const { candidates, getResults } = useResults();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPhase();
    getResults();
  }, [getPhase, getResults]);

  useEffect(() => {
    if (account) {
      checkVoterRegistration(account);
    }
  }, [account, checkVoterRegistration]);

  const handleVote = async (id) => {
    if (!account) return toast.error('Please connect your wallet first.');
    if (!isRegistered) return toast.error('You are not registered to vote.');
    if (hasVoted) return toast.error('You have already voted.');
    if (phase !== 2) return toast.error('Election is not in the VOTING phase.');
    
    setLoading(true);
    await castVote(id, toast);
    setLoading(false);
  };

  const PHASES = ['SETUP', 'REGISTRATION', 'VOTING', 'ENDED'];

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cast Your Vote</h1>
          <p className="text-gray-600">Select a candidate below to securely cast your vote on the blockchain.</p>
        </div>
        <div className="text-right">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-gray-500 font-medium text-sm block">Current Phase</span>
            <span className="font-bold text-blue-600">{PHASES[phase]}</span>
          </div>
        </div>
      </div>

      {!account && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-8 font-medium">
          Please connect your MetaMask wallet to participate in the election.
        </div>
      )}

      {account && !isRegistered && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg mb-8 font-medium">
          You are not currently registered to vote in this election. Contact the administrator.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <CandidateCard 
            key={candidate.id} 
            candidate={candidate} 
            onVote={handleVote}
            disabled={loading || hasVoted || phase !== 2 || !isRegistered}
            isVoted={hasVoted} // Can be extended to track EXACTLY who they voted for if stored
          />
        ))}
      </div>
      
      {candidates.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-lg">
          No candidates available yet.
        </div>
      )}
    </div>
  );
};

export default Vote;
