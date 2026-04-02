import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';
import { handleTransaction } from '../utils/txHelpers';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export const useElection = () => {
  const contracts = useContracts();
  const [phase, setPhase] = useState(null); // Changed from 0 to null to indicate 'loading'
  const [error, setError] = useState(false);

  const getPhase = useCallback(async () => {
    if (!contracts?.Election) return;
    try {
      const currentPhase = await contracts.Election.currentPhase();
      setPhase(Number(currentPhase));
      setError(false);
    } catch (err) {
      console.error('Failed to fetch phase:', err);
      setError(true);
    }
  }, [contracts?.Election]);

  const checkNetwork = async (toast) => {
    if (!contracts?.Election?.runner?.provider) {
      toast.error('Blockchain not connected. Please connect your wallet.');
      return false;
    }
    const network = await contracts.Election.runner.provider.getNetwork();
    if (network.chainId.toString() !== CONTRACT_ADDRESSES.NETWORK_ID) {
      toast.error(`Wrong Network! Please switch to Hardhat (Chain ID: ${CONTRACT_ADDRESSES.NETWORK_ID})`);
      return false;
    }
    return true;
  };

  const advancePhase = async (toast) => {
    if (!contracts?.Election) return false;
    if (!(await checkNetwork(toast))) return false;
    
    try {
      const currentPhase = await contracts.Election.currentPhase();
      return await handleTransaction(contracts.Election.setPhase(Number(currentPhase) + 1), toast, 'Phase advanced!');
    } catch (err) {
      toast.error('Failed to read phase status.');
      return false;
    }
  };

  const addCandidate = async (name, party, toast) => {
    if (!contracts?.Election) return false;
    if (!(await checkNetwork(toast))) return false;

    try {
      const currentPhase = await contracts.Election.currentPhase();
      if (Number(currentPhase) > 1) {
        toast.error('Candidates can only be added during SETUP or REGISTRATION phase.');
        return false;
      }
    } catch (err) {
      toast.error('Failed to verify phase.');
      return false;
    }

    const fullName = party ? `${name} (${party})` : name;
    return await handleTransaction(contracts.Election.addCandidate(fullName), toast, 'Candidate added!');
  };

  const resetPhase = async (toast) => {
    if (!contracts?.Election) return false;
    if (!(await checkNetwork(toast))) return false;
    return await handleTransaction(contracts.Election.resetPhase(), toast, 'Election phase reset to SETUP!');
  };

  return { phase, error, getPhase, advancePhase, addCandidate, resetPhase };
};
