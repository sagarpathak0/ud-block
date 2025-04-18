import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers'; // Add this import
import { 
  Typography, Tabs, Tab, Box, Card, CardContent, 
  Button, TextField, Grid, CircularProgress, 
  List, ListItem, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText 
} from '@mui/material';

function InclusiveBanking({ contractService }) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const debugContract = async () => {
    try {
      // Get contract info
      const microLendingAddress = await contractService.contracts.microLending.getAddress();
      console.log("MicroLending contract:", microLendingAddress);
      
      // Get available functions
      console.log("Available functions:", 
        contractService.contracts.microLending.interface.fragments
          .filter(f => f.type === 'function')
          .map(f => `${f.name}(${f.inputs.map(i => i.type).join(',')})`)
      );
      
      // Try to call a simpler view function first
      const userAddress = await contractService.signer.getAddress();
      console.log("Current user:", userAddress);
      
      // Try to debug the offerLoan function specifically
      console.log("Debugging offerLoan function:", 
        contractService.contracts.microLending.interface.getFunction("offerLoan")
      );
      
      alert("Check console for debug information");
    } catch (error) {
      console.error("Debug error:", error);
      alert("Debug error: " + error.message);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Inclusive Banking</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="P2P Microloans" />
          <Tab label="Community Savings" />
          <Tab label="Learn Finance" />
        </Tabs>
      </Box>

      {tabValue === 0 && <MicroLoansTab contractService={contractService} />}
      {tabValue === 1 && <CommunitySavingsTab contractService={contractService} />}
      {tabValue === 2 && <FinancialEducationTab contractService={contractService} />}

      <Button
        variant="outlined"
        color="warning"
        onClick={debugContract}
        sx={{ mt: 2 }}
      >
        Debug Contract
      </Button>
    </div>
  );
}

// P2P Microloans Tab
function MicroLoansTab({ contractService }) {
  const [loans, setLoans] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('5'); // 5% default
  const [duration, setDuration] = useState('30'); // 30 days default
  const [creditScore, setCreditScore] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date()); // Add this state to track refresh time
  const hasLoadedRef = React.useRef(false); // track if we've loaded once
  const [userAddress, setUserAddress] = useState(''); // Track user address

  const isLoadingRef = useRef(false);
  const initialLoadDone = useRef(false);

  // Modify your loadLoans function to prevent recursive calls
  const loadLoans = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent concurrent calls
    
    try {
      console.log("Loading loans...");
      setLoading(true);
      
      if (!contractService?.contracts?.microLending) {
        console.log("MicroLending contract not initialized yet");
        return;
      }

      // Get total loans count - try both possible function names
      let count = 0;
      try {
        // Try different function names that might exist on the contract
        if (typeof contractService.getLoanCount === 'function') {
          count = await contractService.getLoanCount();
        } 
        else if (typeof contractService.microLending.loanCount === 'function') {
          count = await contractService.microLending.loanCount();
        }
        else {
          // Log available functions to help debug
          const functions = contractService.microLending.interface.fragments
            .filter(f => f.type === 'function')
            .map(f => f.name);
          console.log("Available loan functions:", functions);
          throw new Error("Loan count function not found");
        }
      } catch (error) {
        console.error("Failed to get loan count:", error);
        return;
      }

      console.log(`Found ${count} loans`);
      
      const loanPromises = [];
      for (let i = 0; i < count; i++) {
        loanPromises.push(contractService.getLoan(i));
      }
      
      const loanResults = await Promise.all(loanPromises);
      console.log("All loans:", loanResults);
      
      // Get user address
      const userAddress = await contractService.signer.getAddress();
      setUserAddress(userAddress);
      
      // Available loans - not taken by anyone
      const availableLoans = loanResults
        .map((loan, index) => loan ? {...loan, id: index} : null)
        .filter(loan => 
          loan && 
          loan.active === true && 
          loan.borrower === '0x0000000000000000000000000000000000000000'
        );
      
      // My loans - separate active and repaid loans
      const myActiveLoans = loanResults
        .map((loan, index) => loan ? {...loan, id: index} : null)
        .filter(loan => 
          loan && 
          loan.active === true && 
          !loan.repaid &&
          loan.borrower.toLowerCase() === userAddress.toLowerCase()
        );

      const myRepaidLoans = loanResults
        .map((loan, index) => loan ? {...loan, id: index} : null)
        .filter(loan => 
          loan && 
          loan.repaid === true &&
          loan.borrower.toLowerCase() === userAddress.toLowerCase()
        );

      console.log("Available loans:", availableLoans);
      console.log("My active loans:", myActiveLoans);
      console.log("My repaid loans:", myRepaidLoans);
      
      setLoans(availableLoans);
      setMyLoans([...myActiveLoans, ...myRepaidLoans]); // Combine active and repaid
      
      // Add this section to load credit score
      try {
        const score = await contractService.microLending.getCreditScore(userAddress);
        console.log("User credit score:", Number(score));
        setCreditScore(Number(score));
      } catch (err) {
        console.log("Credit score not available:", err.message);
      }
    } catch (error) {
      console.error("Failed to load loans:", error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date()); // Update refresh timestamp
    }
  }, [contractService]);

  // Replace your useEffect with this:
  // Load loans when component mounts
  useEffect(() => {
    // Only load if contract is available and not already loading
    if (contractService && !initialLoadDone.current && !isLoadingRef.current) {
      const fetchData = async () => {
        isLoadingRef.current = true;
        try {
          await loadLoans();
          initialLoadDone.current = true;
        } finally {
          isLoadingRef.current = false;
        }
      };
      fetchData();
    }
  }, [contractService]); // Only depend on contractService

  // Function to create a loan
  async function handleOfferLoan() {
    if (!loanAmount || !interestRate || !duration) {
      alert("Please fill all fields");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Offering loan:", { loanAmount, interestRate, duration });
      await contractService.offerLoan(loanAmount, Number(interestRate), Number(duration));
      alert("Loan offered successfully!");
      setLoanAmount('');
      loadLoans(); // Reload loans
    } catch (error) {
      console.error("Failed to offer loan:", error);
      alert(`Failed to offer loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Function to take a loan
  async function handleTakeLoan(loanId) {
    setLoading(true);
    try {
      console.log(`Taking loan ${loanId}...`);
      await contractService.takeLoan(loanId);
      alert("Loan taken successfully! The funds have been transferred to your wallet.");
      await loadLoans(); // Reload the loans list
    } catch (error) {
      console.error("Failed to take loan:", error);
      alert(`Failed to take loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Function to repay a loan
  async function handleRepayLoan(loanId) {
    setLoading(true);
    try {
      console.log(`Repaying loan ${loanId}...`);
      
      // First check loan status
      await contractService.checkLoanStatus(loanId);
      
      await contractService.repayLoan(loanId);
      alert("Loan repaid successfully!");
      
      // Reload loans and credit score
      await loadLoans();
      
      // Specifically update credit score
      const newScore = await contractService.getCreditScore();
      setCreditScore(newScore);
    } catch (error) {
      console.error("Failed to repay loan:", error);
      
      // Provide better error message
      if (error.message.includes("Loan is not active")) {
        alert("This loan cannot be repaid - it may have already been repaid or marked as defaulted.");
      } else {
        alert(`Failed to repay loan: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Update handleCancelLoan to use the service method
  async function handleCancelLoan(loanId) {
    setLoading(true);
    try {
      console.log(`Attempting to cancel loan ${loanId}...`);
      await contractService.cancelLoan(loanId);
      alert(`Loan #${loanId} has been successfully canceled.`);
      await loadLoans();
    } catch (error) {
      console.error("Failed to cancel loan:", error);
      alert(`Failed to cancel loan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function openLoanDialog(loan, index) {
    setSelectedLoan({...loan, id: index});
    setDialogOpen(true);
  }

  function closeLoanDialog() {
    setDialogOpen(false);
  }

  // Update the verification in confirmTakeLoan
  async function confirmTakeLoan() {
    if (!selectedLoan) return;
    
    setDialogOpen(false);
    setLoading(true);
    
    try {
      // First verify the loan is still available
      const loanStatus = await contractService.checkLoanStatus(selectedLoan.id);
      console.log("Current loan state before taking:", loanStatus);
      
      // Make sure we have valid loan status before proceeding
      if (!loanStatus) {
        alert("Could not verify loan status. Please try again.");
        setLoading(false);
        return;
      }
      
      if (!loanStatus.active) {
        alert("This loan is no longer active. It may have been taken by someone else or deactivated.");
        await loadLoans();
        return;
      }
      
      if (loanStatus.borrower !== '0x0000000000000000000000000000000000000000') {
        alert("This loan has already been taken by someone else.");
        await loadLoans();
        return;
      }
      
      // Check if this is self-lending (dev mode)
      const userAddress = await contractService.signer.getAddress();
      const isSelfLending = selectedLoan.lender.toLowerCase() === userAddress.toLowerCase();
      
      if (isSelfLending) {
        console.log("DEV MODE: Taking your own loan");
      }
      
      // Now proceed with taking the loan
      await handleTakeLoan(selectedLoan.id);
    } catch (error) {
      console.error("Failed during loan verification:", error);
      alert(`Failed to take loan: ${error.message}`);
      setLoading(false);
    }
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>Peer-to-Peer Microloans</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ 
            display: 'inline-block', 
            p: 1, 
            border: '1px dashed', 
            borderRadius: 1,
            bgcolor: 'rgba(25, 118, 210, 0.08)' 
          }}
        >
          🛠️ Development Mode: Self-borrowing enabled for testing
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Offer a Loan</Typography>
              <TextField 
                label="Amount" 
                type="number"
                fullWidth
                margin="normal"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
              <TextField 
                label="Interest Rate (%)" 
                type="number"
                fullWidth
                margin="normal"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <TextField 
                label="Duration (Days)" 
                type="number"
                fullWidth
                margin="normal"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Button 
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading || !loanAmount}
                onClick={handleOfferLoan}
              >
                {loading ? <CircularProgress size={24} /> : 'Offer Loan'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Your Credit Score</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Typography variant="h3" sx={{ mr: 2 }}>{creditScore}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Based on your loan repayment history
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Button
        variant="outlined"
        color="info"
        onClick={async () => {
          console.log("Debug - contractService:", contractService);
          await contractService.debug(); // Contract debug
          
          // Add manual loan debugging
          const count = await contractService.getLoanCount();
          console.log(`Total loans in contract: ${count}`);
          
          for (let i = 0; i < count; i++) {
            const loan = await contractService.getLoan(i);
            console.log(`Loan ${i}:`, loan);
          }
        }}
        sx={{ mt: 2, mb: 2 }}
      >
        Debug Contract Info
      </Button>

      <Button
        variant="outlined"
        color="warning"
        onClick={() => {
          console.log("Available contract methods:");
          console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(contractService.microLending)));
        }}
        sx={{ ml: 2 }}
      >
        Show Contract Methods
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={async () => {
          try {
            console.log("Contract address:", await contractService.microLending.getAddress());
            console.log("Contract interface:", contractService.microLending.interface);
            console.log("Available functions:", contractService.microLending.interface.fragments
              .filter(f => f.type === 'function')
              .map(f => f.name));
            alert("Contract info logged to console");
          } catch (err) {
            console.error("Contract connection error:", err);
            alert("Error accessing contract. See console for details.");
          }
        }}
        sx={{ ml: 2 }}
      >
        Check Contract Connection
      </Button>

      {/* Add this debug button to your component's UI */}
      <Button
        variant="outlined"
        color="warning"
        onClick={() => {
          if (!contractService?.microLending) {
            console.error("MicroLending contract not initialized");
            return;
          }
          
          const functions = contractService.microLending.interface.fragments
            .filter(f => f.type === 'function')
            .map(f => f.name);
            
          console.log("Available MicroLending functions:", functions);
          alert(`Available functions: ${functions.join(', ')}`);
        }}
        sx={{ ml: 2 }}
      >
        Debug Loan Functions
      </Button>

      <Button
        variant="contained"
        color="warning"
        onClick={async () => {
          try {
            // Get the contract interface
            const iface = contractService.contracts.microLending.interface;
            
            // Analyze offerLoan function signature
            const offerLoanFunc = iface.getFunction('offerLoan');
            console.log("offerLoan function signature:", offerLoanFunc);
            console.log("Parameter types:", offerLoanFunc.inputs);
            
            // Try to build transaction data manually
            const testAmount = ethers.parseEther("1");
            const testInterestRate = 50; // 0.5%
            const testDuration = 30 * 24 * 60 * 60; // 30 days in seconds
            
            const data = iface.encodeFunctionData("offerLoan", [
              testAmount,
              testInterestRate,
              testDuration
            ]);
            
            console.log("Encoded function call:", data);
            
            // Get token contract details
            const tokenAddress = await contractService.contracts.testToken.getAddress();
            console.log("Token contract address:", tokenAddress);
            
            alert("Contract analysis complete. Check console for details.");
          } catch (error) {
            console.error("Analysis error:", error);
            alert("Error analyzing contract: " + error.message);
          }
        }}
        sx={{ mt: 2, ml: 2 }}
      >
        Analyze Contract
      </Button>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Available Loans
        <Typography component="span" variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Typography>
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : loans.length === 0 ? (
        <Typography>No loans available at the moment.</Typography>
      ) : (
        <List>
          {loans.map((loan, index) => {
            // Determine if the current user is the lender
            const userIsLender = loan.lender.toLowerCase() === userAddress?.toLowerCase();
            
            return (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText 
                    primary={`${loan.amount} tokens at ${loan.interestRate}% interest`}
                    secondary={
                      <>
                        {`Duration: ${loan.duration} days | Lender: ${loan.lender.substring(0,6)}...`}
                        {userIsLender && <Typography variant="caption" color="primary" sx={{display: 'block'}}>You offered this loan</Typography>}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Show Cancel button only if the user is the lender */}
                    {userIsLender && (
                      <Button 
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelLoan(loan.id)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      variant="outlined"
                      color="primary"
                      onClick={() => openLoanDialog(loan, index)}
                      disabled={loading}
                      sx={{ ml: 1 }}
                    >
                      {userIsLender ? 'Take Own Loan (Dev Mode)' : 'Take Loan'}
                    </Button>
                  </Box>
                </ListItem>
                {index < loans.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>My Active Loans</Typography>
      {myLoans.length === 0 ? (
        <Typography>You haven't taken any loans yet.</Typography>
      ) : (
        <List>
          {myLoans.map((loan, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText 
                  primary={
                    <>
                      {`${loan.amount} tokens at ${loan.interestRate}% interest`}
                      {loan.repaid && <span style={{color: 'green', marginLeft: '8px'}}>(REPAID)</span>}
                      {!loan.active && !loan.repaid && <span style={{color: 'red', marginLeft: '8px'}}>(DEFAULTED)</span>}
                    </>
                  }
                  secondary={
                    <>
                      {`Duration: ${loan.duration} days`}
                      {loan.startTime && ` | Started: ${new Date(loan.startTime).toLocaleDateString()}`}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        Loan ID: {loan.id} | Active: {loan.active ? "Yes" : "No"} | Repaid: {loan.repaid ? "Yes" : "No"}
                      </Typography>
                    </>
                  }
                />
                {loan.active && !loan.repaid && (
                  <Button 
                    variant="contained"
                    color="primary"
                    onClick={() => handleRepayLoan(loan.id)}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    Repay Loan
                  </Button>
                )}
              </ListItem>
              {index < myLoans.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={closeLoanDialog}>
        <DialogTitle>Confirm Loan</DialogTitle>
        <DialogContent>
          {selectedLoan && (
            <DialogContentText>
              <strong>Amount:</strong> {selectedLoan.amount} tokens<br />
              <strong>Interest Rate:</strong> {selectedLoan.interestRate}%<br />
              <strong>Duration:</strong> {selectedLoan.duration} days<br />
              <strong>Lender:</strong> {selectedLoan.lender}<br /><br />
              Are you sure you want to take this loan? You will need to repay {selectedLoan.amount} tokens 
              plus {(selectedLoan.amount * selectedLoan.interestRate / 100).toFixed(2)} tokens in interest 
              within {selectedLoan.duration} days.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLoanDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmTakeLoan} 
            color="secondary" 
            variant="contained"
          >
            Take Loan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Community Savings Tab
function CommunitySavingsTab({ contractService }) {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [duration, setDuration] = useState('30'); // 30 days default

  // Load pools
  const loadPools = useCallback(async () => {
    if (!contractService) return;
    
    setLoading(true);
    try {
      console.log("Loading savings pools...");
      const count = await contractService.getPoolCount();
      console.log(`Found ${count} pools`);
      
      const poolPromises = [];
      for (let i = 0; i < count; i++) {
        poolPromises.push(contractService.getPool(i));
      }
      
      const poolResults = await Promise.all(poolPromises);
      const activePools = poolResults.filter(
        pool => pool && pool.active
      );
      
      console.log("Active pools:", activePools);
      setPools(activePools);
    } catch (error) {
      console.error("Failed to load pools:", error);
    } finally {
      setLoading(false);
    }
  }, [contractService]);

  // Function to create a pool
  async function handleCreatePool() {
    if (!poolName || !goalAmount || !duration) {
      alert("Please fill all fields");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Creating pool:", { poolName, goalAmount, duration });
      await contractService.createPool(poolName, goalAmount, Number(duration));
      alert("Savings pool created successfully!");
      setPoolName('');
      setGoalAmount('');
      loadPools(); // Reload pools
    } catch (error) {
      console.error("Failed to create pool:", error);
      alert(`Failed to create pool: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Load pools when component mounts
  useEffect(() => {
    if (contractService) {
      loadPools();
    }
  }, [contractService, loadPools]);

  return (
    <>
      <Typography variant="h5" gutterBottom>Community Savings Pools</Typography>
      
      <Button
        variant="outlined"
        color="info"
        onClick={() => {
          console.log("Debug - contractService:", contractService);
          contractService.debug(); // Add a debug method to ContractService
        }}
        sx={{ mt: 2, mb: 2 }}
      >
        Debug Contract Info
      </Button>

      {/* Community savings pools UI */}
    </>
  );
}

// Financial Education Tab
function FinancialEducationTab({ contractService }) {
  // Implementation details for financial education...
  
  return (
    <>
      <Typography variant="h5" gutterBottom>Financial Education</Typography>
      {/* Financial education modules UI */}
    </>
  );
}

export default InclusiveBanking;