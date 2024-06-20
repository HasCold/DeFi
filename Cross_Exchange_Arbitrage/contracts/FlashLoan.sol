// SPDX-License-Identifier: UNLICENSED
pragma solidity = 0.6.6;

// Uniswap interfaces and library imports
import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./libs/UniswapV2Library.sol";
import "./libs/SafeERC20.sol";
import "hardhat/console.sol";

contract FlashLoan{
    using SafeERC20 for IERC20;

    // Factory and Routing address
    address private constant UNISWAP_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private constant UNISWAP_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant SUSHI_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
    address private constant SUSHI_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

    // Token Addresses
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;  // WETH contract address
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant LINK = 0x514910771AF9Ca656af840dff83E8264EcF986CA;

    uint256 private deadline = block.timestamp + 1 days;
    uint256 private constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;  // Found on the OpenZepplin library maximum integer in solidity

    function checkResult (uint _repayAmount, uint _acquiredCoin) private pure returns(bool) {
        return _acquiredCoin > _repayAmount;
    }

    function placeTrade (address _fromToken, address _toToken, uint _amountIn, address _factory, address _router) private returns(uint) {
        address pair = IUniswapV2Factory(_factory).getPair(_fromToken, _toToken);
        require(pair != address(0), "Pool doesn't match");

        address[] memory path = new address[](2); // length of array is 2
        path[0] = _fromToken;
        path[1] = _toToken;

        uint amountReq = IUniswapV2Router01(_router).getAmountsOut(_amountIn, path)[1]; // How much estimated amount of token we can get
        uint amountReceived = IUniswapV2Router01(_router).swapExactTokensForTokens(_amountIn, amountReq, path, address(this), deadline)[1]; // deadline expected till 1 day 

        require(amountReceived > 0, "Transaction Abort");
        return amountReceived;
    }
    
    function getBalanceOfToken(address _address) public view returns (uint256){
        return IERC20(_address).balanceOf(address(this));
    }

    function initiateArbitrage(address _tokenBorrow, uint _amount) external {
        // Performing triangular arbitarge between USDC, LINK and WETH on between two exchanges.

      // Basically hum apne sushiswap and uniswap router ko complete authority de rahe ha ke wo hamare behalf pr unlimited amount of tokens ko spend krskta ha 
        // UNISWAP DEX
        IERC20(WETH).safeApprove(address(UNISWAP_ROUTER), MAX_INT);
        IERC20(USDC).safeApprove(address(UNISWAP_ROUTER), MAX_INT); 
        IERC20(LINK).safeApprove(address(UNISWAP_ROUTER), MAX_INT); 

        // SUSHISWAP DEX
        IERC20(WETH).safeApprove(address(SUSHI_ROUTER), MAX_INT);
        IERC20(USDC).safeApprove(address(SUSHI_ROUTER), MAX_INT); 
        IERC20(LINK).safeApprove(address(SUSHI_ROUTER), MAX_INT); 


        // Accessing the liquidity Pools ; basically it means we are going to tell the UniswapV2Factory to give that liquidity pools those are dealing with these trading pairs BUSD and WETH. 
        address pair = IUniswapV2Factory(UNISWAP_FACTORY).getPair(_tokenBorrow, WETH);  //  0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16
        
        require(pair != address(0), "Pool doesn't exist");  // 0x0000000000000000000000000000000000000000. It is often used to signify the absence of an address or a null address.

        // Factory Contract -->>  Liquidity Pool Address -->> Token Pair Address;
        // Take the liquidity pool address and give the token0 and token1 (ERC20) address
        address token0 = IUniswapV2Pair(pair).token0();  // WETH
        address token1 = IUniswapV2Pair(pair).token1();  // BUSD

        uint amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint amount1Out = _tokenBorrow == token1 ? _amount : 0;

    // We are telling our liquidity pool that transfer the amount of busd in our smart contract address ; amount0 = 0, amount1 = _amount 
        bytes memory data = abi.encode(_tokenBorrow, _amount, msg.sender); // The abi.encode function takes the arguments _tokenBorrow, _amount, and msg.sender and encodes them into a single bytes array. ABI encoding is a standardized format used to serialize data in Ethereum smart contracts.
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data); // This is an interface for a Uniswap V2 pair contract. It defines the functions that can be called on the pair contract (Liquidity Pool Contract).
    }

    function uniswapV2Call(address _sender, uint _amount0, uint _amount1, bytes calldata _data) external {  // we have to call this function within swap function becuase now we have tokenBorrowed so we can do the triangular arbitrage
        // Single Entity calling whole Contract (msg.sender)  -->>  Function initiateArbitrage (msg.sender)  -->> Function pancakeCall  
        address token0 = IUniswapV2Pair(msg.sender).token0(); 
        address token1 = IUniswapV2Pair(msg.sender).token1();
    
        address pair = IUniswapV2Factory(UNISWAP_FACTORY).getPair(token0, token1);
        require(msg.sender == pair, "Pair doesn't match");
        require(_sender == address(this), "Sender doesn't match");
    
        // Decode the data variable
        (address tokenBorrow, uint amount, address myAddress) = abi.decode(_data, (address, uint, address));
        
        // fee calculation 
        uint fee = ((amount * 3)/997) + 1;
        uint repayAmount = amount + fee;
        uint loanAmount = _amount0 > 0 ? _amount0 : _amount1;  // Pay the BUSD token back

        // Triangular Arbitrage
        uint trade1Coin = placeTrade(USDC, LINK, loanAmount, UNISWAP_FACTORY, UNISWAP_ROUTER);   // Exchange USDC to LINK on UniSwap DEX
        console.log("Trade 1 Coin :- ", trade1Coin);

        uint trade2Coin = placeTrade(LINK, USDC, trade1Coin, SUSHI_FACTORY, SUSHI_ROUTER);   // Exchange LINK to USDC on SushiSwap DEX, trade1Coin = Amount of LINK token 
        console.log("Trade 2 Coin :- ", trade2Coin);

                                    // 10         15        -->> Profitable scenario
        bool profCheck = checkResult(repayAmount, trade2Coin); 
        require(profCheck, "Arbitrage is not Profitable");

        // Pay Myself
        IERC20 otherToken = IERC20(USDC);
        otherToken.transfer(myAddress, trade2Coin - repayAmount);

        // Pay Loan Back
        IERC20(tokenBorrow).transfer(pair, repayAmount);
    }
}