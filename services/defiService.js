import { ethers } from "ethers";
import BudgetManagerABI from "../abis/BudgetManager.json";
import MicroInvestorABI from "../abis/MicroInvestor.json";
import TestTokenABI from "../abis/TestToken.json";

export class DefiService {
  constructor(provider) {
    this.provider = new ethers.providers.Web3Provider(provider);
    this.signer = this.provider.getSigner();
    
    // Contract addresses would come from your deployment
    const BUDGET_MANAGER_ADDRESS = "YOUR_DEPLOYED_ADDRESS";
    const MICRO_INVESTOR_ADDRESS = "YOUR_DEPLOYED_ADDRESS";
    const TEST_TOKEN_ADDRESS = "YOUR_DEPLOYED_ADDRESS";
    
    this.budgetManager = new ethers.Contract(
      BUDGET_MANAGER_ADDRESS,
      BudgetManagerABI.abi,
      this.signer
    );
    
    this.microInvestor = new ethers.Contract(
      MICRO_INVESTOR_ADDRESS,
      MicroInvestorABI.abi,
      this.signer
    );
    
    this.testToken = new ethers.Contract(
      TEST_TOKEN_ADDRESS,
      TestTokenABI.abi,
      this.signer
    );
  }

  // Budget functions
  async createBudget(category, limit) {
    const tx = await this.budgetManager.createBudget(category, ethers.utils.parseEther(limit.toString()));
    return tx.wait();
  }

  async recordExpense(budgetId, amount) {
    const tx = await this.budgetManager.recordExpense(budgetId, ethers.utils.parseEther(amount.toString()));
    return tx.wait();
  }

  async getBudget(budgetId) {
    const budget = await this.budgetManager.getBudget(budgetId);
    return {
      limit: ethers.utils.formatEther(budget[0]),
      spent: ethers.utils.formatEther(budget[1]),
      lastReset: new Date(budget[2].toNumber() * 1000),
      category: budget[3]
    };
  }

  // Microinvestment functions
  async depositForInvestment(amount) {
    // First approve the token transfer
    const amountWei = ethers.utils.parseEther(amount.toString());
    const approveTx = await this.testToken.approve(this.microInvestor.address, amountWei);
    await approveTx.wait();
    
    // Then make the deposit
    const tx = await this.microInvestor.deposit(amountWei);
    return tx.wait();
  }

  async withdrawInvestment(amount) {
    const tx = await this.microInvestor.withdraw(ethers.utils.parseEther(amount.toString()));
    return tx.wait();
  }

  async getUserBalance() {
    const balance = await this.microInvestor.getUserBalance();
    return ethers.utils.formatEther(balance);
  }
}