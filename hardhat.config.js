require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: './artifacts',
    sources: './contracts',
    tests: './test',
    cache: './cache',
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
