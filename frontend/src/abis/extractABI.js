const fs = require('fs');
const path = require('path');

// Define your contract names
const contracts = ['BudgetManager', 'MicroInvestor', 'TestToken'];

// Create the directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname))) {
  fs.mkdirSync(path.join(__dirname), { recursive: true });
}

contracts.forEach(contractName => {
  try {
    // Try to find the artifact file
    let artifactPath = path.join(__dirname, '../../../artifacts/contracts/', 
      `${contractName}.sol/${contractName}.json`);
    
    // Check if file exists
    if (!fs.existsSync(artifactPath)) {
      console.error(`Artifact not found for ${contractName} at ${artifactPath}`);
      return;
    }
    
    // Read the artifact file
    const artifact = require(artifactPath);
    
    // Create a simpler ABI file with just what we need
    const abiData = {
      abi: artifact.abi,
      contractName: contractName
    };
    
    // Write the extracted ABI to a new file
    fs.writeFileSync(
      path.join(__dirname, `${contractName}.json`),
      JSON.stringify(abiData, null, 2)
    );
    
    console.log(`Successfully extracted ABI for ${contractName}`);
  } catch (error) {
    console.error(`Error extracting ABI for ${contractName}:`, error);
  }
});

console.log('ABI extraction complete');