import WithdrawCard from "@/components/features/withdrawal/WithdrawCard";

export default function WithdrawalsPage() {
    return (
        <main className="min-h-screen text-white selection:bg-[#cc7a0e]/20">
            <div className="px-6 pb-20 pt-12 md:pt-24 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <WithdrawCard />
            </div>
        </main>
    );
}
