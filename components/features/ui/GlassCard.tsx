import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
    return (
        <div className={`glass-card rounded-3xl p-6 shadow-2xl shadow-black/40 ${className}`}>
            {children}
        </div>
    );
}
