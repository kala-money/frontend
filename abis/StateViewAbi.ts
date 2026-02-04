export const StateViewAbi = [
    {
        "type": "function",
        "name": "getSlot0",
        "inputs": [
            { "name": "poolId", "type": "bytes32", "internalType": "PoolId" }
        ],
        "outputs": [
            { "name": "sqrtPriceX96", "type": "uint160", "internalType": "uint160" },
            { "name": "tick", "type": "int24", "internalType": "int24" },
            { "name": "protocolFee", "type": "uint24", "internalType": "uint24" },
            { "name": "lpFee", "type": "uint24", "internalType": "uint24" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getLiquidity",
        "inputs": [
            { "name": "poolId", "type": "bytes32", "internalType": "PoolId" }
        ],
        "outputs": [
            { "name": "liquidity", "type": "uint128", "internalType": "uint128" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "poolManager",
        "inputs": [],
        "outputs": [
            { "name": "", "type": "address", "internalType": "contract IPoolManager" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPositionInfo",
        "inputs": [
            { "name": "poolId", "type": "bytes32", "internalType": "PoolId" },
            { "name": "owner", "type": "address", "internalType": "address" },
            { "name": "tickLower", "type": "int24", "internalType": "int24" },
            { "name": "tickUpper", "type": "int24", "internalType": "int24" },
            { "name": "salt", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [
            { "name": "liquidity", "type": "uint128", "internalType": "uint128" },
            { "name": "feeGrowthInside0LastX128", "type": "uint256", "internalType": "uint256" },
            { "name": "feeGrowthInside1LastX128", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    }
] as const;
