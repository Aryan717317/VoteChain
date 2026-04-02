import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';

export const useResults = () => {
  const contracts = useContracts();
  const [candidates, setCandidates] = useState([]);

  const getResults = useCallback(async () => {
    if (!contracts) return;
    try {
      const count = await contracts.Election.getCandidateCount();
      const formatted = [];
      for (let i = 0; i < count; i++) {
        const c = await contracts.Election.getCandidate(i);
        // c returns [name, voteCount]
        formatted.push({
          id: i,
          name: c.name,
          party: "Independent", // party is not in the contract Candidates array
          voteCount: Number(c.voteCount)
        });
      }
      setCandidates(formatted);
    } catch (err) {
      console.error(err);
    }
  }, [contracts]);

  return { candidates, getResults };
};
