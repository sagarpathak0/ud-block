const { ethers } = require("hardhat");

async function main() {
  // Deploy the updated TestToken
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  const testTokenAddress = await testToken.getAddress();
  console.log("TestToken deployed to:", testTokenAddress);

  // Deploy BudgetManager
  const BudgetManager = await ethers.getContractFactory("BudgetManager");
  const budgetManager = await BudgetManager.deploy();
  await budgetManager.waitForDeployment();
  const budgetManagerAddress = await budgetManager.getAddress();
  console.log("BudgetManager deployed to:", budgetManagerAddress);

  // For MicroInvestor, using the new TestToken address
  const placeholderYieldProtocol = "0x0000000000000000000000000000000000000001";
  const minimumInvestmentAmount = ethers.parseEther("1"); // 1 token

  // Deploy MicroInvestor with the new TestToken address
  const MicroInvestor = await ethers.getContractFactory("MicroInvestor");
  const microInvestor = await MicroInvestor.deploy(
    testTokenAddress, 
    placeholderYieldProtocol,
    minimumInvestmentAmount
  );
  await microInvestor.waitForDeployment();
  const microInvestorAddress = await microInvestor.getAddress();
  console.log("MicroInvestor deployed to:", microInvestorAddress);

  // For easy copy-paste into frontend
  console.log("\nCopy these addresses to your frontend App.js CONTRACT_ADDRESSES:");
  console.log(`budgetManager: "${budgetManagerAddress}",`);
  console.log(`microInvestor: "${microInvestorAddress}",`); 
  console.log(`testToken: "${testTokenAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });