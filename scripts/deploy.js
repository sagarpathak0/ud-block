const { ethers } = require("hardhat");

async function main() {
  // Deploy test token
  const TestToken = await ethers.getContractFactory("TestToken");
  // Remove the constructor parameter - TestToken doesn't accept any
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  console.log("TestToken deployed to:", await testToken.getAddress());

  // Deploy BudgetManager
  const BudgetManager = await ethers.getContractFactory("BudgetManager");
  const budgetManager = await BudgetManager.deploy();
  await budgetManager.waitForDeployment();
  console.log("BudgetManager deployed to:", await budgetManager.getAddress());

  // For MicroInvestor, we're using a placeholder yield protocol address
  const placeholderYieldProtocol = "0x0000000000000000000000000000000000000001";
  const minimumInvestmentAmount = ethers.parseEther("1"); // 1 token

  // Deploy MicroInvestor
  const MicroInvestor = await ethers.getContractFactory("MicroInvestor");
  const microInvestor = await MicroInvestor.deploy(
    await testToken.getAddress(), 
    placeholderYieldProtocol,
    minimumInvestmentAmount
  );
  await microInvestor.waitForDeployment();
  console.log("MicroInvestor deployed to:", await microInvestor.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });