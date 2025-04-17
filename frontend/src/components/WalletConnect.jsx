import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { ethers } from 'ethers';
import { Button, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import contractService from '../services/contractService';

function WalletConnect(props) {
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug what props we're getting
  useEffect(() => {
    console.log("WalletConnect props:", props);
  }, [props]);

  // Wrap notifyParent in useCallback to avoid it changing on each render
  const notifyParent = useCallback((status, provider = null) => {
    try {
      console.log("Connection status changed to:", status);
      
      // Try the onConnected pattern (from App.jsx)
      if (typeof props.onConnected === 'function') {
        console.log("Calling onConnected with:", status);
        props.onConnected(status);
        return true;
      } 
      // Try the onConnect pattern (from App.js)
      else if (typeof props.onConnect === 'function' && provider) {
        console.log("Calling onConnect with provider");
        props.onConnect(provider);
        return true;
      }
      // Nothing worked
      else {
        console.warn("No valid connection callback found in props:", props);
        return false;
      }
    } catch (err) {
      console.error("Error notifying parent of connection:", err);
      return false;
    }
  }, [props]); // Add props as dependency

  // Now add notifyParent to the useEffect dependencies
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const networkData = await provider.getNetwork();
            setChainId(networkData.chainId.toString());
            setAccount(accounts[0].address);
            
            // Initialize contract service
            await contractService.initialize(provider);
            
            // Notify parent about connection
            notifyParent(true, provider);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };
    
    checkConnection();
  }, [notifyParent]); // Add notifyParent as dependency

  // Handle wallet connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const accounts = await provider.listAccounts();
      const networkData = await provider.getNetwork();
      
      setAccount(accounts[0].address);
      setChainId(networkData.chainId.toString());
      
      // Initialize contract service
      await contractService.initialize(provider);
      
      // Notify parent about connection
      notifyParent(true, provider);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {account ? (
        <>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Connected: {formatAddress(account)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Chain ID: {chainId}
          </Typography>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </Box>
  );
}

export default WalletConnect;