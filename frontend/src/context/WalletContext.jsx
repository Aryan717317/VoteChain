import { createContext, useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import toast from 'react-hot-toast';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // To be checked later if needed

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new BrowserProvider(window.ethereum);
        const accounts = await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        setAccount(accounts[0]);
        setProvider(_provider);
        setSigner(_signer);
      } catch (err) {
        toast.error('Failed to connect wallet.');
      }
    } else {
      toast.error('Please install MetaMask!');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          connectWallet(); // refresh signer
        } else {
          setAccount(null);
          setSigner(null);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, provider, signer, connectWallet, isOwner }}>
      {children}
    </WalletContext.Provider>
  );
};
