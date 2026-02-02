"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { GlassCard } from "@/components/features/ui/GlassCard";
import { AmountInput } from "@/components/features/ui/AmountInput";

export default function WithdrawCard() {
    const [activeTab, setActiveTab] = useState<'request' | 'claim' | 'repay'>('repay');
    const [amount, setAmount] = useState<string>("");

    return (
        <div className="w-full max-w-md mx-auto">
            <h1 className="text-xl font-medium text-center text-zinc-100 mb-8">Withdrawals</h1>

            <div className="flex justify-center gap-8 mb-8">
                {['repay', 'request', 'claim'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`text-lg font-medium transition-colors duration-300 relative cursor-pointer ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <motion.span
                                layoutId="activeTab"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#cc7a0e] rounded-full shadow-[0_0_10px_#cc7a0e]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <GlassCard>
                <AnimatePresence mode="wait">
                    {activeTab === 'request' ? (
                        <motion.div
                            key="request"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-2 mb-8">
                                <AmountInput
                                    label="ETH amount"
                                    value={amount}
                                    onChange={setAmount}
                                    // onMax={() => {}} // TODO: Implement max logic for withdrawal
                                    placeholder="0.0"
                                    onMax={() => { }}
                                />
                            </div>

                            <button className="w-full border border-white/20 hover:border-white/40 text-white font-medium text-lg py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] mb-8 bg-white/5 hover:bg-white/10">
                                Request withdrawal
                            </button>
                        </motion.div>
                    ) : activeTab === 'claim' ? (
                        <motion.div
                            key="claim"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Pending amount</label>
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-zinc-800/50">
                                            <Image src="/ethereum-eth.svg" alt="ETH Logo" width={32} height={32} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-2xl font-medium text-white">0</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full border border-white/20 hover:border-white/40 text-white font-medium text-lg py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] mb-8 bg-white/5 hover:bg-white/10">
                                Claim
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="repay"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="space-y-2 mb-8">
                                <AmountInput
                                    label="KALA amount"
                                    value={amount}
                                    onChange={setAmount}
                                    // onMax={() => {}} // TODO: Implement max logic for repayment
                                    placeholder="0.0"
                                    onMax={() => { }}
                                />
                            </div>

                            <button className="w-full border border-white/20 hover:border-white/40 text-white font-medium text-lg py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] mb-8 bg-white/5 hover:bg-white/10">
                                Repay
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3 px-1">
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>Exchange rate</span>
                        <span className="text-zinc-200 font-mono text-xs">$1 = 1.3 KALA</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                        <span>Transaction cost</span>
                        <span className="text-zinc-200 font-mono text-xs">$0.03</span>
                    </div>
                    <div className="h-px bg-white/5 my-2"></div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">APR</span>
                        <span className="text-[#cc7a0e] font-bold font-mono text-xs">3%</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
