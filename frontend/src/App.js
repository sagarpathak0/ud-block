import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { ContractService } from "./services/contractService";
import WalletConnect from "./components/WalletConnect";
import BudgetDashboard from "./components/BudgetDashboard";
import MicroInvestmentPortal from "./components/MicroInvestmentPortal";
import InclusiveBanking from "./components/InclusiveBanking";
import { ethers } from "ethers";

// Replace these with your actual deployed contract addresses
const CONTRACT_ADDRESSES = {
  budgetManager: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  microInvestor: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  testToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  microLending: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
communitySavings: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
financialEducation: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
};

function App() {
  const [contractService, setContractService] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Update your handleConnect function
  async function handleConnect(provider) {
    try {
      console.log("Received provider:", provider);
      
      // Create the contract service with the provider
      const contractService = new ContractService(provider);
      setContractService(contractService);
      setIsConnected(true);
      
      // You can perform additional initialization here
      
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DeFi Budgeting & Micro-Investment
          </Typography>
          <WalletConnect onConnect={handleConnect} />
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {contractService ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Budget Dashboard" />
                <Tab label="Micro Investments" />
                <Tab label="Inclusive Banking" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <Box sx={{ py: 3 }}>
                <BudgetDashboard contractService={contractService} />
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ py: 3 }}>
                <MicroInvestmentPortal contractService={contractService} />
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ py: 3 }}>
                <InclusiveBanking contractService={contractService} />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h5" gutterBottom>
              Welcome to DeFi Budgeting & Micro-Investment
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Please connect your wallet to get started
            </Typography>
          </Box>
        )}
      </Container>
    </Router>
  );
}

export default App;
