const {ethers} = require("ethers");
const Quoter = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Ji_tl_FZTwFdDAqE3KtS8yDRUXUpaG_d"); // Ethereum alchemy mainnet rpc provider

const priceFetch = async (addressFrom, addressTo, humanValue) => {

    const QUOTER_CONTRACT_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

    const quoterContract = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,  // Contract Address
        Quoter.abi,  // ABI Code
        provider   // Runner 
    );
        
    const amountIn = ethers.parseUnits(humanValue, 18);
    // console.log("-----------------------------", quoterContract.quoteExactInputSingle);

    const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
        addressFrom,
        addressTo,
        3000,
        amountIn,
        0
    );

    const amount = ethers.formatUnits(quotedAmountOut, 18); // -->> Human-Readable form   // 1 ETH = 10^18 wei  and 1 ETH = 10^9 gwei
    return amount;
}


const main = async () => {
    const addressFrom = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";  // WETH Smart Contract Address
    const addressTo = "0x6B175474E89094C44Da98b954EedeAC495271d0F";   // DAI Smart Contract Address

    const humanValue = "1"; // 1 WETH
    const res = await priceFetch(addressFrom, addressTo, humanValue);
    console.log("Res", res);
}

main();

// Slippage refers to the difference between the expected price of a trade and the actual price at which the trade is executed. 