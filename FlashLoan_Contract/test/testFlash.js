const {expect, assert} = require("chai");
const {ethers} = require("hardhat");
const {fundContract} = require("../utils/fundContract");

const {abi} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

const provider = new ethers.JsonRpcProvider("https://bsc-dataseed3.binance.org/");  // Accessing the forked network thorugh which we can interact with the blockchain on locally 

describe('FlashLoan Contract', () => {
    let FLASHLOAN,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage;

    const DECIMALS = 18;  // 1 ether/eth = 10^18 wei  and  1 ether/eth = 10^9 gwei

  const BUSD_WHALE = "0xf977814e90da44bfa03b6295a0616a897441acec";  // Means Search on google :- top 10 busd address so you will get the addresses of 0xf977814e90da44bfa03b6295a0616a897441acec accounts who are holding large amount of busd. So in this case we can get the dummy balance of this particular address
  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
  const CROX = "0x2c094F5A7D1146BB93850f629501eB749f6Ed491";

  const busdInstance = new ethers.Contract(BUSD, abi, provider);

    beforeEach(async () => {
        const whale_balance = await provider.getBalance(BUSD_WHALE);
        console.log("Whale Balance :- ", Number(whale_balance));
        expect(whale_balance).not.equal("0");

        // Deploy smart contract
        const FlashLoan = await ethers.getContractFactory("FlashLoan");  // create the instance of our contract
        FLASHLOAN = await FlashLoan.deploy(); // Now deploy the instance of flashloan contract into Hardhat environment        
        console.log("FlashLoan contract address:", FLASHLOAN.target);

        const borrowAmountHuman = "1";  // 1 busd borrow as a flashLoan by liquidity pool
        BORROW_AMOUNT = ethers.parseUnits(borrowAmountHuman, DECIMALS);

        initialFundingHuman = "100";  // 100 busd initiall funding to a smart contract by the whale address
        FUND_AMOUNT = ethers.parseUnits(initialFundingHuman, DECIMALS);
    
    // Fund the smart contract
        await fundContract(
          busdInstance,
          BUSD_WHALE,
          FLASHLOAN.target,
          initialFundingHuman
        )
      
    });

    describe("Arbitrage Execution", () => {
      it('Ensures the contract is funded', async () => {
          const flashLoanBalance = await FLASHLOAN.getBalanceOfToken(BUSD);
          const flashLoanBalanceHuman = ethers.formatUnits(flashLoanBalance, DECIMALS);

          expect(Number(flashLoanBalanceHuman)).equal(Number(initialFundingHuman));
      });

      it("Execute the Arbitrage", async () => {
        txArbitrage = await FLASHLOAN.initiateArbitrage(BUSD, BORROW_AMOUNT);
        assert(txArbitrage); // Console what we receive from txArbitrage
      
        // Print balances
      const contractBalanceBUSD = await FLASHLOAN.getBalanceOfToken(BUSD);
      const formattedBalBUSD = Number(
        ethers.formatUnits(contractBalanceBUSD, DECIMALS)
      );
      console.log("Balance of BUSD: " + formattedBalBUSD);

      const contractBalanceCROX = await FLASHLOAN.getBalanceOfToken(CROX);
      const formattedBalCROX = Number(
        ethers.formatUnits(contractBalanceCROX, DECIMALS)
      );
      console.log("Balance of CROX: " + formattedBalCROX);

      const contractBalanceCAKE = await FLASHLOAN.getBalanceOfToken(CAKE);
      const formattedBalCAKE = Number(
        ethers.formatUnits(contractBalanceCAKE, DECIMALS)
      );
      console.log("Balance of CAKE: " + formattedBalCAKE);
      });

    })
});
