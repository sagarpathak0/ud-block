const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying inclusive banking contracts...");
  
  // Get the TestToken address (we need this for the other contracts)
  const testTokenAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"; // Use your existing token
  
  // Deploy MicroLending
  const MicroLending = await ethers.getContractFactory("MicroLending");
  const microLending = await MicroLending.deploy(testTokenAddress);
  await microLending.waitForDeployment();
  console.log("MicroLending deployed to:", await microLending.getAddress());
  
  // Deploy CommunitySavings
  const CommunitySavings = await ethers.getContractFactory("CommunitySavings");
  const communitySavings = await CommunitySavings.deploy(testTokenAddress);
  await communitySavings.waitForDeployment();
  console.log("CommunitySavings deployed to:", await communitySavings.getAddress());
  
  // Deploy FinancialEducation
  const FinancialEducation = await ethers.getContractFactory("FinancialEducation");
  const financialEducation = await FinancialEducation.deploy();
  await financialEducation.waitForDeployment();
  console.log("FinancialEducation deployed to:", await financialEducation.getAddress());
  
  // For easy copy-paste into frontend App.js
  console.log("\nCopy these addresses to your frontend App.js CONTRACT_ADDRESSES:");
  console.log(`microLending: "${await microLending.getAddress()}",`);
  console.log(`communitySavings: "${await communitySavings.getAddress()}",`);
  console.log(`financialEducation: "${await financialEducation.getAddress()}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });