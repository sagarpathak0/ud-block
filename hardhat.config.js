require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

console.log("Sepolia URL:", SEPOLIA_RPC_URL ? SEPOLIA_RPC_URL.substring(0, 30) + "..." : "Not found");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    artifacts: './artifacts',
    sources: './contracts',
    tests: './test',
    cache: './cache',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      blockConfirmations: 6,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
