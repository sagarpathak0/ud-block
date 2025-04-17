const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BudgetManager", function () {
  let budgetManager;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const BudgetManager = await ethers.getContractFactory("BudgetManager");
    // Deploy and wait for it in one step - remove the .deployed() call
    budgetManager = await BudgetManager.deploy();
    
    // No need for await budgetManager.deployed() in newer ethers.js versions
  });

  it("Should create a new budget", async function () {
    const category = "Food";
    const limit = ethers.parseEther("100");  // Updated parseEther syntax
    
    await budgetManager.connect(user).createBudget(category, limit);
    
    const budget = await budgetManager.connect(user).getBudget(0);
    
    expect(budget[0]).to.equal(limit); // limit
    expect(budget[1]).to.equal(0); // spent
    expect(budget[3]).to.equal(category); // category
  });

  it("Should record expenses", async function () {
    const category = "Entertainment";
    const limit = ethers.parseEther("100");  // Updated parseEther syntax
    const expense = ethers.parseEther("30");  // Updated parseEther syntax
    
    await budgetManager.connect(user).createBudget(category, limit);
    await budgetManager.connect(user).recordExpense(0, expense);
    
    const budget = await budgetManager.connect(user).getBudget(0);
    expect(budget[1]).to.equal(expense); // spent should equal the expense
  });
});