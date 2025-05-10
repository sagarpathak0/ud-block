const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function saveAddresses(addresses) {
  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  // Write to JSON file
  fs.writeFileSync(
    path.join(deploymentsDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  
  // Create .env file contents for frontend
  let envContent = '';
  Object.entries(addresses).forEach(([key, value]) => {
    const envKey = `REACT_APP_${key.toUpperCase()}_ADDRESS`;
    envContent += `${envKey}=${value}\n`;
  });
  
  envContent += '\nREACT_APP_NETWORK_ID=1337\n';
  envContent += 'REACT_APP_NETWORK_NAME=Hardhat Network\n';
  
  // Write to frontend .env
  fs.writeFileSync(
    path.join(__dirname, "../frontend/.env"),
    envContent
  );
  
  console.log("Contract addresses saved to deployments/addresses.json");
  console.log("Frontend .env file updated with new addresses");
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy TestToken
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
  
  // Deploy MicroInvestor
  const placeholderYieldProtocol = deployer.address; // Use deployer as mock yield protocol
  const minimumInvestmentAmount = ethers.parseEther("0.1"); // 0.1 TOKEN minimum
  
  const MicroInvestor = await ethers.getContractFactory("MicroInvestor");
  const microInvestor = await MicroInvestor.deploy(
    testTokenAddress,
    placeholderYieldProtocol,
    minimumInvestmentAmount
  );
  await microInvestor.waitForDeployment();
  const microInvestorAddress = await microInvestor.getAddress();
  console.log("MicroInvestor deployed to:", microInvestorAddress);
  
  // Save all addresses
  const addresses = {
    testToken: testTokenAddress,
    budgetManager: budgetManagerAddress,
    microInvestor: microInvestorAddress
  };
  
  await saveAddresses(addresses);
  
  console.log("\nDeployment complete!");
  console.log("Copy these addresses to your App.js if needed:");
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