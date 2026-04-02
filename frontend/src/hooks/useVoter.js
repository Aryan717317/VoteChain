import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';
import { handleTransaction } from '../utils/txHelpers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export const useVoter = () => {
  const contracts = useContracts();
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const checkNetwork = async (toast) => {
    try {
      const runner = contracts?.Election?.runner;
      let provider = runner?.provider;
      if (!provider && runner && typeof runner.getNetwork === 'function') {
        provider = runner;
      }

      if (!provider) {
        toast.error('Blockchain not connected. Please connect your wallet.');
        return false;
      }

      const network = await provider.getNetwork();
      if (network.chainId.toString() !== CONTRACT_ADDRESSES.NETWORK_ID) {
        toast.error(`Wrong Network! Switch to Hardhat (ID: ${CONTRACT_ADDRESSES.NETWORK_ID})`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Network check failed:", err);
      toast.error('Failed to verify network connection.');
      return false;
    }
  };

  const checkVoterRegistration = useCallback(async (address) => {
    if (!contracts?.VoterRegistry || !address) return;
    try {
      const status = await contracts.VoterRegistry.isRegistered(address);
      setIsRegistered(status);
    } catch (err) {
      console.error('Failed to fetch voter registration:', err);
    }
  }, [contracts?.VoterRegistry]);

  const registerVoter = async (address, toast) => {
    if (!contracts?.VoterRegistry) return false;
    if (!(await checkNetwork(toast))) return false;
    return await handleTransaction(contracts.VoterRegistry.registerVoter(address), toast, 'Voter whitelisted successfully!');
  };

  const castVote = async (candidateId, toast) => {
    if (!contracts?.Voting) return false;
    if (!(await checkNetwork(toast))) return false;
    
    const success = await handleTransaction(contracts.Voting.castVote(candidateId), toast, 'Vote cast successfully!');
    if (success) {
      setHasVoted(true);
    }
    return success;
  };

  return { isRegistered, hasVoted, checkVoterRegistration, registerVoter, castVote };
};
