import { useContext, useMemo } from 'react';
import { Contract } from 'ethers';
import { WalletContext } from '../context/WalletContext';
import { CONTRACT_ADDRESSES } from '../config/contracts';

import ElectionABI from '../abis/Election.json';
import VoterRegistryABI from '../abis/VoterRegistry.json';
import VotingABI from '../abis/Voting.json';

export const useContracts = () => {
  const { provider, signer } = useContext(WalletContext);

  const contracts = useMemo(() => {
    if (!provider || !CONTRACT_ADDRESSES.ELECTION) return null;
    const runner = signer || provider;
    return {
      Election: new Contract(CONTRACT_ADDRESSES.ELECTION, ElectionABI.abi, runner),
      VoterRegistry: new Contract(CONTRACT_ADDRESSES.VOTER_REGISTRY, VoterRegistryABI.abi, runner),
      Voting: new Contract(CONTRACT_ADDRESSES.VOTING, VotingABI.abi, runner)
    };
  }, [provider, signer]);

  return contracts;
};
