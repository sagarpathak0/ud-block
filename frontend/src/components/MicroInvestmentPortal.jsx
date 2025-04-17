import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TextField, Button, Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { ethers } from 'ethers';

function MicroInvestmentPortal({ contractService }) {
  const [balance, setBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(''); // Track specific loading action
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pendingTxs, setPendingTxs] = useState([]);
  
  // Use a ref to track initial load
  const initialLoadDone = useRef(false);

  // Remove loadingAction from the dependencies to break the cycle
  const loadBalances = useCallback(async () => {
    if (loadingAction) return; // Prevent concurrent calls
    
    setLoadingAction('balances');
    try {
      const investmentBalance = await contractService.getInvestmentBalance();
      const userTokenBalance = await contractService.getTokenBalance();
      setBalance(investmentBalance);
      setTokenBalance(userTokenBalance);
    } catch (error) {
      console.error("Error loading balances:", error);
    } finally {
      setLoadingAction('');
    }
  }, [contractService]); // Remove loadingAction from here

  async function handleDeposit() {
    if (loadingAction) return;
    setLoadingAction('deposit');
    
    try {
      // First approve tokens
      const approveTx = await contractService.approveTokens(amount);
      
      // Then deposit
      const depositTx = await contractService.depositForInvestment(amount);
      
      setAmount('');
      await loadBalances();
    } catch (error) {
      console.error("Error depositing:", error);
    } finally {
      setLoadingAction('');
    }
  }

  async function handleWithdraw() {
    if (loadingAction) return;
    setLoadingAction('withdraw');
    
    try {
      await contractService.withdrawInvestment(withdrawAmount);
      setWithdrawAmount('');
      await loadBalances();
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setLoadingAction('');
    }
  }

  async function mintTestTokens() {
    if (loadingAction) return;
    setLoadingAction('get-tokens');
    
    try {
      await contractService.getTestTokens();
      await loadBalances();
      alert("Test tokens received successfully!");
    } catch (error) {
      console.error("Error getting tokens:", error);
      if (error.message.includes("Please wait before requesting")) {
        alert("You must wait 1 hour between token requests");
      } else {
        alert(`Failed to get tokens: ${error.message}`);
      }
    } finally {
      setLoadingAction('');
    }
  }

  const getTestTokens = async () => {
    try {
      setLoading(true);
      
      // Check if wallet is connected
      if (!contractService.isInitialized) {
        console.log("Contract service not initialized, attempting to reconnect...");
        
        // Check if window.ethereum exists
        if (!window.ethereum) {
          throw new Error("MetaMask not installed. Please install MetaMask to use this feature.");
        }
        
        // Try to reconnect
        const provider = new ethers.BrowserProvider(window.ethereum);
        await contractService.initialize(provider);
        
        if (!contractService.isInitialized) {
          throw new Error("Failed to initialize contract service. Please connect your wallet first.");
        }
      }
      
      // Now request tokens
      await contractService.getTestTokens();
      
      // Update token balance
      const balance = await contractService.getTokenBalance();
      setTokenBalance(balance);
      
      alert("Tokens received successfully!");
    } catch (error) {
      console.error("Failed to get tokens:", error);
      alert(`Failed to get tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Use the ref pattern for the useEffect to control when it runs
  useEffect(() => {
    // Only run this effect if contractService is available and we haven't loaded yet
    if (contractService && !initialLoadDone.current && !loadingAction) {
      initialLoadDone.current = true;
      loadBalances();
    }
  }, [contractService, loadBalances, loadingAction]);

  // Add a separate effect to handle manual refreshes without causing loops
  useEffect(() => {
    // This will handle updates when transactions complete
    const refreshAfterAction = async () => {
      if (!loadingAction && initialLoadDone.current) {
        await loadBalances();
      }
    };
    
    refreshAfterAction();
  }, [pendingTxs]); // Only depend on the transactions list

  // Helper function to check if a specific action is loading
  const isLoading = (action) => loadingAction === action;
  // Check if any action is loading
  const anyLoading = Boolean(loadingAction);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Micro Investment Portal</Typography>
      
      {/* Balance Display with Loading Indicator */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">Token Balance:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">{tokenBalance} TEST</Typography>
                {isLoading('balances') && (
                  <CircularProgress size={20} sx={{ ml: 1 }} />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">Investment Balance:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">{balance} TEST</Typography>
                {isLoading('balances') && (
                  <CircularProgress size={20} sx={{ ml: 1 }} />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Deposit Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Make a Micro Deposit</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth
                type="number"
                label="Amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={anyLoading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDeposit}
                disabled={!amount || anyLoading}
                fullWidth
                sx={{ height: '100%', position: 'relative' }}
              >
                {isLoading('deposit') ? 'Processing...' : 'Deposit'}
                {isLoading('deposit') && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Withdraw Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Withdraw Funds</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField 
                fullWidth
                type="number"
                label="Amount" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={anyLoading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || anyLoading}
                fullWidth
                sx={{ height: '100%', position: 'relative' }}
              >
                {isLoading('withdraw') ? 'Processing...' : 'Withdraw'}
                {isLoading('withdraw') && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained"
          color="warning" 
          onClick={mintTestTokens}
          disabled={anyLoading}
          sx={{ position: 'relative' }}
        >
          {isLoading('get-tokens') ? 'Getting Tokens...' : 'Get Test Tokens'}
          {isLoading('get-tokens') && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Button>

        <Button 
          variant="outlined"
          color="info" 
          onClick={getTestTokens}
          disabled={anyLoading}
          sx={{ position: 'relative' }}
        >
          {isLoading('debug') ? 'Debugging...' : 'Debug Contract State'}
          {isLoading('debug') && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Button>

        {/* Debug Tokens Button */}
        <Button 
          variant="outlined"
          color="info"
          onClick={async () => {
            try {
              console.log("Testing token contract...");
              
              // Check if contract is initialized
              console.log("Contract initialized:", contractService.isInitialized);
              
              // Check if token contract exists
              console.log("Token contract address:", 
                contractService.contracts.testToken ? 
                await contractService.contracts.testToken.getAddress() : 
                "Not initialized");
              
              // Get account address
              const address = await contractService.signer.getAddress();
              console.log("Current account:", address);
              
              // Check token details
              try {
                const symbol = await contractService.contracts.testToken.symbol();
                const name = await contractService.contracts.testToken.name();
                const decimals = await contractService.contracts.testToken.decimals();
                console.log(`Token: ${name} (${symbol}), Decimals: ${decimals}`);
              } catch (err) {
                console.error("Error getting token details:", err);
              }
              
              // Check raw balance
              try {
                const balance = await contractService.contracts.testToken.balanceOf(address);
                console.log("Raw balance:", balance.toString());
                console.log("Formatted balance:", ethers.formatEther(balance));
              } catch (err) {
                console.error("Error getting balance:", err);
              }
              
              // Try to directly call the faucet function
              try {
                console.log("Available functions:", 
                  contractService.contracts.testToken.interface.fragments
                    .filter(f => f.type === 'function')
                    .map(f => f.name)
                );
              } catch (err) {
                console.error("Error listing functions:", err);
              }
              
            } catch (error) {
              console.error("Debug error:", error);
            }
          }}
          sx={{ ml: 2 }}
        >
          Debug Tokens
        </Button>
      </Box>
    </div>
  );
}

export default MicroInvestmentPortal;