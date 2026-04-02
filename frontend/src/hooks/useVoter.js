import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';
import { handleTransaction } from '../utils/txHelpers';

export const useVoter = () => {
  const contracts = useContracts();
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const checkVoterRegistration = useCallback(async (address) => {
    if (!contracts || !address) return;
    try {
      const status = await contracts.VoterRegistry.isWhitelisted(address);
      setIsRegistered(status);
    } catch (err) {
      console.error(err);
    }
  }, [contracts]);

  const registerVoter = async (address, toast) => {
    if (!contracts) return false;
    return await handleTransaction(contracts.VoterRegistry.registerVoter(address), toast, 'Voter registered successfully!');
  };

  const castVote = async (candidateId, toast) => {
    if (!contracts) return false;
    const success = await handleTransaction(contracts.Voting.castVote(candidateId), toast, 'Vote cast successfully!');
    if (success) {
      setHasVoted(true);
    }
    return success;
  };

  return { isRegistered, hasVoted, checkVoterRegistration, registerVoter, castVote };
};
