import Image from "next/image";

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    onMax?: () => void;
    placeholder?: string;
    label?: string;
    error?: string | null;
    balance?: string;
    showBalance?: boolean;
    tokenIcon?: string;
    readOnly?: boolean;
}

export function AmountInput({
    value,
    onChange,
    onMax,
    placeholder = "0.0",
    label,
    error,
    balance,
    showBalance = false,
    tokenIcon = "/ethereum-eth.svg",
    readOnly = false,
}: AmountInputProps) {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <div className="space-y-2 mb-2">
            {label && <label className="text-xs font-medium text-zinc-400 ml-1">{label}</label>}

            <div className={`bg-black/40 border rounded-2xl p-4 flex items-center justify-between transition-colors ${error ? 'border-red-500/50' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-zinc-800/50">
                        <Image
                            src={tokenIcon}
                            alt="Token Logo"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-2xl font-medium text-white placeholder-zinc-600 w-full min-w-0"
                        placeholder={placeholder}
                        value={value}
                        onChange={handleInputChange}
                        readOnly={readOnly}
                    />
                </div>
                {onMax && !readOnly && (
                    <button
                        onClick={onMax}
                        className="text-xs font-bold text-[#cc7a0e] bg-[#cc7a0e]/10 border border-[#cc7a0e]/20 px-3 py-1.5 rounded-lg hover:bg-[#cc7a0e]/20 transition-colors uppercase tracking-wide cursor-pointer ml-3 shrink-0"
                    >
                        Max
                    </button>
                )}
            </div>

            {(showBalance || error) && (
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-red-400 font-medium h-4">{error}</span>
                    {showBalance && (
                        <div className="text-right text-xs text-zinc-500 font-mono">
                            Balance: {balance || '0.0 ETH'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
