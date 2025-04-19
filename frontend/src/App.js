import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  CssBaseline,
  ThemeProvider,
  Grid,
} from "@mui/material";
import { ContractService } from "./services/contractService";
import WalletConnect from "./components/WalletConnect";
import BudgetDashboard from "./components/BudgetDashboard";
import MicroInvestmentPortal from "./components/MicroInvestmentPortal";
import FraudAnalytics from "./components/FraudAnalytics";
import InclusiveBanking from "./components/InclusiveBanking";
import cyberpunkTheme from "./theme/cyberpunkTheme";

// Replace these with your actual deployed contract addresses
const CONTRACT_ADDRESSES = {
  budgetManager: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
microInvestor: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
testToken: "0x0B306BF915C4d645ff596e518fAf3F9669b97016"
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
    <ThemeProvider theme={cyberpunkTheme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Cyberpunk Decorative Elements */}
          <Box
            sx={{
              position: "absolute",
              top: "-10%",
              left: "-5%",
              width: "120%",
              height: "120%",
              backgroundImage: `
              linear-gradient(135deg, rgba(0, 249, 255, 0.05) 0%, transparent 50%), 
              linear-gradient(45deg, rgba(255, 0, 150, 0.05) 0%, transparent 50%)
            `,
              zIndex: -1,
              pointerEvents: "none",
            }}
          />

          {/* Grid overlay effect */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
              repeating-linear-gradient(rgba(255,255,255,0.03) 0px, transparent 2px, transparent 50px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 50px)
            `,
              backgroundSize: "50px 50px",
              zIndex: -1,
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />

          <AppBar
            position="static"
            elevation={0}
            sx={{
              background:
                "linear-gradient(90deg, rgba(12,12,20,0.85) 0%, rgba(18,18,31,0.85) 100%)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid rgba(0, 249, 255, 0.2)",
              boxShadow: "0 0 20px rgba(0, 249, 255, 0.15)",
            }}
          >
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #00f9ff, #ff0096)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 10px rgba(0, 249, 255, 0.5)",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "0",
                    bottom: "-3px",
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(90deg, #00f9ff, #ff0096)",
                    boxShadow: "0 0 8px rgba(0, 249, 255, 0.7)",
                  },
                }}
              >
                CYBER<span style={{ color: "#ff0096" }}>FI</span>
              </Typography>
              <WalletConnect onConnect={handleConnect} />
            </Toolbar>
          </AppBar>

          <Container
            sx={{ mt: 4, mb: 4, flexGrow: 1, position: "relative" }}
          >
            {contractService ? (
              <>
                <Box
                  sx={{
                    borderBottom: 0,
                    mb: 3,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(0, 249, 255, 0.3), transparent)",
                    },
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        color: "text.secondary",
                        fontSize: "0.9rem",
                        py: 2,
                        transition: "all 0.3s",
                        position: "relative",
                        "&.Mui-selected": {
                          color: "primary.main",
                          textShadow: "0 0 10px rgba(0, 249, 255, 0.5)",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          width: 0,
                          height: "3px",
                          background: "transparent",
                          transition: "all 0.3s",
                          transform: "translateX(-50%)",
                        },
                        "&.Mui-selected::before": {
                          width: "70%",
                          background: "linear-gradient(90deg, #00f9ff, #ff0096)",
                          boxShadow: "0 0 8px rgba(0, 249, 255, 0.7)",
                        },
                      },
                    }}
                  >
                    <Tab label="Budget Dashboard" />
                    <Tab label="Micro Investments" />
                    <Tab label="Fraud Analytics" />
                    <Tab label="Inclusive Banking" />
                  </Tabs>
                </Box>

                {/* Content panels */}
                {tabValue === 0 && (
                  <Box sx={{ py: 3, animation: "fadeIn 0.5s ease-out" }}>
                    <BudgetDashboard contractService={contractService} />
                  </Box>
                )}

                {tabValue === 1 && (
                  <Box sx={{ py: 3, animation: "fadeIn 0.5s ease-out" }}>
                    <MicroInvestmentPortal contractService={contractService} />
                  </Box>
                )}

                {tabValue === 2 && (
                  <Box sx={{ py: 3, animation: "fadeIn 0.5s ease-out" }}>
                    <FraudAnalytics contractService={contractService} />
                  </Box>
                )}

                {tabValue === 3 && (
                  <Box sx={{ py: 3, animation: "fadeIn 0.5s ease-out" }}>
                    <InclusiveBanking contractService={contractService} />
                  </Box>
                )}
              </>
            ) : (
              <Paper
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 4,
                  mt: 8,
                  background: "rgba(12, 12, 20, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 249, 255, 0.2)",
                  boxShadow:
                    "0 0 30px rgba(0, 249, 255, 0.15), inset 0 0 20px rgba(0, 249, 255, 0.05)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "200%",
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(0, 249, 255, 0.8), transparent)",
                    animation: "glowingBorder 4s linear infinite",
                  },
                }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontFamily: "'Orbitron', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    background: "linear-gradient(90deg, #00f9ff, #ff0096)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                    position: "relative",
                    display: "inline-block",
                    textShadow: "0 0 15px rgba(0, 249, 255, 0.5)",
                    animation: "textGlow 2s ease-in-out infinite alternate",
                  }}
                >
                  <span style={{ position: "relative" }}>
                    <span
                      style={{
                        color: "#00f9ff",
                        position: "absolute",
                        left: "-2px",
                        top: "-2px",
                        opacity: 0.7,
                      }}
                    >
                      CYBERFI
                    </span>
                    <span
                      style={{
                        color: "#ff0096",
                        position: "absolute",
                        left: "2px",
                        top: "2px",
                        opacity: 0.7,
                      }}
                    >
                      CYBERFI
                    </span>
                    CYBERFI
                  </span>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    letterSpacing: "2px",
                    opacity: 0.8,
                  }}
                >
                  NEXT-GEN DECENTRALIZED FINANCE
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    maxWidth: "600px",
                    mx: "auto",
                    mb: 5,
                    letterSpacing: "1px",
                    lineHeight: "1.6",
                    textShadow: "0 0 5px rgba(0, 249, 255, 0.3)",
                  }}
                >
                  Connect your neural interface to access the financial grid.
                  {/* Glitch effect for fun */}
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      mt: 1.5,
                      fontFamily: "monospace",
                      letterSpacing: "0.2em",
                      animation: "glitch 3s infinite alternate",
                      position: "relative",
                      color: "#ff0096",
                    }}
                  >
                    SYSTEM: AWAITING AUTHENTICATION
                  </Box>
                </Typography>

                {/* Interactive terminal-like animation */}
                <Box
                  sx={{
                    py: 2,
                    px: 3,
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 1,
                    fontFamily: "monospace",
                    maxWidth: "500px",
                    mx: "auto",
                    textAlign: "left",
                    border: "1px solid rgba(0, 249, 255, 0.2)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: "#ff0096",
                      boxShadow: "0 0 8px 2px rgba(255, 0, 150, 0.8)",
                      margin: "10px",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      color: "#00f9ff",
                      mb: 1,
                      opacity: 0.9,
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      animation: "typing 3.5s steps(40, end)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      borderRight: "3px solid transparent",
                    }}
                  >
                    $ Initializing wallet connection protocol...
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      color: "#ff0096",
                      mb: 1,
                      opacity: 0.9,
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      animation: "typing 3.5s steps(40, end) 1s forwards",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      width: 0,
                    }}
                  >
                    $ Please connect your wallet to get started
                  </Typography>
                </Box>
              </Paper>
            )}
          </Container>

          {/* Footer with cyber aesthetic */}
          <Box
            component="footer"
            sx={{
              py: 2,
              textAlign: "center",
              borderTop: "1px solid rgba(0, 249, 255, 0.1)",
              backdropFilter: "blur(10px)",
              background: "rgba(12, 12, 20, 0.6)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "0.1em",
                fontSize: "0.7rem",
                textTransform: "uppercase",
              }}
            >
              CYBERFI NETWORK © {new Date().getFullYear()} | ALL RIGHTS
              RESERVED
            </Typography>
          </Box>
        </Box>
      </Router>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes glowingBorder {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes textGlow {
          0% {
            text-shadow: 0 0 10px rgba(0, 249, 255, 0.5);
          }
          50% {
            text-shadow: 0 0 20px rgba(0, 249, 255, 0.8),
              0 0 30px rgba(0, 249, 255, 0.4);
          }
          100% {
            text-shadow: 0 0 10px rgba(0, 249, 255, 0.5);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glitch {
          0% {
            transform: none;
            opacity: 0.8;
          }
          7% {
            transform: skew(-0.5deg, -0.9deg);
          }
          10% {
            transform: none;
            opacity: 1;
          }
          27% {
            transform: none;
            opacity: 1;
          }
          30% {
            transform: skew(0.8deg, -0.1deg);
            opacity: 0.9;
          }
          35% {
            transform: none;
            opacity: 1;
          }
          52% {
            transform: none;
            opacity: 1;
          }
          55% {
            transform: skew(-1deg, 0.2deg);
            opacity: 0.9;
          }
          50% {
            transform: none;
            opacity: 1;
          }
          72% {
            transform: none;
            opacity: 1;
          }
          75% {
            transform: skew(0.4deg, 1deg);
            opacity: 0.9;
          }
          80% {
            transform: none;
            opacity: 1;
          }
          100% {
            transform: none;
            opacity: 1;
          }
        }
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </ThemeProvider>
  );
}

export default App;
