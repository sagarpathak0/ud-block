import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function FraudAnalytics({ contractService }) {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskScores, setRiskScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    highRiskTransactions: 0,
    mediumRiskTransactions: 0,
    lowRiskTransactions: 0,
    totalVolume: 0,
    fraudulentVolume: 0
  });

  // Mock data for demonstration
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      
      // Mock transaction data
      const mockTransactions = [
        { 
          id: '0x1a2b3c', 
          from: '0x1234...5678', 
          to: '0x8765...4321', 
          amount: '1.45', 
          timestamp: Date.now() - 3600000, 
          riskScore: 85,
          flags: ['Unusual pattern', 'Large amount']
        },
        { 
          id: '0x2b3c4d', 
          from: '0x2345...6789', 
          to: '0x9876...5432', 
          amount: '0.05', 
          timestamp: Date.now() - 7200000, 
          riskScore: 12,
          flags: []
        },
        { 
          id: '0x3c4d5e', 
          from: '0x3456...7890', 
          to: '0x0987...6543', 
          amount: '2.30', 
          timestamp: Date.now() - 10800000, 
          riskScore: 45,
          flags: ['New address']
        },
        { 
          id: '0x4d5e6f', 
          from: '0x4567...8901', 
          to: '0x1098...7654', 
          amount: '5.00', 
          timestamp: Date.now() - 14400000, 
          riskScore: 78,
          flags: ['Unusual pattern', 'Multiple transactions']
        },
        { 
          id: '0x5e6f7g', 
          from: '0x5678...9012', 
          to: '0x2109...8765', 
          amount: '0.12', 
          timestamp: Date.now() - 18000000, 
          riskScore: 23,
          flags: []
        },
      ];
      
      // Mock alerts
      const mockAlerts = [
        {
          id: 1,
          severity: 'high',
          description: 'Suspicious transaction pattern detected',
          timestamp: Date.now() - 1800000,
          relatedTx: '0x1a2b3c',
          status: 'active'
        },
        {
          id: 2,
          severity: 'medium',
          description: 'Multiple failed transaction attempts',
          timestamp: Date.now() - 3600000,
          relatedTx: '0x4d5e6f',
          status: 'active'
        },
        {
          id: 3,
          severity: 'low',
          description: 'New address with large transaction volume',
          timestamp: Date.now() - 7200000,
          relatedTx: '0x3c4d5e',
          status: 'resolved'
        }
      ];
      
      // Risk score over time
      const mockRiskScores = [
        { day: 'Mon', score: 25 },
        { day: 'Tue', score: 30 },
        { day: 'Wed', score: 28 },
        { day: 'Thu', score: 45 },
        { day: 'Fri', score: 65 },
        { day: 'Sat', score: 40 },
        { day: 'Sun', score: 35 }
      ];
      
      // Summary statistics
      const mockSummary = {
        highRiskTransactions: 2,
        mediumRiskTransactions: 1,
        lowRiskTransactions: 2,
        totalVolume: 8.92,
        fraudulentVolume: 6.45
      };
      
      setTransactions(mockTransactions);
      setAlerts(mockAlerts);
      setRiskScores(mockRiskScores);
      setSummary(mockSummary);
      setLoading(false);
    };
    
    loadMockData();
  }, []);
  
  // Function to handle address search
  const handleSearch = () => {
    if (!searchAddress) {
      setError('Please enter an address to search');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // In a real implementation, this would search blockchain data
    // For now, we'll just simulate a search
    setTimeout(() => {
      // Mock finding suspicious activity for the address
      if (searchAddress.includes('123')) {
        setAlerts(prev => [
          {
            id: Date.now(),
            severity: 'high',
            description: `Suspicious activity detected for address ${searchAddress}`,
            timestamp: Date.now(),
            relatedTx: '0x' + Math.random().toString(16).substring(2, 8),
            status: 'active'
          },
          ...prev
        ]);
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Function to handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Calculate risk color
  const getRiskColor = (score) => {
    if (score >= 70) return '#f44336'; // High risk - red
    if (score >= 40) return '#ff9800'; // Medium risk - orange
    return '#4caf50'; // Low risk - green
  };
  
  // Risk distribution data for pie chart
  const riskDistribution = [
    { name: 'High Risk', value: summary.highRiskTransactions },
    { name: 'Medium Risk', value: summary.mediumRiskTransactions },
    { name: 'Low Risk', value: summary.lowRiskTransactions }
  ];
  
  const COLORS = ['#f44336', '#ff9800', '#4caf50'];
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Fraud Analytics Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Search and filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search Address"
                variant="outlined"
                fullWidth
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  disabled={loading}
                >
                  Refresh Data
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Risk Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h5">
                  {summary.highRiskTransactions} High Risk
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {summary.mediumRiskTransactions} Medium Risk, {summary.lowRiskTransactions} Low Risk
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Transaction Volume
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {summary.totalVolume} ETH
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                +24% from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Suspicious Volume
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {summary.fraudulentVolume} ETH
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                {((summary.fraudulentVolume / summary.totalVolume) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {alerts.filter(a => a.status === 'active').length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {alerts.filter(a => a.severity === 'high' && a.status === 'active').length} high priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main content tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Analytics" />
          <Tab label="Transactions" />
          <Tab label="Alerts" />
        </Tabs>
      </Box>
      
      {/* Analytics Tab */}
      {activeTab === 0 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Score Trend
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskScores}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fraud Patterns Detected
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Pattern Type</TableCell>
                          <TableCell>Occurrences</TableCell>
                          <TableCell>Last Detected</TableCell>
                          <TableCell>Severity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Unusually large transactions</TableCell>
                          <TableCell>7</TableCell>
                          <TableCell>12 minutes ago</TableCell>
                          <TableCell>
                            <Chip label="High" color="error" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Multiple rapid transactions</TableCell>
                          <TableCell>12</TableCell>
                          <TableCell>35 minutes ago</TableCell>
                          <TableCell>
                            <Chip label="Medium" color="warning" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Suspicious address interactions</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell>2 hours ago</TableCell>
                          <TableCell>
                            <Chip label="High" color="error" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Abnormal gas usage</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>4 hours ago</TableCell>
                          <TableCell>
                            <Chip label="Low" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 1 && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>Flags</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{tx.id}</TableCell>
                          <TableCell>{tx.from}</TableCell>
                          <TableCell>{tx.to}</TableCell>
                          <TableCell>{tx.amount} ETH</TableCell>
                          <TableCell>{new Date(tx.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 40,
                                  mr: 1,
                                  borderRadius: 1,
                                  bgcolor: getRiskColor(tx.riskScore),
                                  color: 'white',
                                  textAlign: 'center',
                                  py: 0.5,
                                }}
                              >
                                {tx.riskScore}
                              </Box>
                              {tx.riskScore >= 70 && <WarningIcon color="error" fontSize="small" />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {tx.flags.length > 0 ? (
                              tx.flags.map((flag, idx) => (
                                <Chip
                                  key={idx}
                                  label={flag}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                  color={tx.riskScore >= 70 ? "error" : "default"}
                                />
                              ))
                            ) : (
                              "None"
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Alerts Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Alerts
              </Typography>
              <Timeline position="right">
                {alerts.map((alert) => (
                  <TimelineItem key={alert.id}>
                    <TimelineSeparator>
                      <TimelineDot 
                        color={
                          alert.severity === 'high' ? 'error' : 
                          alert.severity === 'medium' ? 'warning' : 'success'
                        }
                      >
                        <SecurityIcon />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" component="span">
                          {alert.description}
                        </Typography>
                        <Chip 
                          label={alert.status === 'active' ? 'Active' : 'Resolved'} 
                          size="small"
                          color={alert.status === 'active' ? 'error' : 'success'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography color="textSecondary">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Related transactions: {alert.relatedTx}
                      </Typography>
                      {alert.status === 'active' && (
                        <Box sx={{ mt: 2 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          >
                            Investigate
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 1 }}
                          >
                            Mark Resolved
                          </Button>
                        </Box>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default FraudAnalytics;