"use client";

import { useState, useEffect } from "react";
import { formatUnits, parseEther } from "viem";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
    Activity,
    ArrowRightLeft,
    Info,
    ShieldCheck,
    TrendingUp,
    Wallet,
    ExternalLink,
    Loader2
} from "lucide-react";

import { useKalaBalance } from "@/hooks/useKalaBalance";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useKalaHook } from "@/hooks/useKalaHook";
import { useAddLiquidity } from "@/hooks/useAddLiquidity";
import { KALA_HOOK_ADDRESS, kalaMoneyConfig } from "@/lib/contracts";
import { sepolia } from "wagmi/chains";

const POOL_MODIFY_LIQUIDITY_TEST = "0x0C478023803a644c94c4CE1C1e7b9A087e411B0A" as const;

export default function EarnPage() {
    const { address, isConnected } = useAccount();
    const { balance: kalaBalance, formatted: kalaFormatted } = useKalaBalance();
    const { data: ethBalance } = useBalance({ address });
    const { prices } = usePriceFeed();
    const hookData = useKalaHook();
    const {
        addLiquidity,
        removeLiquidity,
        getEstimatedAmounts,
        isPending: isContractPending,
        isConfirming,
        isSuccess,
        error,
        hash,
        userLiquidity,
        userAmounts
    } = useAddLiquidity();

    const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
    const [amountEth, setAmountEth] = useState("");
    const [amountKala, setAmountKala] = useState("");
    const [removePercent, setRemovePercent] = useState<number>(0);
    const [step, setStep] = useState<"idle" | "approve" | "add" | "remove">("idle");

    const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const oraclePrice = prices?.kalaUsdPrice ? Number(formatUnits(prices.kalaUsdPrice, 18)) : 1.00;
    const ethPrice = prices?.ethUsdPrice ? Number(formatUnits(prices.ethUsdPrice, 18)) : 0;
    const ethToKalaRate = oraclePrice > 0 ? ethPrice / oraclePrice : 0;

    const minFeePercent = 0.3;
    const maxFeePercent = 10.0;
    const hookAddress = KALA_HOOK_ADDRESS[sepolia.id];

    const isPending = isApproving || isContractPending || isConfirming;
    const hasValidAddInput = amountEth && amountKala && parseFloat(amountEth) > 0 && parseFloat(amountKala) > 0;
    const canProvide = isConnected && hasValidAddInput && !isPending && activeTab === "add";

    const hasValidRemoveInput = removePercent > 0 && userLiquidity > 0n;
    const canRemove = isConnected && hasValidRemoveInput && !isPending && activeTab === "remove";

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

    useEffect(() => {
        if (approveSuccess && step === "approve") {
            setStep("add");
            addLiquidity(amountEth, amountKala);
        }
    }, [approveSuccess, step, amountEth, amountKala, addLiquidity]);

    useEffect(() => {
        if (isSuccess && hash) {
            setSuccessTxHash(hash);
            setShowSuccessModal(true);
            setAmountEth("");
            setAmountKala("");
            setRemovePercent(0);
            setStep("idle");
        }
    }, [isSuccess, hash]);

    const handleEthChange = (val: string) => {
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            setAmountEth(val);
            if (val === "") {
                setAmountKala("");
            } else if (ethToKalaRate > 0) {
                const ethVal = parseFloat(val);
                if (!isNaN(ethVal)) {
                    setAmountKala((ethVal * ethToKalaRate).toFixed(4));
                }
            }
        }
    };

    const handleKalaChange = (val: string) => {
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            setAmountKala(val);
            if (val === "") {
                setAmountEth("");
            } else if (ethToKalaRate > 0) {
                const kalaVal = parseFloat(val);
                if (!isNaN(kalaVal)) {
                    setAmountEth((kalaVal / ethToKalaRate).toFixed(6));
                }
            }
        }
    };

    const handleProvideLiquidity = async () => {
        if (!canProvide) return;

        setStep("approve");
        approve({
            ...kalaMoneyConfig,
            functionName: "approve",
            args: [POOL_MODIFY_LIQUIDITY_TEST, parseEther(amountKala)],
        });
    };

    const handleRemoveLiquidity = async () => {
        if (!canRemove) return;

        setStep("remove");
        const removeAmount = (userLiquidity * BigInt(Math.floor(removePercent * 100))) / 10000n;
        removeLiquidity(removeAmount);
    };

    return (
        <>
            {showSuccessModal && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-72 shadow-xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full shrink-0">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-100">
                                    {activeTab === "add" ? "Liquidity Added!" : "Liquidity Removed!"}
                                </h3>
                                <p className="text-xs text-zinc-400">KALA/ETH pool</p>
                            </div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="ml-auto text-zinc-500 hover:text-zinc-300 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        {successTxHash && (
                            <a
                                href={`https://sepolia.etherscan.io/tx/${successTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-mono text-[#cc7a0e] transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {successTxHash.slice(0, 8)}...{successTxHash.slice(-6)}
                            </a>
                        )}
                    </div>
                </div>
            )}

            <div className="flex min-h-screen flex-col items-center justify-start font-sans py-20 gap-12 px-4 md:px-8 max-w-7xl mx-auto">

                <section className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-100">
                        Earn &amp; <span className="text-[#cc7a0e]">on kala</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        The canonical liquidity layer for KALA. Provide liquidity to the oracle-aligned
                        Uniswap v4 pool to earn fees, or exit your position with minimal slippage.
                    </p>
                    <a
                        href={`https://sepolia.etherscan.io/address/${hookAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-full text-xs text-zinc-400 hover:text-[#cc7a0e] hover:border-[#cc7a0e]/30 transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Hook: {hookAddress.slice(0, 6)}...{hookAddress.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </section>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-backwards delay-100">
                    <StatusCard
                        icon={<Activity className="w-5 h-5 text-[#cc7a0e]" />}
                        label="Pool Pair"
                        value="KALA / ETH"
                        subtext="Uniswap v4 Hook Pool"
                    />
                    <StatusCard
                        icon={<TrendingUp className="w-5 h-5 text-[#cc7a0e]" />}
                        label="Oracle Price"
                        value={`$${oraclePrice.toFixed(4)}`}
                        subtext="CRE-Derived Reference"
                    />
                    <StatusCard
                        icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
                        label="Dynamic Fee"
                        value={`${minFeePercent}% - ${maxFeePercent}%`}
                        subtext="Volatility Based"
                    />
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-backwards delay-200">

                    <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setActiveTab("add")}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === "add"
                                    ? "bg-[#cc7a0e] text-white shadow-lg"
                                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}
                            >
                                Add Liquidity
                            </button>
                            <button
                                onClick={() => setActiveTab("remove")}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === "remove"
                                    ? "bg-[#cc7a0e] text-white shadow-lg"
                                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}
                            >
                                Remove Liquidity
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activeTab === "add" ? (
                                <div className="space-y-4">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex justify-between text-sm text-zinc-400">
                                            <span>ETH</span>
                                            <span>Balance: {ethBalance ? Number(formatUnits(ethBalance.value, 18)).toFixed(4) : "0.00"} ETH</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                className="bg-transparent text-2xl font-bold text-white placeholder-zinc-600 outline-none w-full"
                                                value={amountEth}
                                                onChange={(e) => handleEthChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "-" || e.key === "e") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            <span className="text-lg font-bold text-zinc-300">ETH</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-2 relative z-10">
                                        <div className="bg-zinc-900 border border-zinc-700 p-1.5 rounded-full">
                                            <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>

                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex justify-between text-sm text-zinc-400">
                                            <span>KALA</span>
                                            <span>Balance: {Number(kalaFormatted).toFixed(2)} KALA</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                className="bg-transparent text-2xl font-bold text-white placeholder-zinc-600 outline-none w-full"
                                                value={amountKala}
                                                onChange={(e) => handleKalaChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "-" || e.key === "e") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            <span className="text-lg font-bold text-zinc-300">KALA</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#cc7a0e]/5 border border-[#cc7a0e]/10 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Hook Address</span>
                                            <a
                                                href={`https://sepolia.etherscan.io/address/${hookAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#cc7a0e] font-mono text-xs hover:underline"
                                            >
                                                {hookAddress.slice(0, 10)}...{hookAddress.slice(-8)}
                                            </a>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Fee Tier</span>
                                            <span className="text-zinc-200 font-mono">0.30%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Dynamic Fee</span>
                                            <span className="text-zinc-200 font-mono">{minFeePercent}% - {maxFeePercent}%</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProvideLiquidity}
                                        disabled={!canProvide}
                                        className="w-full bg-[#cc7a0e] hover:bg-[#b0680c] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {(isPending && activeTab === "add") && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {step === "approve" ? "Approving KALA..." :
                                            step === "add" ? "Adding Liquidity..." :
                                                (isConfirming && activeTab === "add") ? "Confirming..." :
                                                    "Provide Liquidity"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                                        <div className="flex justify-between items-start text-sm text-zinc-400">
                                            <span>Your Liquidity</span>
                                            <div className="text-right">
                                                <div className="text-white font-medium flex flex-col gap-1">
                                                    <span>
                                                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(Number(formatUnits(userAmounts[0], 18)))} ETH
                                                    </span>
                                                    <span>
                                                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(formatUnits(userAmounts[1], 18)))} KALA
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                                <div className="text-xs text-zinc-500 mb-1">To Receive (ETH)</div>
                                                <div className="text-xl font-bold text-white">
                                                    {(() => {
                                                        const removeAmount = (userLiquidity * BigInt(Math.floor(removePercent * 100))) / 10000n;
                                                        const [eth] = getEstimatedAmounts(removeAmount);
                                                        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(Number(formatUnits(eth, 18)));
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                                <div className="text-xs text-zinc-500 mb-1">To Receive (KALA)</div>
                                                <div className="text-xl font-bold text-white">
                                                    {(() => {
                                                        const removeAmount = (userLiquidity * BigInt(Math.floor(removePercent * 100))) / 10000n;
                                                        const [, kala] = getEstimatedAmounts(removeAmount);
                                                        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(formatUnits(kala, 18)));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-end justify-between">
                                                <span className="text-4xl font-bold text-white transition-all">
                                                    {removePercent}%
                                                </span>
                                                <div className="flex gap-2">
                                                    {[25, 50, 75, 100].map((pct) => (
                                                        <button
                                                            key={pct}
                                                            onClick={() => setRemovePercent(pct)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${removePercent === pct
                                                                ? "bg-[#cc7a0e] text-white"
                                                                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}
                                                        >
                                                            {pct}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={removePercent}
                                                onChange={(e) => setRemovePercent(parseInt(e.target.value))}
                                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#cc7a0e]"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#cc7a0e]/5 border border-[#cc7a0e]/10 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-[#cc7a0e]">
                                            <Info className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Removal Note</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            Removing liquidity will return your proportional share of ETH and KALA
                                            to your wallet. Fee earnings are collected automatically.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRemoveLiquidity}
                                        disabled={!canRemove}
                                        className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {(isPending && activeTab === "remove") && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {(isConfirming && activeTab === "remove") ? "Confirming..." :
                                            step === "remove" ? "Removing Liquidity..." :
                                                "Remove Liquidity"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold text-zinc-200">Why this pool?</h3>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                This is the <b className="text-zinc-200">protocol-blessed exit path</b>.
                                The Uniswap v4 Hook enforces oracle alignment, preventing MEV attacks
                                and ensuring fair pricing.
                            </p>
                            <div className="space-y-2">
                                <CheckItem text="Oracle-aware Pricing" />
                                <CheckItem text={`Dynamic Fee (${minFeePercent}% - ${maxFeePercent}%)`} />
                                <CheckItem text="Low Slippage Exits" />
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <h3 className="font-bold text-zinc-200">Hook Status</h3>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Oracle</span>
                                    <span className="text-zinc-300 font-mono">
                                        {hookData.kalaOracle
                                            ? `${hookData.kalaOracle.slice(0, 6)}...${hookData.kalaOracle.slice(-4)}`
                                            : "Loading..."
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">ETH/USD Feed</span>
                                    <span className="text-zinc-300 font-mono">
                                        {hookData.ethUsdFeed
                                            ? `${hookData.ethUsdFeed.slice(0, 6)}...${hookData.ethUsdFeed.slice(-4)}`
                                            : "Loading..."
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">KALA Token</span>
                                    <span className="text-zinc-300 font-mono">
                                        {hookData.kalaToken
                                            ? `${hookData.kalaToken.slice(0, 6)}...${hookData.kalaToken.slice(-4)}`
                                            : "Loading..."
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

function StatusCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string, subtext: string }) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-zinc-900/80 rounded-lg">
                    {icon}
                </div>
                <span className="text-sm font-medium text-zinc-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-zinc-100">{value}</div>
            <div className="text-xs text-zinc-500 font-medium">{subtext}</div>
        </div>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-[#cc7a0e]" />
            <span>{text}</span>
        </div>
    );
}
