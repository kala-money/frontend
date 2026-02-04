"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, HelpCircle } from "lucide-react";

export default function YieldBufferSection() {
    return (
        <section className="py-24 bg-white/2 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-medium text-white mb-4">Yield-Driven Insurance</h2>
                            <p className="text-zinc-500 font-light leading-relaxed max-w-md">
                                Unlike traditional stablecoins that rely solely on over-collateralization, KALA utilizes organic staking yield to build a collective insurance layer.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <FeatureItem
                                icon={<TrendingUp className="w-5 h-5 text-primary" />}
                                title="Staking Yield"
                                description="ETH deposited into the protocol is staked across a distributed set of validators, generating continuous rewards."
                            />
                            <FeatureItem
                                icon={<Shield className="w-5 h-5 text-primary" />}
                                title="Save Buffer"
                                description="A portion of rewards accumulates in a protocol-wide buffer, designed to absorb validator risks and maintain stability."
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="glass-card p-8 rounded-2xl border border-white/10 bg-black/40 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <HelpCircle className="w-5 h-5 text-zinc-500" />
                                <h3 className="text-sm font-medium text-white">Why No Minting Interest?</h3>
                            </div>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                                Traditional protocols charge interest to cover operational costs or facilitate liquidations. In KALA, the protocol's operating revenue is derived from the shared staking yield of the collateral buffer.
                            </p>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Protocol Revenue Source</span>
                                    <span className="text-green-400 font-mono">Staking Yield</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500 font-mono text-[10px] uppercase">User Minting Cost</span>
                                    <span className="text-white font-mono">0.00% APR</span>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-zinc-400/5 rounded-full blur-3xl pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center text-zinc-400">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
