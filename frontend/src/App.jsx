import { useState } from 'react';
import {
  Container, Box, AppBar, Toolbar, Typography,
  Tab, Tabs, Paper, ThemeProvider, createTheme
} from '@mui/material';
import WalletConnect from './components/WalletConnect';
import BudgetDashboard from './components/BudgetDashboard';
import MicroInvestor from './components/MicroInvestor';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DeFi Personal Finance
            </Typography>
            <WalletConnect onConnected={(connected) => {
              console.log(`Connection status changed to: ${connected}`);
              setIsConnected(connected);
            }} />
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {!isConnected ? (
            <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Welcome to DeFi Personal Finance
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Please connect your wallet to get started
              </Typography>
            </Paper>
          ) : (
            <>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ mb: 4 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Budget Dashboard" />
                <Tab label="Micro Investing" />
              </Tabs>
              
              {tabValue === 0 && <BudgetDashboard />}
              {tabValue === 2 && <MicroInvestor />}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;