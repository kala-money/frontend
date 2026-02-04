"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Cpu, ShieldCheck, ArrowRight, Zap } from "lucide-react";

export default function MechanismVisualizer() {
    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h3 className="text-xl font-medium text-white mb-2">Real-Time Economic Computation</h3>
                <p className="text-sm text-zinc-500 max-w-lg mx-auto font-light">
                    The Chainlink Runtime Environment (CRE) aggregates diverse economic signals to compute the persistent purchasing power reference.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                {/* INPUTS */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                    <InputCard icon={<Globe className="w-5 h-5 text-primary" />} label="Purchasing Power Indices" delay={1} />
                    <InputCard icon={<Globe className="w-5 h-5 text-amber-500" />} label="Commodity Primitives" delay={0} />
                    <InputCard icon={<Zap className="w-5 h-5 text-amber-200" />} label="Network Activity" delay={0.5} />
                </div>

                {/* FLOW 1 */}
                <div className="hidden md:flex flex-col items-center justify-center col-span-1 h-full relative">
                    <FlowLines />
                </div>

                {/* CRE ENGINE */}
                <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center relative z-10">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-dashed border-primary/30 w-full h-full scale-150"
                        />
                        <div className="w-24 h-24 bg-black/80 border border-primary/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(204,122,14,0.3)] backdrop-blur-xl">
                            <Cpu className="w-8 h-8 text-primary mb-1" />
                            <span className="text-[10px] font-mono text-primary/80 uppercase tracking-tighter">CRE</span>
                        </div>
                    </div>
                </div>

                {/* FLOW 2 */}
                <div className="hidden md:flex flex-col items-center justify-center col-span-1 h-full relative">
                    <FlowLines />
                </div>

                {/* OUTPUT */}
                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center">
                    <div className="w-full p-6 glass-card rounded-xl border border-white/10 relative overflow-hidden group bg-white/2">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                        <div className="flex items-center gap-4 mb-2">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            <div>
                                <h3 className="text-sm font-medium text-white font-bold">Stability Reference</h3>
                                <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Protocol State</p>
                            </div>
                        </div>
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-zinc-500">Index Target</span>
                                <span className="text-primary font-bold">1.63 KALA</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "90%" }}
                                    animate={{ width: ["90%", "95%", "92%", "98%", "90%"] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-600 italic">
                                * Value evolves based on computed purchasing power signals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputCard({ icon, label, delay }: { icon: React.ReactNode, label: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
        >
            <div className="p-2 bg-black/50 rounded-md">
                {icon}
            </div>
            <span className="text-sm font-medium text-zinc-300">{label}</span>
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: delay + 0.5 }}
                className="ml-auto"
            >
                <ArrowRight className="w-3 h-3 text-zinc-600" />
            </motion.div>
        </motion.div>
    )
}

function FlowLines() {
    return (
        <div className="w-full relative h-12 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/10" />
            <motion.div
                className="absolute w-2 h-2 bg-primary rounded-full blur-[1px]"
                animate={{ x: [-50, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{ x: [-50, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "linear" }}
            />
        </div>
    )
}
