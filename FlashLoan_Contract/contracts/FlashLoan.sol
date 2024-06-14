// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uniswap interfaces and library imports
import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./libs/UniswapV2Library.sol";
import "./libs/SafeERC20.sol";

contract FlashLoan{
    using SafeERC20 for IERC20;

    // Factory and Routing address
    address private constant PANCAKE_FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address private constant PANCAKE_ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;

    // Token Addresses
    address private constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant CROX = 0x2c094F5A7D1146BB93850f629501eB749f6Ed491;
    address private constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;

    uint256 private deadline = block.timestamp + 1 days;
    uint256 private constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;  // Found on the OpenZepplin library maximum integer in solidity

    
    function initiateArbitrage(address _busdBorrow, uint _amount) {
        // Performing triangular arbitarge between BUSD, CROX and CAKE.

        IERC20(BUSD).safeApprove(address(PANCAKE_ROUTER), MAX_INT);  // Basically hum apne pancake router ko complete authority de rahe ha ke wo hamare behalf pr unlimited amount of tokens ko spend krskta ha 
        IERC20(CROX).safeApprove(address(PANCAKE_ROUTER), MAX_INT); 
        IERC20(CAKE).safeApprove(address(PANCAKE_ROUTER), MAX_INT); 

        // Accessing the liquidity Pools ; basically it means we are going to tell the UniswapV2Factory to give that liquidity pools those are dealing with these trading pairs BUSD and WBNB. 
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(_busdBorrow, WBNB);  //  0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16
        
        require(pair != address(0), "Pool doesn't exist");  // 0x0000000000000000000000000000000000000000. It is often used to signify the absence of an address or a null address.

        // Factory Contract -->>  Liquidity Pool Address -->> Token Pair Address;
        // Take the liquidity pool address and give the token0 and token1 (ERC20) address
        address token0 = IUniswapV2Pair(pair).token0();  // WBNB
        address token1 = IUniswapV2Pair(pair).token1();  // BUSD

        uint amount0Out = _busdBorrow == token0 ? _amount : 0;
        uint amount1Out = _busdBorrow == token1 ? _amount : 0;

    // We are telling our liquidity pool that transfer the amount of busd in our smart contract address ; amount0 = 0, amount1 = _amount 
        bytes memory data = abi.encode(_busdBorrow, _amount, msg.sender); // The abi.encode function takes the arguments _busdBorrow, _amount, and msg.sender and encodes them into a single bytes array. ABI encoding is a standardized format used to serialize data in Ethereum smart contracts.
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data); // This is an interface for a Uniswap V2 pair contract. It defines the functions that can be called on the pair contract (Liquidity Pool Contract).
    }
}