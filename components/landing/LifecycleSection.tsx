"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Zap, RefreshCcw, ShieldCheck } from "lucide-react";

const steps = [
    {
        title: "Liquidity Provision",
        description: "Users deposit ETH into the protocol-managed buffer. This ETH serves as the underlying collateral for the system.",
        icon: <Database className="w-5 h-5" />,
    },
    {
        title: "Active Staking",
        description: "Deposited ETH is automatically staked. The protocol manages validator operations to generate organic staking yield.",
        icon: <Zap className="w-5 h-5" />,
    },
    {
        title: "Yield Accumulation",
        description: "Staking rewards are directed into a Save Buffer. This buffer acts as a first-loss insurance layer for the protocol.",
        icon: <RefreshCcw className="w-5 h-5" />,
    },
    {
        title: "KALA Issuance",
        description: "Users can mint KALA against their ETH. Since protocol costs are covered by staking yield, minting is interest-free.",
        icon: <ShieldCheck className="w-5 h-5" />,
    },
];

export default function LifecycleSection() {
    return (
        <section className="py-24 border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mb-16">
                    <h2 className="text-2xl font-medium text-white mb-4">System Lifecycle</h2>
                    <p className="text-zinc-500 font-light leading-relaxed">
                        A walkthrough of how the protocol transforms staked ETH into a stable, purchasing-power-adjusted asset.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-black border border-primary/20 flex items-center justify-center mb-6 text-primary box-shadow-[0_0_15px_rgba(204,122,14,0.1)] group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-primary/40 font-mono text-[10px]">{String(index + 1).padStart(2, '0')}</span>
                                {step.title}
                            </h3>
                            <p className="text-sm text-zinc-500 font-light leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
