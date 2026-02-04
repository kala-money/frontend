"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { parseEther, zeroAddress, keccak256, encodeAbiParameters } from "viem";
import { PoolModifyLiquidityTestAbi } from "@/abis/PoolModifyLiquidityTestAbi";
import { StateViewAbi } from "@/abis/StateViewAbi";
import { KALA_HOOK_ADDRESS, STATE_VIEW_ADDRESS } from "@/lib/contracts";
import { sepolia } from "wagmi/chains";

const POOL_MODIFY_LIQUIDITY_TEST = "0x0C478023803a644c94c4CE1C1e7b9A087e411B0A" as const;
const KALA_TOKEN = "0xAF53484b277e9b7e9Fb224D2e534ee9beB68B7BA" as const;

const TICK_LOWER = -887220;
const TICK_UPPER = 887220;

const OLD_KALA_HOOK = "0xd748e26b7da263861a9559cE59F9c78646Ac0080" as const;

const Q96 = BigInt(2) ** BigInt(96);

const MIN_SQRT_PRICE = BigInt("4295128739");
const MAX_SQRT_PRICE = BigInt("1461446703485210103287273052203988822378723970342");

const SQRT_PRICE_LOWER = BigInt("4295343490");
const SQRT_PRICE_UPPER = BigInt("1461300573427867316570072651998408279850435624081");

function computePoolId(
    currency0: `0x${string}`,
    currency1: `0x${string}`,
    fee: number,
    tickSpacing: number,
    hooks: `0x${string}`
): `0x${string}` {
    return keccak256(
        encodeAbiParameters(
            [
                { name: "currency0", type: "address" },
                { name: "currency1", type: "address" },
                { name: "fee", type: "uint24" },
                { name: "tickSpacing", type: "int24" },
                { name: "hooks", type: "address" },
            ],
            [currency0, currency1, fee, tickSpacing, hooks]
        )
    );
}

function mulDiv(a: bigint, b: bigint, c: bigint): bigint {
    return (a * b) / c;
}
function getLiquidityForAmount0(
    sqrtPriceAX96: bigint,
    sqrtPriceBX96: bigint,
    amount0: bigint
): bigint {
    if (sqrtPriceAX96 > sqrtPriceBX96) {
        [sqrtPriceAX96, sqrtPriceBX96] = [sqrtPriceBX96, sqrtPriceAX96];
    }
    const intermediate = mulDiv(sqrtPriceAX96, sqrtPriceBX96, Q96);
    return mulDiv(amount0, intermediate, sqrtPriceBX96 - sqrtPriceAX96);
}

function getLiquidityForAmount1(
    sqrtPriceAX96: bigint,
    sqrtPriceBX96: bigint,
    amount1: bigint
): bigint {
    if (sqrtPriceAX96 > sqrtPriceBX96) {
        [sqrtPriceAX96, sqrtPriceBX96] = [sqrtPriceBX96, sqrtPriceAX96];
    }
    return mulDiv(amount1, Q96, sqrtPriceBX96 - sqrtPriceAX96);
}

function getLiquidityForAmounts(
    sqrtPriceX96: bigint,
    sqrtPriceLowerX96: bigint,
    sqrtPriceUpperX96: bigint,
    amount0: bigint,
    amount1: bigint
): bigint {
    if (sqrtPriceLowerX96 > sqrtPriceUpperX96) {
        [sqrtPriceLowerX96, sqrtPriceUpperX96] = [sqrtPriceUpperX96, sqrtPriceLowerX96];
    }

    if (sqrtPriceX96 <= sqrtPriceLowerX96) {
        return getLiquidityForAmount0(sqrtPriceLowerX96, sqrtPriceUpperX96, amount0);
    } else if (sqrtPriceX96 < sqrtPriceUpperX96) {
        const liquidity0 = getLiquidityForAmount0(sqrtPriceX96, sqrtPriceUpperX96, amount0);
        const liquidity1 = getLiquidityForAmount1(sqrtPriceLowerX96, sqrtPriceX96, amount1);
        return liquidity0 < liquidity1 ? liquidity0 : liquidity1;
    } else {
        return getLiquidityForAmount1(sqrtPriceLowerX96, sqrtPriceUpperX96, amount1);
    }
}

function getAmount0ForLiquidity(
    sqrtPriceAX96: bigint,
    sqrtPriceBX96: bigint,
    liquidity: bigint
): bigint {
    if (sqrtPriceAX96 > sqrtPriceBX96) {
        [sqrtPriceAX96, sqrtPriceBX96] = [sqrtPriceBX96, sqrtPriceAX96];
    }
    return (liquidity * Q96 * (sqrtPriceBX96 - sqrtPriceAX96)) / (sqrtPriceAX96 * sqrtPriceBX96);
}

function getAmount1ForLiquidity(
    sqrtPriceAX96: bigint,
    sqrtPriceBX96: bigint,
    liquidity: bigint
): bigint {
    if (sqrtPriceAX96 > sqrtPriceBX96) {
        [sqrtPriceAX96, sqrtPriceBX96] = [sqrtPriceBX96, sqrtPriceAX96];
    }
    return (liquidity * (sqrtPriceBX96 - sqrtPriceAX96)) / Q96;
}

function getAmountsForLiquidity(
    sqrtPriceX96: bigint,
    sqrtPriceLowerX96: bigint,
    sqrtPriceUpperX96: bigint,
    liquidity: bigint
): [bigint, bigint] {
    if (sqrtPriceLowerX96 > sqrtPriceUpperX96) {
        [sqrtPriceLowerX96, sqrtPriceUpperX96] = [sqrtPriceUpperX96, sqrtPriceLowerX96];
    }

    if (sqrtPriceX96 <= sqrtPriceLowerX96) {
        return [getAmount0ForLiquidity(sqrtPriceLowerX96, sqrtPriceUpperX96, liquidity), 0n];
    } else if (sqrtPriceX96 < sqrtPriceUpperX96) {
        const amount0 = getAmount0ForLiquidity(sqrtPriceX96, sqrtPriceUpperX96, liquidity);
        const amount1 = getAmount1ForLiquidity(sqrtPriceLowerX96, sqrtPriceX96, liquidity);
        return [amount0, amount1];
    } else {
        return [0n, getAmount1ForLiquidity(sqrtPriceLowerX96, sqrtPriceUpperX96, liquidity)];
    }
}

export function useAddLiquidity() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const hookAddress = KALA_HOOK_ADDRESS[sepolia.id];

    const poolId = computePoolId(
        zeroAddress,
        KALA_TOKEN,
        3000,
        60,
        hookAddress
    );

    const oldPoolId = computePoolId(
        zeroAddress,
        KALA_TOKEN,
        3000,
        60,
        OLD_KALA_HOOK
    );

    const { data: slot0 } = useReadContract({
        address: STATE_VIEW_ADDRESS[sepolia.id] as `0x${string}`,
        abi: StateViewAbi,
        functionName: "getSlot0",
        args: [poolId],
    });

    // Strategy 1: Check Current Pool, Test Contract as owner
    const { data: pos1 } = useReadContract({
        address: STATE_VIEW_ADDRESS[sepolia.id] as `0x${string}`,
        abi: StateViewAbi,
        functionName: "getPositionInfo",
        args: [
            poolId,
            POOL_MODIFY_LIQUIDITY_TEST,
            TICK_LOWER,
            TICK_UPPER,
            "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        ],
        query: { refetchInterval: 5000 },
    });

    // Strategy 2: Check Current Pool, User as owner
    const { data: pos2 } = useReadContract({
        address: STATE_VIEW_ADDRESS[sepolia.id] as `0x${string}`,
        abi: StateViewAbi,
        functionName: "getPositionInfo",
        args: address ? [
            poolId,
            address,
            TICK_LOWER,
            TICK_UPPER,
            "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        ] : undefined,
        query: { enabled: !!address, refetchInterval: 5000 },
    });

    // Strategy 3: Check Old Pool, Test Contract as owner
    const { data: pos3 } = useReadContract({
        address: STATE_VIEW_ADDRESS[sepolia.id] as `0x${string}`,
        abi: StateViewAbi,
        functionName: "getPositionInfo",
        args: [
            oldPoolId,
            POOL_MODIFY_LIQUIDITY_TEST,
            TICK_LOWER,
            TICK_UPPER,
            "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        ],
        query: { refetchInterval: 5000 },
    });

    const getLiquidity = (data: any) => {
        if (!data) return 0n;
        if (Array.isArray(data)) return BigInt(data[0] || 0);
        return BigInt(data.liquidity || 0);
    };

    const userLiquidity = getLiquidity(pos1) + getLiquidity(pos2) + getLiquidity(pos3);

    const addLiquidity = async (ethAmount: string, kalaAmount: string) => {
        if (!ethAmount || !kalaAmount) return;

        const ethWei = parseEther(ethAmount);
        const kalaWei = parseEther(kalaAmount);

        const sqrtPriceX96 = slot0 ? BigInt(slot0[0]) : BigInt(0);

        let liquidityDelta: bigint;

        if (sqrtPriceX96 === BigInt(0)) {
            liquidityDelta = ethWei < kalaWei ? ethWei : kalaWei;
        } else {
            liquidityDelta = getLiquidityForAmounts(
                sqrtPriceX96,
                SQRT_PRICE_LOWER,
                SQRT_PRICE_UPPER,
                ethWei,
                kalaWei
            );
        }

        const poolKey = {
            currency0: zeroAddress,
            currency1: KALA_TOKEN,
            fee: 3000,
            tickSpacing: 60,
            hooks: hookAddress,
        };

        const params = {
            tickLower: TICK_LOWER,
            tickUpper: TICK_UPPER,
            liquidityDelta: liquidityDelta,
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        };

        writeContract({
            address: POOL_MODIFY_LIQUIDITY_TEST,
            abi: PoolModifyLiquidityTestAbi,
            functionName: "modifyLiquidity",
            args: [poolKey, params, "0x"],
            value: ethWei,
        });
    };

    const removeLiquidity = async (liquidityDelta: bigint) => {
        const poolKey = {
            currency0: zeroAddress,
            currency1: KALA_TOKEN,
            fee: 3000,
            tickSpacing: 60,
            hooks: KALA_HOOK_ADDRESS[sepolia.id],
        };

        const params = {
            tickLower: TICK_LOWER,
            tickUpper: TICK_UPPER,
            liquidityDelta: -liquidityDelta,
            salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        };

        writeContract({
            address: POOL_MODIFY_LIQUIDITY_TEST,
            abi: PoolModifyLiquidityTestAbi,
            functionName: "modifyLiquidity",
            args: [poolKey, params, "0x"],
        });
    };

    const getEstimatedAmounts = (liquidityDelta: bigint): [bigint, bigint] => {
        const sqrtPriceX96 = slot0 ? BigInt(slot0[0]) : BigInt(0);
        if (sqrtPriceX96 === BigInt(0) || liquidityDelta === BigInt(0)) return [0n, 0n];

        return getAmountsForLiquidity(
            sqrtPriceX96,
            SQRT_PRICE_LOWER,
            SQRT_PRICE_UPPER,
            liquidityDelta
        );
    };

    const userAmounts = getEstimatedAmounts(userLiquidity);

    return {
        addLiquidity,
        removeLiquidity,
        getEstimatedAmounts,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash,
        sqrtPriceX96: slot0 ? BigInt(slot0[0]) : undefined,
        poolId,
        userLiquidity,
        userAmounts,
    };
}
