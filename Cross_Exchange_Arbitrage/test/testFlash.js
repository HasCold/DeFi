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
    txArbitrage,
    formatDECIMAL;
    
    const USDC_WHALE = "0xcffad3200574698b78f32232aa9d63eabd290703";  // Means Search on google :- top 10 usdc address so you will get the addresses of  accounts who are holding large amount of usdc. So in this case we can get the dummy balance of this particular address
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
    const CONTRACT_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // myAddress

    const usdcInstance = new ethers.Contract(USDC, abi, provider);

    beforeEach(async () => {
      const DECIMALS = await usdcInstance.decimals();  // we are dealing with usdc and there decimal places is 6
      formatDECIMAL = Number(DECIMALS);

        const whale_balance = await provider.getBalance(USDC_WHALE);
        console.log("Whale Balance :- ", Number(whale_balance));
        expect(whale_balance).not.equal("0");

        // Deploy smart contract
        const FlashLoan = await ethers.getContractFactory("FlashLoan");  // create the instance of our contract
        FLASHLOAN = await FlashLoan.deploy(); // Now deploy the instance of flashloan contract into Hardhat environment        
        console.log("FlashLoan contract address:", FLASHLOAN.target);

        const borrowAmountHuman = "3.35";   // 100 usdc borrow as a flashLoan by liquidity pool
        BORROW_AMOUNT = ethers.parseUnits(borrowAmountHuman, formatDECIMAL);

        initialFundingHuman = "200";  // 100 usdc initiall funding transfer to the contract 
        FUND_AMOUNT = ethers.parseUnits(initialFundingHuman, formatDECIMAL);
    
    // Fund the smart contract
        await fundContract(
          usdcInstance,
          USDC_WHALE,
          FLASHLOAN.target,
          initialFundingHuman,
          formatDECIMAL
        )
      
    });

    describe("Arbitrage Execution", () => {
      it('Ensures the contract is funded', async () => {
          const flashLoanBalance = await FLASHLOAN.getBalanceOfToken(USDC);
          const flashLoanBalanceHuman = ethers.formatUnits(flashLoanBalance, formatDECIMAL);

          expect(Number(flashLoanBalanceHuman)).equal(Number(initialFundingHuman));
      });

      it("Execute the Arbitrage", async () => {
        txArbitrage = await FLASHLOAN.initiateArbitrage(USDC, BORROW_AMOUNT);
        assert(txArbitrage); // Console what we receive from txArbitrage
      
        // Print balances
      const contractBalanceUSDC = await FLASHLOAN.getBalanceOfToken(USDC);
      const formattedBalUSDC = Number(
        ethers.formatUnits(contractBalanceUSDC, formatDECIMAL)
      );
      console.log("Balance of USDC: " + formattedBalUSDC);

      const formatBalanceLINK = await FLASHLOAN.getBalanceOfToken(LINK);
      const formattedBalLINK = ethers.formatUnits(formatBalanceLINK, formatDECIMAL);
      console.log("Balance of LINK: " + formattedBalLINK);
    });
   });

});
