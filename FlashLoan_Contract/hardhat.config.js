require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {  // Because we are using the different versions of solidity smart contract so that's why we are declaring the compilers version
    compilers: [
      { version: "0.5.5" },
      { version: "0.6.6" },
      { version: "0.8.8" },
    ],
  },
  networks: {
    hardhat: {
      forking: { // we have forked the binance smart chain on our local pc and runs on our pc without affecting the mainnet
        url: "https://bsc-dataseed3.binance.org/",  // Binance RPC nodes because pancakeswap runs on the bsc chain 
      },
    },
  },
};