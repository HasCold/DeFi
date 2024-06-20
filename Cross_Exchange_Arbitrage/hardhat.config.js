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
      forking: { // we have forked the ethereum mainnet on our local pc by alchemy and runs on our pc without affecting the mainnet
        url: "https://eth-mainnet.g.alchemy.com/v2/Ji_tl_FZTwFdDAqE3KtS8yDRUXUpaG_d",  // Alchemy RPC nodes because UniSwap and SushiSwap runs on the ethereum mainnet blockchain. 
      },
    },
  },
};