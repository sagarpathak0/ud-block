import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers'; // Add this import
import {
  Typography, Button, TextField, Card, CardContent,
  Grid, LinearProgress, Skeleton, Box, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import contractService from '../services/contractService';

function BudgetDashboard() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  const [newExpense, setNewExpense] = useState({ budgetId: '', amount: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load budgets
  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug info
      console.log("Contract service:", contractService);
      console.log("Available methods:", Object.keys(contractService));
      console.log("Budget manager contract:", contractService.contracts?.budgetManager);
      
      // Check if needed methods exist
      if (!contractService.getBudgets) {
        console.error("getBudgets method is not available");
        setError("Contract service is not properly initialized. Please refresh the page.");
        return;
      }
      
      const budgetList = await contractService.getBudgets();
      console.log("Loaded budgets:", budgetList);
      setBudgets(budgetList);
    } catch (error) {
      console.error('Failed to load budgets:', error);
      setError('Failed to load budgets. Please make sure your wallet is connected.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load budgets on component mount and when refresh is triggered
  useEffect(() => {
    if (contractService) {
      loadBudgets();
    }
  }, [loadBudgets, refreshTrigger, contractService]);

  // Create new budget
  const handleCreateBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return;
    
    try {
      setLoading(true);
      setError('');
      
      await contractService.createBudget(newBudget.category, newBudget.limit);
      
      // Clear form
      setNewBudget({ category: '', limit: '' });
      
      // Comment out the automatic refresh
      // setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
      console.log("Transaction completed. Click 'Refresh Budgets' to update the list.");
    } catch (error) {
      console.error('Failed to create budget:', error);
      setError(`Failed to create budget: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Record expense
  const handleRecordExpense = async () => {
    if (!newExpense.budgetId || !newExpense.amount) return;
    
    try {
      setLoading(true);
      setError('');
      
      await contractService.recordExpense(newExpense.budgetId, newExpense.amount);
      
      // Clear form
      setNewExpense({ budgetId: '', amount: '' });
      
      // Comment out the automatic refresh
      // setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000);
      console.log("Transaction completed. Click 'Refresh Budgets' to update the list.");
    } catch (error) {
      console.error('Failed to record expense:', error);
      setError(`Failed to record expense: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Budget Dashboard</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button 
        variant="outlined"
        onClick={() => setRefreshTrigger(prev => prev + 1)}
        sx={{ mb: 2 }}
      >
        Refresh Budgets
      </Button>

      <Button 
        variant="outlined"
        color="info"
        onClick={async () => {
          try {
            const userAddress = await contractService.signer.getAddress();
            console.log("Current user address:", userAddress);
            
            // Try to directly get userBudgetCount
            try {
              const count = await contractService.contracts.budgetManager.userBudgetCount(userAddress);
              console.log("User budget count from contract:", Number(count));
            } catch (err) {
              console.error("Failed to get userBudgetCount:", err);
            }
            
            // Try to get a specific budget directly
            try {
              const budget0 = await contractService.contracts.budgetManager.getBudget(0);
              console.log("Budget 0:", {
                limit: ethers.formatEther(budget0[0]),
                spent: ethers.formatEther(budget0[1]),
                lastReset: new Date(Number(budget0[2]) * 1000),
                category: budget0[3]
              });
            } catch (err) {
              console.error("Failed to get budget 0:", err);
            }
          } catch (error) {
            console.error("Debug error:", error);
          }
        }}
        sx={{ ml: 2, mb: 2 }}
      >
        Debug Budgets
      </Button>

      <Button 
        variant="contained"
        color="error"
        onClick={async () => {
          try {
            // Add more detailed contract inspection
            console.log("Contract address:", await contractService.contracts.budgetManager.getAddress());
            console.log("Contract ABI functions:", 
              contractService.contracts.budgetManager.interface.fragments
                .filter(f => f.type === 'function')
                .map(f => `${f.name}(${f.inputs.map(i => i.type).join(',')})`)
            );
            
            // Try to get budget count using various methods
            const userAddress = await contractService.signer.getAddress();
            console.log("User address:", userAddress);
            
            // Try to manually call getBudget(0) to see format
            try {
              const budget0 = await contractService.contracts.budgetManager.getBudget(0);
              console.log("Budget 0 raw data:", budget0);
              console.log("Budget 0 transformed:", {
                category: budget0[3],
                limit: ethers.formatEther(budget0[0]),
                spent: ethers.formatEther(budget0[1]),
                lastReset: new Date(Number(budget0[2]) * 1000)
              });
            } catch (err) {
              console.error("Failed to get budget 0:", err);
            }
          } catch (error) {
            console.error("Contract debug error:", error);
          }
        }}
        sx={{ ml: 2 }}
      >
        Inspect Contract
      </Button>
      
      {/* Create Budget Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Create New Budget</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Category"
                value={newBudget.category}
                onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                type="number"
                label="Limit"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateBudget}
                disabled={!newBudget.category || !newBudget.limit || loading}
                fullWidth
                sx={{ height: '100%' }}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Record Expense Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Record Expense</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Budget"
                value={newExpense.budgetId}
                onChange={(e) => setNewExpense({...newExpense, budgetId: e.target.value})}
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.category}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRecordExpense}
                disabled={!newExpense.budgetId || !newExpense.amount || loading}
                fullWidth
                sx={{ height: '100%' }}
              >
                Record
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Budget List */}
      <Typography variant="h6" gutterBottom>Your Budgets</Typography>
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={`skeleton-${i}`}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} width="60%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={20} sx={{ mt: 2, mb: 1 }} />
                  <Skeleton variant="text" width="30%" height={16} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : budgets.length === 0 ? (
        <Typography>No budgets created yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {budgets.map((budget) => (
            <Grid item xs={12} md={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{budget.category}</Typography>
                  <Typography>
                    Spent: {budget.spent} / {budget.limit} ETH
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((parseFloat(budget.spent) / parseFloat(budget.limit)) * 100, 100)}
                    color={parseFloat(budget.spent) > parseFloat(budget.limit) ? "error" : "primary"}
                    sx={{ mt: 2 }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Last updated: {budget.lastReset.toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default BudgetDashboard;