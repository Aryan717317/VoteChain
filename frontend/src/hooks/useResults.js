import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';

export const useResults = () => {
  const contracts = useContracts();
  const [candidates, setCandidates] = useState([]);

  const getResults = useCallback(async () => {
    if (!contracts) return;
    try {
      const data = await contracts.Election.getAllCandidates();
      const formatted = data.map((c, index) => ({
        id: index,
        name: c.name,
        party: c.party,
        voteCount: Number(c.voteCount)
      }));
      setCandidates(formatted);
    } catch (err) {
      console.error(err);
    }
  }, [contracts]);

  return { candidates, getResults };
};
