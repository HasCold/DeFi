// https://ethereum.org/en/developers/docs/standards/tokens/erc-20/

const erc20ABI = ["function decimals() public view returns (uint8)"];

//  It will return the address of liquidity pool contract
// This is the address of the liquidity pool of our token BUSD and token WBNB :- 0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16
const factoryABI = [
    // you can get this getPair() in the PancakeSwap factory contract 
    "function getPair(address tokenA, address tokenB) external view returns (address pair)"  
]

const pairABI = [  // you can search this liquidity provider address on bscscan :- 0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
]

const routerABI = [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
]

module.exports = {erc20ABI, factoryABI, pairABI, routerABI};