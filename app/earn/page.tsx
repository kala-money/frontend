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
    const { addLiquidity, isPending: isAddingLiquidity, isConfirming, isSuccess, error, hash } = useAddLiquidity();

    const [amountEth, setAmountEth] = useState("");
    const [amountKala, setAmountKala] = useState("");
    const [step, setStep] = useState<"idle" | "approve" | "add">("idle");

    const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();
    const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const oraclePrice = prices?.kalaUsdPrice ? Number(formatUnits(prices.kalaUsdPrice, 18)) : 1.00;
    const ethPrice = prices?.ethUsdPrice ? Number(formatUnits(prices.ethUsdPrice, 18)) : 0;
    const ethToKalaRate = oraclePrice > 0 ? ethPrice / oraclePrice : 0;

    const minFeePercent = 0.3;
    const maxFeePercent = 10.0;
    const hookAddress = KALA_HOOK_ADDRESS[sepolia.id];

    const hasValidInput = amountEth && amountKala && parseFloat(amountEth) > 0 && parseFloat(amountKala) > 0;
    const isPending = isApproving || isAddingLiquidity || isConfirming;
    const canProvide = isConnected && hasValidInput && !isPending;
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

    const handleWithdraw = () => {
        if (!isConnected) return;
        alert("Withdraw functionality coming soon.");
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
                                <h3 className="text-sm font-bold text-zinc-100">Liquidity Added!</h3>
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
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-[#cc7a0e]" />
                                Liquidity Provider
                            </h2>
                            <div className="px-3 py-1 rounded-full bg-[#cc7a0e]/10 border border-[#cc7a0e]/20 text-[#cc7a0e] text-xs font-bold uppercase tracking-wider">
                                v4 Hook
                            </div>
                        </div>

                        <div className="space-y-6">
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

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={handleProvideLiquidity}
                                    disabled={!canProvide}
                                    className="bg-[#cc7a0e] hover:bg-[#b0680c] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {step === "approve" ? "Approving KALA..." :
                                        step === "add" ? "Adding Liquidity..." :
                                            isConfirming ? "Confirming..." :
                                                "Provide Liquidity"}
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={!isConnected}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Withdraw
                                </button>
                            </div>
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
