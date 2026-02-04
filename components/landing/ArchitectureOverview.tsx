"use client";

import React from "react";
import { Server, Cpu, Shield } from "lucide-react";

export default function ArchitectureOverview() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mb-16">
                    <h2 className="text-2xl font-medium text-white mb-4">Protocol Architecture</h2>
                    <p className="text-zinc-500 font-light leading-relaxed">
                        A layered overview of the KALA infrastructure, from secure validation to real-time economic computation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <ArchitectureLayer
                        icon={<Server className="w-6 h-6" />}
                        title="Validator Layer"
                        description="Direct integration with Ethereum's Proof-of-Stake consensus. Collateral is distributed across professional node operators to ensure maximum uptime and safety."
                    />
                    <ArchitectureLayer
                        icon={<Cpu className="w-6 h-6" />}
                        title="CRE Computation Layer"
                        description="Off-chain economic signals are computed within the Chainlink Runtime Environment, ensuring the KALA reference price remains verifiable and tamper-proof."
                    />
                    <ArchitectureLayer
                        icon={<Shield className="w-6 h-6" />}
                        title="Save Buffer Mechanism"
                        description="A programmatic reserve funded by staking yield. It autonomously manages protocol health and provides a safety net against slashing or economic volatility."
                    />
                </div>
            </div>
        </section>
    );
}

function ArchitectureLayer({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="space-y-6 group">
            <div className="w-12 h-12 mx-auto md:mx-0 rounded-xl bg-black border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,122,14,0.1)]">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-medium text-white mb-2 uppercase tracking-wider">{title}</h4>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
