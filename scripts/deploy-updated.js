const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper function to write deployment addresses
async function writeDeploymentAddresses(addresses) {
  // Write to JSON file for reference
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  
  // Update .env file
  let envContent = fs.readFileSync(".env", "utf8");
  
  // Update each contract address in .env
  for (const [key, value] of Object.entries(addresses)) {
    let envVarName;
    switch(key) {
      case "budgetManager": envVarName = "REACT_APP_BUDGET_MANAGER_ADDRESS"; break;
      case "microInvestor": envVarName = "REACT_APP_MICRO_INVESTOR_ADDRESS"; break;
      case "testToken": envVarName = "REACT_APP_TEST_TOKEN_ADDRESS"; break;
      case "fraudAnalytics": envVarName = "REACT_APP_FRAUD_ANALYTICS_ADDRESS"; break;
      case "inclusiveBanking": envVarName = "REACT_APP_INCLUSIVE_BANKING_ADDRESS"; break;
      default: continue;
    }
    
    // Replace existing value or add new line
    if (envContent.includes(`${envVarName}=`)) {
      envContent = envContent.replace(
        new RegExp(`${envVarName}=.*`),
        `${envVarName}=${value}`
      );
    } else {
      envContent += `\n${envVarName}=${value}`;
    }
  }
  
  fs.writeFileSync(".env", envContent);
  console.log("Updated .env file with contract addresses");
}

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Fixed: Use provider to get balance in ethers.js v6
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));
  
  // Create variables to store contract addresses
  let testTokenAddress, budgetManagerAddress, microInvestorAddress, 
      fraudAnalyticsAddress, inclusiveBankingAddress;
  
  // Deploy TestToken
  console.log("Deploying TestToken...");
  const TestToken = await ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  testTokenAddress = await testToken.getAddress();
  console.log("TestToken deployed to:", testTokenAddress);
  
  // Deploy BudgetManager
  console.log("Deploying BudgetManager...");
  const BudgetManager = await ethers.getContractFactory("BudgetManager");

  try {
    // Option 1: If BudgetManager constructor takes a token address
    const budgetManager = await BudgetManager.deploy(testTokenAddress);
    await budgetManager.waitForDeployment();
    budgetManagerAddress = await budgetManager.getAddress();
    console.log("BudgetManager deployed to:", budgetManagerAddress);
  } catch (error) {
    console.error("Error deploying BudgetManager:", error.message);
    
    try {
      console.log("Trying to deploy BudgetManager without arguments...");
      const budgetManager = await BudgetManager.deploy();
      await budgetManager.waitForDeployment();
      budgetManagerAddress = await budgetManager.getAddress();
      console.log("BudgetManager deployed to:", budgetManagerAddress);
    } catch (fallbackError) {
      console.error("Failed to deploy BudgetManager with fallback method:", fallbackError.message);
      // Don't exit, just continue with other deployments
      console.log("Continuing with other deployments...");
    }
  }
  
  // Deploy MicroInvestor
  console.log("Deploying MicroInvestor...");
  try {
    const MicroInvestor = await ethers.getContractFactory("MicroInvestor");
    const yieldProtocolAddress = deployer.address; // Use deployer as mock yield protocol
    const minimumInvestmentAmount = ethers.parseEther("0.1"); // 0.1 TOKEN minimum
    const microInvestor = await MicroInvestor.deploy(
      testTokenAddress,
      yieldProtocolAddress,
      minimumInvestmentAmount
    );
    await microInvestor.waitForDeployment();
    microInvestorAddress = await microInvestor.getAddress();
    console.log("MicroInvestor deployed to:", microInvestorAddress);
  } catch (error) {
    console.error("Error deploying MicroInvestor:", error.message);
  }
  
  // Deploy FraudAnalytics
  console.log("Deploying FraudAnalytics...");
  try {
    const FraudAnalytics = await ethers.getContractFactory("FraudAnalytics");
    const fraudAnalytics = await FraudAnalytics.deploy();
    await fraudAnalytics.waitForDeployment();
    fraudAnalyticsAddress = await fraudAnalytics.getAddress();
    console.log("FraudAnalytics deployed to:", fraudAnalyticsAddress);
  } catch (error) {
    console.error("Error deploying FraudAnalytics:", error.message);
  }
  
  // Deploy InclusiveBanking
  console.log("Deploying InclusiveBanking...");
  try {
    const InclusiveBanking = await ethers.getContractFactory("InclusiveBanking");
    const inclusiveBanking = await InclusiveBanking.deploy(testTokenAddress);
    await inclusiveBanking.waitForDeployment();
    inclusiveBankingAddress = await inclusiveBanking.getAddress();
    console.log("InclusiveBanking deployed to:", inclusiveBankingAddress);
  } catch (error) {
    console.error("Error deploying InclusiveBanking:", error.message);
  }
  
  // Set up trusted analyzer role if both contracts were deployed
  if (fraudAnalyticsAddress && inclusiveBankingAddress) {
    try {
      console.log("Setting up trusted analyzer...");
      const fraudAnalytics = await ethers.getContractAt("FraudAnalytics", fraudAnalyticsAddress);
      const addAnalyzerTx = await fraudAnalytics.addTrustedAnalyzer(inclusiveBankingAddress);
      await addAnalyzerTx.wait();
      console.log("Set InclusiveBanking as trusted analyzer in FraudAnalytics");
    } catch (error) {
      console.error("Error setting trusted analyzer:", error.message);
    }
  }
  
  // Write deployment addresses to file and update .env
  const addresses = {
    testToken: testTokenAddress,
    budgetManager: budgetManagerAddress,
    microInvestor: microInvestorAddress,
    fraudAnalytics: fraudAnalyticsAddress,
    inclusiveBanking: inclusiveBankingAddress
  };

  // Filter out undefined addresses
  const validAddresses = Object.fromEntries(
    Object.entries(addresses).filter(([_, value]) => value !== undefined)
  );
  
  await writeDeploymentAddresses(validAddresses);
  
  console.log("\nDeployment complete! Contract addresses:");
  console.log(JSON.stringify(validAddresses, null, 2));
  
  console.log("\nVerify contracts on Etherscan with:");
  if (testTokenAddress) {
    console.log(`npx hardhat verify --network sepolia ${testTokenAddress}`);
  }
  if (budgetManagerAddress && testTokenAddress) {
    console.log(`npx hardhat verify --network sepolia ${budgetManagerAddress} ${testTokenAddress}`);
  }
  if (microInvestorAddress && testTokenAddress) {
    console.log(`npx hardhat verify --network sepolia ${microInvestorAddress} ${testTokenAddress} ${deployer.address} ${ethers.parseEther("0.1")}`);
  }
  if (fraudAnalyticsAddress) {
    console.log(`npx hardhat verify --network sepolia ${fraudAnalyticsAddress}`);
  }
  if (inclusiveBankingAddress && testTokenAddress) {
    console.log(`npx hardhat verify --network sepolia ${inclusiveBankingAddress} ${testTokenAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });