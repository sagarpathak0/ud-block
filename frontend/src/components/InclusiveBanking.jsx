import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tabs,
  Tab,
  TextField,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';

// Icons
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';

function SimpleLoanRequest({ onClose, onSubmit }) {
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!loanAmount || !purpose) {
      setError('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      onSubmit({ loanAmount, purpose, duration });
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <DialogTitle>Request Loan</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Fill in the details below to request a loan. Our community partners will review your request.
        </DialogContentText>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Amount (ETH)"
          type="number"
          fullWidth
          margin="normal"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          required
        />
        <TextField
          label="Purpose"
          fullWidth
          margin="normal"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          multiline
          rows={3}
          required
          placeholder="Explain how you plan to use the funds"
        />
        <TextField
          label="Duration (days)"
          type="number"
          fullWidth
          margin="normal"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Request"}
        </Button>
      </DialogActions>
    </>
  );
}

function GroupSavingsDialog({ onClose, onSubmit }) {
  const [groupName, setGroupName] = useState('');
  const [goal, setGoal] = useState('');
  const [contribution, setContribution] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit({ groupName, goal, contribution });
      setLoading(false);
    }, 1500);
  };
  
  return (
    <>
      <DialogTitle>Create Savings Group</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Start a community savings group to achieve financial goals together.
        </DialogContentText>
        <TextField
          label="Group Name"
          fullWidth
          margin="normal"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <TextField
          label="Savings Goal (ETH)"
          type="number"
          fullWidth
          margin="normal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
        />
        <TextField
          label="Your Initial Contribution (ETH)"
          type="number"
          fullWidth
          margin="normal"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !groupName || !goal || !contribution}
        >
          {loading ? <CircularProgress size={24} /> : "Create Group"}
        </Button>
      </DialogActions>
    </>
  );
}

function InclusiveBanking({ contractService }) {
  const [activeTab, setActiveTab] = useState(0);
  const [balance, setBalance] = useState('0.25');
  const [loanRequests, setLoanRequests] = useState([
    {
      id: 1,
      borrower: '0x1234...5678',
      amount: '0.5',
      purpose: 'Small business inventory',
      duration: 30,
      status: 'pending'
    },
    {
      id: 2,
      borrower: '0x2345...6789',
      amount: '0.3',
      purpose: 'Education expenses',
      duration: 60,
      status: 'approved'
    }
  ]);
  const [communityGroups, setCommunityGroups] = useState([
    {
      id: 1,
      name: 'Business Development Fund',
      members: 12,
      balance: '2.5',
      goal: '5.0',
      progress: 50
    },
    {
      id: 2,
      name: 'Education Support Pool',
      members: 8,
      balance: '1.2',
      goal: '3.0',
      progress: 40
    }
  ]);
  const [openDialog, setOpenDialog] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoanSubmit = (loanData) => {
    // In a real app, this would interact with a smart contract
    console.log('Loan requested:', loanData);
    
    // Add the new loan request to the list
    const newLoan = {
      id: loanRequests.length + 1,
      borrower: '0xYOUR...WALLET', // Would come from connected wallet
      amount: loanData.loanAmount,
      purpose: loanData.purpose,
      duration: loanData.duration,
      status: 'pending'
    };
    
    setLoanRequests([newLoan, ...loanRequests]);
    setOpenDialog('');
    setSuccess('Your loan request has been submitted successfully!');
  };

  const handleGroupSubmit = (groupData) => {
    // In a real app, this would interact with a smart contract
    console.log('Group created:', groupData);
    
    // Add the new group to the list
    const newGroup = {
      id: communityGroups.length + 1,
      name: groupData.groupName,
      members: 1,
      balance: groupData.contribution,
      goal: groupData.goal,
      progress: (Number(groupData.contribution) / Number(groupData.goal) * 100).toFixed(0)
    };
    
    setCommunityGroups([...communityGroups, newGroup]);
    setOpenDialog('');
    setSuccess('Your savings group has been created successfully!');
  };

  const handleJoinGroup = (groupId) => {
    // In a real app, this would interact with a smart contract
    console.log('Joining group:', groupId);
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update the group with an additional member
      const updatedGroups = communityGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, members: group.members + 1 };
        }
        return group;
      });
      
      setCommunityGroups(updatedGroups);
      setSuccess('You have successfully joined the group!');
      setLoading(false);
    }, 1000);
  };
  
  const handleDeposit = (groupId, amount) => {
    // In a real app, this would interact with a smart contract
    console.log('Depositing to group:', groupId, amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Inclusive Banking Services
      </Typography>
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {/* Balance Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Your Balance
                  </Typography>
                  <Typography variant="h4">
                    {balance} ETH
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button 
                variant="contained" 
                startIcon={<PaymentIcon />}
                sx={{ mr: 2 }}
                onClick={() => setOpenDialog('loan')}
              >
                Request Loan
              </Button>
              <Button 
                variant="outlined"
                startIcon={<GroupIcon />}
                onClick={() => setOpenDialog('group')}
              >
                Create Savings Group
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Main content tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<LocalAtmIcon />} label="Micro Loans" />
            <Tab icon={<PeopleIcon />} label="Community Savings" />
            <Tab icon={<SchoolIcon />} label="Financial Education" />
            <Tab icon={<SecurityIcon />} label="Security & Fraud" /> {/* New tab */}
          </Tabs>
        </Box>
        
        {/* Micro Loans Tab */}
        {activeTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Loan Requests
            </Typography>
            
            <List>
              {loanRequests.map((loan) => (
                <React.Fragment key={loan.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${loan.amount} ETH for ${loan.purpose}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Borrower: {loan.borrower}
                          </Typography>
                          {" — Duration: "}{loan.duration}{" days"}
                        </>
                      }
                    />
                    <Box>
                      <Chip 
                        label={loan.status.toUpperCase()}
                        color={loan.status === 'approved' ? 'success' : 'default'} 
                        size="small"
                      />
                      {loan.status === 'pending' && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          sx={{ ml: 1 }}
                        >
                          Fund
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => setOpenDialog('loan')}
              >
                Request a Loan
              </Button>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Why Micro Loans?
            </Typography>
            <Typography variant="body2" paragraph>
              Our micro loan platform connects borrowers with community lenders to provide 
              small, manageable loans without the high interest rates and stringent requirements
              of traditional banking. Ideal for small business funding, education expenses,
              and emergency needs.
            </Typography>
          </Box>
        )}
        
        {/* Community Savings Tab */}
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Savings Groups
            </Typography>
            
            <Grid container spacing={3}>
              {communityGroups.map((group) => (
                <Grid item xs={12} md={6} key={group.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" gutterBottom>
                          {group.name}
                        </Typography>
                        <Chip 
                          icon={<PeopleIcon />} 
                          label={`${group.members} members`} 
                          size="small" 
                          color="primary"
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Progress: {group.balance} / {group.goal} ETH
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Number(group.progress)} 
                          sx={{ mt: 1, height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={loading}
                        >
                          Join Group
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                        >
                          Deposit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => setOpenDialog('group')}
                startIcon={<GroupIcon />}
              >
                Create New Group
              </Button>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              About Community Savings
            </Typography>
            <Typography variant="body2" paragraph>
              Community savings groups allow members to pool resources, support each other, 
              and work towards common financial goals. Perfect for building emergency funds,
              supporting local initiatives, or saving for large community purchases.
            </Typography>
          </Box>
        )}
        
        {/* Financial Education Tab */}
        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Educational Resources
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      DeFi Fundamentals
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Learn the basics of decentralized finance and how it can empower you
                      financially.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      endIcon={<TrendingUpIcon />}
                      fullWidth
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Budgeting Workshop
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Master the fundamentals of creating and maintaining a budget for
                      long-term financial health.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      endIcon={<TrendingUpIcon />}
                      fullWidth
                    >
                      View Workshop
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Investment Basics
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Understand how to evaluate investment opportunities and build long-term
                      wealth.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      endIcon={<TrendingUpIcon />}
                      fullWidth
                    >
                      Explore Course
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Webinars
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Introduction to Crypto Saving Strategies"
                    secondary="May 15, 2025 - 2:00 PM EST"
                  />
                  <Button variant="outlined" size="small">
                    Register
                  </Button>
                </ListItem>
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Building Credit in a Decentralized World"
                    secondary="May 22, 2025 - 1:00 PM EST"
                  />
                  <Button variant="outlined" size="small">
                    Register
                  </Button>
                </ListItem>
              </List>
            </Box>
          </Box>
        )}
        
        {/* Security & Fraud Tab */}
        {activeTab === 3 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fraud Protection
            </Typography>
            
            <Typography variant="body2" paragraph>
              Our fraud protection tools help you monitor your accounts for suspicious activity
              and provide guidance on keeping your funds secure.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              component="a" 
              href="#/fraud-analytics" // If using hash router
              startIcon={<SecurityIcon />}
            >
              Go to Fraud Analytics Dashboard
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Dialogs */}
      <Dialog 
        open={openDialog === 'loan'} 
        onClose={() => setOpenDialog('')}
        fullWidth
        maxWidth="sm"
      >
        <SimpleLoanRequest 
          onClose={() => setOpenDialog('')}
          onSubmit={handleLoanSubmit}
        />
      </Dialog>
      
      <Dialog 
        open={openDialog === 'group'} 
        onClose={() => setOpenDialog('')}
        fullWidth
        maxWidth="sm"
      >
        <GroupSavingsDialog 
          onClose={() => setOpenDialog('')}
          onSubmit={handleGroupSubmit}
        />
      </Dialog>
    </Box>
  );
}

export default InclusiveBanking;