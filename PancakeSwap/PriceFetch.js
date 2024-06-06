const ethers = require ("ethers");
const {factoryAddress, routerAddress, fromAddress, toAddress} = require('./AddressList');
const {erc20ABI, factoryABI, pairABI, routerABI} = require("./AbiInfo");

const provider = new ethers.JsonRpcProvider("https://bsc-dataseed2.binance.org/")  // bsc public rpc provider

const factoryInstance = new ethers.Contract(factoryAddress, factoryABI, provider);  // creating an instance means object

const routerInstance = new ethers.Contract(routerAddress, routerABI, provider);

const priceFetch = async (amount) => {
    const token1 = new ethers.Contract(fromAddress, erc20ABI, provider);
    const token2 = new ethers.Contract(toAddress, erc20ABI, provider);

    const decimal1 = await token1.decimals();
    const decimal2 = await token2.decimals();

    const amountIn = ethers.parseUnits(amount, decimal1).toString();  // Decimal places for busd token is 10^18 wei
    
    // How much WBNB we get we can know by the converting the BUSD by the below function 
    const amountsOut = await routerInstance.getAmountsOut(amountIn, [
        fromAddress,
        toAddress
    ])
    const humanReadableOutput = ethers.formatUnits(amountsOut[1].toString(), decimal2);
    console.log("This is the number of WBNB token price :- ", humanReadableOutput);
}

humanFormat = "100"
priceFetch(humanFormat);