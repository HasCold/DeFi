const {expect, assert} = require("chai");
const {ethers} = require("hardhat");
const {fundContract} = require("../utils/fundContract");

const {abi} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Ji_tl_FZTwFdDAqE3KtS8yDRUXUpaG_d");  // Accessing the forked network through which we can interact with the blockchain on locally 

describe('FlashLoan Contract', () => {
    let FLASHLOAN,
    BORROW_AMOUNT,
    FUND_AMOUNT,
    initialFundingHuman,
    txArbitrage;
    
    const USDC_WHALE = "0xcffad3200574698b78f32232aa9d63eabd290703";  // Means Search on google :- top 10 usdc address so you will get the addresses of  accounts who are holding large amount of usdc. So in this case we can get the dummy balance of this particular address
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    
    const DECIMALS = IERC20(USDC).decimals();  // we are dealing with usdc and there decimal places is 6

  const usdcInstance = new ethers.Contract(USDC, abi, provider);

    beforeEach(async () => {
        const whale_balance = await provider.getBalance(USDC_WHALE);
        console.log("Whale Balance :- ", Number(whale_balance));
        expect(whale_balance).not.equal("0");

        // Deploy smart contract
        const FlashLoan = await ethers.getContractFactory("FlashLoan");  // create the instance of our contract
        FLASHLOAN = await FlashLoan.deploy(); // Now deploy the instance of flashloan contract into Hardhat environment        
        console.log("FlashLoan contract address:", FLASHLOAN.target);

        const borrowAmountHuman = "1";
        BORROW_AMOUNT = ethers.parseUnits(borrowAmountHuman, DECIMALS);

        initialFundingHuman = "100";  // 100 busd
        FUND_AMOUNT = ethers.parseUnits(initialFundingHuman, DECIMALS);
    
    // Fund the smart contract
        await fundContract(
          usdcInstance,
          USDC_WHALE,
          FLASHLOAN.target,
          initialFundingHuman
        )
      
    });

    describe("Arbitrage Execution", () => {
      it('Ensures the contract is funded', async () => {
          const flashLoanBalance = await FLASHLOAN.getBalanceOfToken(USDC);
          const flashLoanBalanceHuman = ethers.formatUnits(flashLoanBalance, DECIMALS);

          expect(Number(flashLoanBalanceHuman)).equal(Number(initialFundingHuman));
      });

      it("Execute the Arbitrage", async () => {
        txArbitrage = await FLASHLOAN.initiateArbitrage(USDC, BORROW_AMOUNT);
        assert(txArbitrage); // Console what we receive from txArbitrage
      
        // Print balances
      const contractBalanceUSDC = await FLASHLOAN.getBalanceOfToken(USDC);
      const formattedBalUSDC = Number(
        ethers.formatUnits(contractBalanceUSDC, DECIMALS)
      );
      console.log("Balance of USDC: " + formattedBalUSDC);

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
