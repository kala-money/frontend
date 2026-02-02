"use client";

import { GlassCard } from "@/components/features/ui/GlassCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/features/ui/Tooltip";
import { ArrowUpRight, HelpCircle, History, Wallet } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const POSITION_HISTORY = [
    { id: 1, asset: "ETH", amount: "10.000", kala: "10.000", status: "Not Repay", logo: "/ethereum-eth.svg", alt: "ETH Logo" },
];

const EXIT_HISTORY = [
    { id: 1, asset: "ETH", amount: "10.000", kala: "10.000", status: "Repayed", logo: "/ethereum-eth.svg", alt: "ETH Logo", url: "https://sepolia.etherscan.io" },
    { id: 2, asset: "ETH", amount: "10.000", kala: "10.000", status: "Repayed", logo: "/ethereum-eth.svg", alt: "ETH Logo", url: "https://sepolia.etherscan.io" },
    { id: 3, asset: "ETH", amount: "10.000", kala: "10.000", status: "Repayed", logo: "/ethereum-eth.svg", alt: "ETH Logo", url: "https://sepolia.etherscan.io" },
];

export default function PortfolioPage() {
    const router = useRouter();
    return (
        <main className="min-h-screen px-4 md:px-10 py-8 max-w-7xl mx-auto space-y-8">
            <GlassCard className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-zinc-100">My Position</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-2">
                                <p className="text-zinc-400 text-sm font-medium">Wallet Balance</p>
                                <p className="text-3xl font-bold text-white font-mono">100 ETH</p>
                            </div>

                            <div className="space-y-2 relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block"></div>
                                <p className="text-zinc-400 text-sm font-medium">KALA Balance</p>
                                <p className="text-3xl font-bold text-white font-mono">1000 KALA</p>
                            </div>

                            <div className="space-y-2 relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <p className="text-zinc-400 text-sm font-medium">Heart Rate</p>
                                    <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="w-4 h-4 text-zinc-500 cursor-help hover:text-zinc-300 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[200px] break-words">
                                                <p>Heart Rate indicates the health of your collateral against KALA minting range between 1-5 Higher is better.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <p className="text-3xl font-bold text-[#cc7a0e] font-mono">3</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-80 flex flex-col justify-center space-y-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-10">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400 text-sm font-medium">PNL Kala To Usd</span>
                            <span className="text-white font-mono font-bold">+0.00%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400 text-sm font-medium">ETH APR Growth</span>
                            <span className="text-white font-mono font-bold">1%</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-zinc-400 text-sm font-medium">Supplied Assets</span>
                            <span className="text-white font-mono font-bold">10.000 ETH</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-200">Position History</h3>
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Assets</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Kala</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {POSITION_HISTORY.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => router.push('/withdraw')}
                                            className="text-sm hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 relative flex-shrink-0">
                                                        <Image
                                                            src={item.logo}
                                                            alt={item.alt}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-zinc-200">{item.asset}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-zinc-300">{item.amount}</td>
                                            <td className="px-6 py-4 font-mono text-zinc-300">{item.kala}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/10">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-200">Exit History</h3>
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Assets</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Kala</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {EXIT_HISTORY.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => window.open(item.url, '_blank')}
                                            className="text-sm hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 relative flex-shrink-0">
                                                        <Image
                                                            src={item.logo}
                                                            alt={item.alt}
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-zinc-200">{item.asset}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-zinc-300">{item.amount}</td>
                                            <td className="px-6 py-4 font-mono text-zinc-300">{item.kala}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#cc7a0e]/10 text-[#cc7a0e] border border-[#cc7a0e]/20">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}
