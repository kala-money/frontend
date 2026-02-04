"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, zeroAddress, keccak256, encodeAbiParameters } from "viem";
import { PoolModifyLiquidityTestAbi } from "@/abis/PoolModifyLiquidityTestAbi";
import { StateViewAbi } from "@/abis/StateViewAbi";
import { KALA_HOOK_ADDRESS, STATE_VIEW_ADDRESS } from "@/lib/contracts";
import { sepolia } from "wagmi/chains";

const POOL_MODIFY_LIQUIDITY_TEST = "0x0C478023803a644c94c4CE1C1e7b9A087e411B0A" as const;
const KALA_TOKEN = "0xAF53484b277e9b7e9Fb224D2e534ee9beB68B7BA" as const;

const TICK_LOWER = -887220;
const TICK_UPPER = 887220;

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

export function useAddLiquidity() {
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

    const { data: slot0 } = useReadContract({
        address: STATE_VIEW_ADDRESS[sepolia.id] as `0x${string}`,
        abi: StateViewAbi,
        functionName: "getSlot0",
        args: [poolId],
    });

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

    return {
        addLiquidity,
        removeLiquidity,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash,
        sqrtPriceX96: slot0 ? BigInt(slot0[0]) : undefined,
        poolId,
    };
}
