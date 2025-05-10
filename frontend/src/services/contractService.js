import { ethers } from 'ethers';
import BudgetManagerABI from '../abis/BudgetManager.json';
import MicroInvestorABI from '../abis/MicroInvestor.json';
import TestTokenABI from '../abis/TestToken.json'; // Add this import

// Replace your hardcoded ADDRESSES with:
const ADDRESSES = {
  budgetManager: process.env.REACT_APP_BUDGET_MANAGER_ADDRESS,
  microInvestor: process.env.REACT_APP_MICRO_INVESTOR_ADDRESS,
  testToken: process.env.REACT_APP_TEST_TOKEN_ADDRESS
};

// Export the class as a named export
export class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isInitialized = false;
    
    // Add event listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        console.log("MetaMask accounts changed:", accounts);
        if (accounts.length > 0) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await this.initialize(provider);
            console.log("Wallet reconnected after account change");
          } catch (error) {
            console.error("Error reconnecting after account change:", error);
            this.isInitialized = false;
          }
        } else {
          console.log("All accounts disconnected");
          this.isInitialized = false;
        }
      });
    }
  }

  /**
   * Initialize the contract service with a provider
   * @param {ethers.BrowserProvider} provider - Ethers provider instance
   */
  async initialize(provider) {
    try {
      if (!provider) {
        throw new Error('Provider is required');
      }
      
      this.provider = provider;
      this.signer = await provider.getSigner();
      console.log('Using signer address:', await this.signer.getAddress());
      
      // Initialize contract instances
      this.contracts = {
        budgetManager: new ethers.Contract(
          ADDRESSES.budgetManager,
          BudgetManagerABI.abi,
          this.signer
        ),
        
        microInvestor: new ethers.Contract(
          ADDRESSES.microInvestor,
          MicroInvestorABI.abi,
          this.signer
        ),
        
        // Add TestToken contract
        testToken: new ethers.Contract(
          ADDRESSES.testToken,
          TestTokenABI.abi,
          this.signer
        )
      };
      
      this.isInitialized = true;
      console.log('Contract service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Dynamically load contract addresses from local deployments if not found
   */
  async loadContractAddresses() {
    const addresses = { ...ADDRESSES };
    let addressesUpdated = false;
    
    // Check if we have valid addresses
    for (const [key, address] of Object.entries(addresses)) {
      if (!address || address === '0x0000000000000000000000000000000000000000') {
        console.warn(`Missing address for ${key}, attempting to load from deployed contracts`);
        
        try {
          // Try to fetch from deployments/addresses.json
          const response = await fetch('/deployments/addresses.json');
          if (response.ok) {
            const deployedAddresses = await response.json();
            if (deployedAddresses[key]) {
              addresses[key] = deployedAddresses[key];
              addressesUpdated = true;
              console.log(`Loaded ${key} address from deployments: ${addresses[key]}`);
            }
          }
        } catch (error) {
          console.warn(`Failed to load deployed address for ${key}:`, error.message);
        }
      }
    }
    
    // If we updated addresses, reinitialize contracts
    if (addressesUpdated && this.signer) {
      console.log("Reinitializing contracts with updated addresses");
      this.initializeContracts(addresses);
    }
    
    return addresses;
  }

  /**
   * Initialize contract instances with provided addresses
   */
  initializeContracts(addresses) {
    try {
      this.contracts = {
        budgetManager: new ethers.Contract(
          addresses.budgetManager,
          BudgetManagerABI.abi,
          this.signer
        ),
        
        microInvestor: new ethers.Contract(
          addresses.microInvestor,
          MicroInvestorABI.abi,
          this.signer
        ),
        
        testToken: new ethers.Contract(
          addresses.testToken,
          TestTokenABI.abi,
          this.signer
        )
      };
      
      console.log("Contracts initialized with addresses:", {
        budgetManager: addresses.budgetManager,
        microInvestor: addresses.microInvestor,
        testToken: addresses.testToken
      });
      
      return true;
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
      return false;
    }
  }

  /**
   * Ensure the service is initialized before performing operations
   */
  ensureInitialized() {
    if (!this.isInitialized || !this.signer) {
      throw new Error('Contract service not initialized');
    }
  }

  /**
   * Ensures the service is initialized or attempts to reinitialize
   */
  async ensureInitializedOrReconnect() {
    if (!this.isInitialized || !this.signer) {
      // Try to reconnect if MetaMask is available
      if (window.ethereum) {
        console.log("Attempting to reconnect to wallet...");
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            await this.initialize(provider);
            return true;
          } else {
            throw new Error("No accounts found. Please connect your wallet first.");
          }
        } catch (error) {
          console.error("Failed to reconnect:", error);
          throw new Error("Contract service not initialized. Please connect your wallet first.");
        }
      } else {
        throw new Error("MetaMask not installed. Please install MetaMask to use this feature.");
      }
    }
    return true;
  }

  /**
   * Ensure the user is on the correct network
   */
  async ensureCorrectNetwork() {
    if (!window.ethereum) return false;
    
    try {
      // Get current chain ID
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = network.chainId;
      
      // Expected chain ID from env or default to Hardhat's chain ID (1337)
      const expectedChainId = parseInt(process.env.REACT_APP_NETWORK_ID || "1337");
      
      // If already on correct network
      if (currentChainId === expectedChainId) {
        return true;
      }
      
      // Request network switch for MetaMask
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
        return true;
      } catch (switchError) {
        // This error code indicates the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${expectedChainId.toString(16)}`,
                chainName: process.env.REACT_APP_NETWORK_NAME || 'Hardhat Network',
                rpcUrls: ['http://localhost:8545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
              },
            ],
          });
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  /**
   * Budget Manager methods
   */
  
  // Get all budgets for the current user
  async getBudgets() {
    this.ensureInitialized();
    
    const contractExists = await this.verifyContractExists('budgetManager');
    if (!contractExists) {
      console.error("Budget Manager contract not deployed at the specified address");
      return [];
    }
    
    try {
      console.log('Budget manager contract:', this.contracts.budgetManager);
      const userAddress = await this.signer.getAddress();
      console.log('Getting budgets for:', userAddress);
      
      // Debug contract interface
      if (this.contracts.budgetManager && this.contracts.budgetManager.interface) {
        console.log('Available functions:', 
          this.contracts.budgetManager.interface.fragments
            .filter(f => f.type === 'function')
            .map(f => f.name)
        );
      }
      
      // Try multiple ways to get budgets
      let budgets = [];
      
      // Approach 1: Try to get budget count
      try {
        // Try various budget count functions
        let budgetCount = 0;
        const availableMethods = ['userBudgetCount', 'getBudgetCount', 'budgetCount'];
        
        for (const method of availableMethods) {
          try {
            if (typeof this.contracts.budgetManager[method] === 'function') {
              const count = method === 'userBudgetCount' 
                ? await this.contracts.budgetManager[method](userAddress) 
                : await this.contracts.budgetManager[method]();
              
              budgetCount = Number(count);
              console.log(`Found budget count (${budgetCount}) using method: ${method}`);
              break;
            }
          } catch (e) {
            console.log(`Method ${method} not available or failed`);
          }
        }
        
        // If we have a count, try to fetch budgets
        if (budgetCount > 0) {
          for (let i = 0; i < budgetCount; i++) {
            try {
              let budget;
              // Try different ways to get budget data
              try {
                budget = await this.contracts.budgetManager.getBudget(i);
              } catch (e) {
                try {
                  budget = await this.contracts.budgetManager.budgets(i);
                } catch (e2) {
                  console.log(`Cannot get budget at index ${i}`);
                  continue;
                }
              }
              
              // Try to parse budget data in different formats
              const budgetObj = {
                id: i,
                category: 'Unknown',
                limit: '0',
                spent: '0',
                lastReset: new Date()
              };
              
              if (Array.isArray(budget)) {
                budgetObj.limit = ethers.formatEther(budget[0] || 0);
                budgetObj.spent = ethers.formatEther(budget[1] || 0);
                budgetObj.lastReset = new Date(Number(budget[2] || 0) * 1000);
                budgetObj.category = budget[3] || `Budget ${i+1}`;
              } else if (typeof budget === 'object') {
                budgetObj.limit = ethers.formatEther(budget.limit || 0);
                budgetObj.spent = ethers.formatEther(budget.spent || 0);
                budgetObj.lastReset = new Date(Number(budget.lastReset || 0) * 1000);
                budgetObj.category = budget.category || `Budget ${i+1}`;
              }
              
              budgets.push(budgetObj);
            } catch (error) {
              console.log(`Error processing budget ${i}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.log('Approach 1 failed:', error.message);
      }
      
      return budgets;
    } catch (error) {
      console.error('Error in getBudgets:', error);
      return [];
    }
  }
  
  // Create a new budget
  async createBudget(category, limit) {
    this.ensureInitialized();
    
    try {
      console.log(`Creating budget with params: category=${category}, limit=${limit}`);
      const limitInWei = ethers.parseEther(limit.toString());
      const tx = await this.contracts.budgetManager.createBudget(category, limitInWei);
      console.log('Transaction hash:', tx.hash);
      return await tx.wait();
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }
  
  // Record an expense for a budget
  async recordExpense(budgetId, amount) {
    this.ensureInitialized();
    
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await this.contracts.budgetManager.recordExpense(budgetId, amountInWei);
      console.log('Transaction hash:', tx.hash);
      return await tx.wait();
    } catch (error) {
      console.error('Error recording expense:', error);
      throw error;
    }
  }

  /**
   * Micro Lending methods
   */
  
  // Get the total number of loans
  async getLoanCount() {
    this.ensureInitialized();
    
    try {
      const contract = this.contracts.microLending;
      
      if (typeof contract.getLoanCount === 'function') {
        return Number(await contract.getLoanCount());
      } else if (typeof contract.loanCount === 'function') {
        return Number(await contract.loanCount());
      } else if (typeof contract.totalLoans === 'function') {
        return Number(await contract.totalLoans());
      }
      
      console.log('Available loan functions:', 
        contract.interface.fragments
          .filter(f => f.type === 'function')
          .map(f => f.name)
      );
      
      throw new Error('Loan count function not found in contract');
    } catch (error) {
      console.error('Error getting loan count:', error);
      return 0;
    }
  }

  // Add this method to get test tokens using the faucet function
  async getTestTokens() {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.testToken) {
        throw new Error("TestToken contract not initialized");
      }
      
      // Get initial balance for comparison
      const initialBalance = await this.getTokenBalance();
      console.log("Initial token balance:", initialBalance);
      
      console.log("Requesting test tokens from faucet...");
      
      // Check if user has requested tokens recently
      const userAddress = await this.signer.getAddress();
      try {
        const lastRequestTime = await this.contracts.testToken.lastFaucetTime(userAddress);
        const lastRequestDate = new Date(Number(lastRequestTime) * 1000);
        console.log("Last token request time:", lastRequestDate);
        
        // Check if the cooldown period has passed
        const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
        if (lastRequestDate > oneHourAgo) {
          const waitTimeMinutes = Math.ceil((lastRequestDate.getTime() - oneHourAgo.getTime()) / (60 * 1000));
          throw new Error(`Please wait ${waitTimeMinutes} more minutes before requesting tokens again`);
        }
      } catch (timeError) {
        // If error contains a message about waiting, rethrow it
        if (timeError.message.includes("wait")) {
          throw timeError;
        }
        // Otherwise, this might be the first request or another issue
        console.log("Could not retrieve last request time:", timeError.message);
      }
      
      // Call the faucet function - this will mint 100 tokens
      try {
        const tx = await this.contracts.testToken.faucet();
        console.log("Faucet transaction submitted:", tx.hash);
        
        // Wait for transaction to be mined with timeout
        console.log("Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
        // Verify tokens were received
        const tokensReceived = await this.verifyTokensReceived(initialBalance);
        if (!tokensReceived) {
          console.warn("Transaction confirmed but balance didn't increase");
        }
        
        return receipt;
      } catch (txError) {
        console.error("Transaction error:", txError);
        
        // Check for common errors
        if (txError.message.includes("Please wait before requesting")) {
          throw new Error("You need to wait 1 hour between token requests");
        }
        
        throw txError;
      }
    } catch (error) {
      console.error("Error getting test tokens:", error);
      throw error;
    }
  }
  
  // Add this method to check token balance
  async getTokenBalance() {
    this.ensureInitialized();
    
    try {
      if (!this.contracts.testToken) {
        throw new Error("TestToken contract not initialized");
      }
      
      const userAddress = await this.signer.getAddress();
      const balanceWei = await this.contracts.testToken.balanceOf(userAddress);
      
      // Add extra logging and error handling
      console.log(`Raw token balance for ${userAddress}:`, balanceWei.toString());
      
      try {
        const formattedBalance = ethers.formatEther(balanceWei);
        console.log(`Formatted token balance: ${formattedBalance}`);
        return formattedBalance;
      } catch (formatError) {
        console.error("Error formatting token balance:", formatError);
        // Return the raw balance divided by 10^18 as fallback
        return (Number(balanceWei.toString()) / 1e18).toString();
      }
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0"; // Return 0 instead of throwing to prevent UI errors
    }
  }

  // Add this method to check if the faucet transaction was successful
  async verifyTokensReceived(oldBalance) {
    try {
      // Wait a moment for blockchain to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBalance = await this.getTokenBalance();
      console.log(`Balance comparison - Old: ${oldBalance}, New: ${newBalance}`);
      
      const oldBalanceNum = parseFloat(oldBalance);
      const newBalanceNum = parseFloat(newBalance);
      
      if (newBalanceNum > oldBalanceNum) {
        const difference = newBalanceNum - oldBalanceNum;
        console.log(`Tokens received: ${difference}`);
        return true;
      } else {
        console.warn("Balance did not increase after faucet call");
        return false;
      }
    } catch (error) {
      console.error("Error verifying token receipt:", error);
      return false;
    }
  }

  /**
   * Get the user's investment balance from MicroInvestor contract
   */
  async getInvestmentBalance() {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microInvestor) {
        throw new Error("MicroInvestor contract not initialized");
      }
      
      const userAddress = await this.signer.getAddress();
      console.log("Getting investment balance for:", userAddress);
      
      // The MicroInvestor contract uses 'getUserBalance' method
      const balanceWei = await this.contracts.microInvestor.getUserBalance();
      
      // Log the raw data for debugging
      console.log("Raw investment balance:", balanceWei.toString());
      
      // Format the balance from wei to ether
      const formattedBalance = ethers.formatEther(balanceWei);
      console.log("Formatted investment balance:", formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error("Error getting investment balance:", error);
      return "0"; // Return 0 on error to prevent UI crashes
    }
  }

  /**
   * Approve tokens for spending by the MicroInvestor contract
   */
  async approveTokens(amount) {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.testToken || !this.contracts.microInvestor) {
        throw new Error("Required contracts not initialized");
      }
      
      const amountWei = ethers.parseEther(amount.toString());
      console.log(`Approving ${amount} tokens (${amountWei} wei) for MicroInvestor contract...`);
      
      const microInvestorAddress = await this.contracts.microInvestor.getAddress();
      const tx = await this.contracts.testToken.approve(microInvestorAddress, amountWei);
      
      console.log("Token approval transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("Token approval confirmed in block:", receipt.blockNumber);
      
      return receipt;
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  }

  /**
   * Deposit tokens for investment
   */
  async depositForInvestment(amount) {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microInvestor) {
        throw new Error("MicroInvestor contract not initialized");
      }
      
      const amountWei = ethers.parseEther(amount.toString());
      console.log(`Depositing ${amount} tokens (${amountWei} wei) for investment...`);
      
      const tx = await this.contracts.microInvestor.deposit(amountWei);
      console.log("Deposit transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Deposit confirmed in block:", receipt.blockNumber);
      
      return receipt;
    } catch (error) {
      console.error("Error depositing for investment:", error);
      throw error;
    }
  }

  /**
   * Withdraw invested tokens
   */
  async withdrawInvestment(amount) {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microInvestor) {
        throw new Error("MicroInvestor contract not initialized");
      }
      
      const amountWei = ethers.parseEther(amount.toString());
      console.log(`Withdrawing ${amount} tokens (${amountWei} wei) from investment...`);
      
      const tx = await this.contracts.microInvestor.withdraw(amountWei);
      console.log("Withdrawal transaction submitted:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Withdrawal confirmed in block:", receipt.blockNumber);
      
      return receipt;
    } catch (error) {
      console.error("Error withdrawing investment:", error);
      throw error;
    }
  }

  /**
   * Check status of a specific loan
   */
  async checkLoanStatus(loanId) {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microLending) {
        throw new Error("MicroLending contract not initialized");
      }
      
      const loan = await this.contracts.microLending.loans(loanId);
      
      return {
        amount: ethers.formatEther(loan.amount),
        interestRate: Number(loan.interestRate) / 100, // Convert from basis points to percentage
        duration: Number(loan.duration) / (24 * 60 * 60), // Convert from seconds to days
        startTime: Number(loan.startTime) * 1000, // Convert to JS timestamp
        borrower: loan.borrower,
        lender: loan.lender,
        active: loan.active,
        repaid: loan.repaid
      };
    } catch (error) {
      console.error("Error checking loan status:", error);
      throw error;
    }
  }

  /**
   * Get a specific loan by ID
   */
  async getLoan(loanId) {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microLending) {
        throw new Error("MicroLending contract not initialized");
      }
      
      const loan = await this.contracts.microLending.loans(loanId);
      
      return {
        amount: ethers.formatEther(loan.amount),
        interestRate: Number(loan.interestRate) / 100, // Convert from basis points to percentage
        duration: Number(loan.duration) / (24 * 60 * 60), // Convert from seconds to days
        startTime: Number(loan.startTime) * 1000, // Convert to JS timestamp
        borrower: loan.borrower,
        lender: loan.lender,
        active: loan.active,
        repaid: loan.repaid
      };
    } catch (error) {
      console.error("Error getting loan:", error);
      return null;
    }
  }

  /**
   * Cancel a loan (only available for lender of an active, not-yet-taken loan)
   */
  async cancelLoan(loanId) {
    // This would require a custom function in your smart contract
    // For now, let's just throw an error
    throw new Error("Loan cancellation not implemented in smart contract");
  }

  /**
   * Get loan offering constraints from the contract
   */
  async getLoanConstraints() {
    await this.ensureInitializedOrReconnect();
    
    try {
      if (!this.contracts.microLending) {
        throw new Error("MicroLending contract not initialized");
      }
      
      const constraints = {
        minLoanAmount: "0.1",
        maxLoanAmount: "1000",
        minInterestRate: 5,
        maxInterestRate: 50,
        minDuration: 1,
        maxDuration: 365
      };
      
      // Try to read actual constraints from contract
      try {
        if (typeof this.contracts.microLending.minLoanAmount === 'function') {
          const minAmount = await this.contracts.microLending.minLoanAmount();
          constraints.minLoanAmount = ethers.formatEther(minAmount);
        }
        
        if (typeof this.contracts.microLending.maxLoanAmount === 'function') {
          const maxAmount = await this.contracts.microLending.maxLoanAmount();
          constraints.maxLoanAmount = ethers.formatEther(maxAmount);
        }
        
        if (typeof this.contracts.microLending.minInterestRate === 'function') {
          const minRate = await this.contracts.microLending.minInterestRate();
          constraints.minInterestRate = Number(minRate) / 100;
        }
        
        if (typeof this.contracts.microLending.maxInterestRate === 'function') {
          const maxRate = await this.contracts.microLending.maxInterestRate();
          constraints.maxInterestRate = Number(maxRate) / 100;
        }
        
        if (typeof this.contracts.microLending.maxLoanDuration === 'function') {
          const maxDuration = await this.contracts.microLending.maxLoanDuration();
          constraints.maxDuration = Math.floor(Number(maxDuration) / (24 * 60 * 60));
        }
        
        if (typeof this.contracts.microLending.minLoanDuration === 'function') {
          const minDuration = await this.contracts.microLending.minLoanDuration();
          constraints.minDuration = Math.ceil(Number(minDuration) / (24 * 60 * 60));
        }
      } catch (error) {
        console.log("Could not read contract constraints:", error.message);
      }
      
      console.log("Loan constraints:", constraints);
      return constraints;
    } catch (error) {
      console.error("Error getting loan constraints:", error);
      throw error;
    }
  }

  /**
   * Verify if a contract exists on the blockchain
   */
  async verifyContractExists(contractName) {
    if (!this.provider || !this.contracts[contractName]) return false;
    
    try {
      const address = this.contracts[contractName].target;
      const code = await this.provider.getCode(address);
      const exists = code !== "0x";
      
      if (!exists) {
        console.error(`Contract ${contractName} at ${address} has no bytecode`);
      }
      
      return exists;
    } catch (error) {
      console.error(`Error verifying ${contractName} contract:`, error);
      return false;
    }
  }
}

// Export a singleton instance as the default export
const contractServiceInstance = new ContractService();
export default contractServiceInstance;