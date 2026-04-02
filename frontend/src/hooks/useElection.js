import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';
import { handleTransaction } from '../utils/txHelpers';

export const useElection = () => {
  const contracts = useContracts();
  const [phase, setPhase] = useState(0);

  const getPhase = useCallback(async () => {
    if (!contracts) return;
    try {
      const currentPhase = await contracts.Election.currentPhase();
      setPhase(Number(currentPhase));
    } catch (err) {
      console.error(err);
    }
  }, [contracts]);

  const advancePhase = async (toast) => {
    if (!contracts) return false;
    const currentPhase = await contracts.Election.currentPhase();
    return await handleTransaction(contracts.Election.setPhase(Number(currentPhase) + 1), toast, 'Phase advanced!');
  };

  const addCandidate = async (name, party, toast) => {
    if (!contracts) return false;
    const fullName = party ? `${name} (${party})` : name;
    return await handleTransaction(contracts.Election.addCandidate(fullName), toast, 'Candidate added!');
  };

  return { phase, getPhase, advancePhase, addCandidate };
};
