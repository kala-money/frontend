"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">

            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8">

                <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    KALA is a programmable stable coin<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">
                        that does not a 1:1 fiat peg.
                    </span>
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Instead, it adjusts its reference value based on real-world economic signals to maintain stability against the cost of living.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <Link
                        href="/stake"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-white px-10 text-sm font-medium text-black transition-all duration-300 hover:bg-zinc-200 hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-black"
                    >
                        Access Protocol
                    </Link>

                    <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group">
                        Protocol Mechanics
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-primary" />
                    </button>
                </motion.div>
            </div>

        </section>
    );
}
