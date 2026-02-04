import { sepolia } from "wagmi/chains";
import { KalaMoney } from "@/abis/KalaMoneyAbi";
import { KalaHookAbi } from "@/abis/KalaHookAbi";

export const KALA_MONEY_ADDRESS = {
    [sepolia.id]: "0xAF53484b277e9b7e9Fb224D2e534ee9beB68B7BA",
} as const;

export const KALA_HOOK_ADDRESS = {
    [sepolia.id]: "0x3485cE0473ABcefAFF025aa7aCed6438d3d84080",
} as const;

export const UNISWAP_V4_POOL_MANAGER = {
    [sepolia.id]: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
} as const;

export const STATE_VIEW_ADDRESS = {
    [sepolia.id]: "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C",
} as const;

export const KALA_DEPLOYMENT_BLOCK = {
    [sepolia.id]: 10181655n,
} as const;

export const kalaMoneyConfig = {
    address: KALA_MONEY_ADDRESS[sepolia.id] as `0x${string}`,
    abi: KalaMoney,
    chainId: sepolia.id,
} as const;

export const kalaHookConfig = {
    address: KALA_HOOK_ADDRESS[sepolia.id] as `0x${string}`,
    abi: KalaHookAbi,
    chainId: sepolia.id,
} as const;

const ERROR_MESSAGES: Record<string, string> = {
    DebtNotZero: "You must repay all debt before withdrawing",
    NothingToClaim: "No ETH available to claim",
    WithdrawDelayNotMet: "Withdrawal delay period not yet passed",
    WithdrawalBreaksCR: "Withdrawal would break collateral ratio",
    InsufficientCollateral: "Insufficient collateral",
    InsufficientShares: "Insufficient KALA shares to repay this amount",
    ERC20InsufficientBalance: "Insufficient token balance",
    ERC20InsufficientAllowance: "Token allowance too low",
    ZeroValue: "Amount must be greater than zero",
    EnforcedPause: "Contract is paused",
    ETHTransferFailed: "ETH transfer failed",
    ReentrancyGuardReentrantCall: "Transaction rejected: reentrancy detected",
};

export function parseContractError(error: unknown): string {
    if (!error) return "Unknown error";

    if (typeof error === "string") {
        return error;
    }

    if (typeof error === "object" && error !== null) {
        const err = error as Record<string, unknown>;

        if (err.cause && typeof err.cause === "object") {
            const cause = err.cause as Record<string, unknown>;

            if (cause.data && typeof cause.data === "object") {
                const data = cause.data as Record<string, unknown>;
                if (data.errorName && typeof data.errorName === "string") {
                    return ERROR_MESSAGES[data.errorName] ?? `Contract error: ${data.errorName}`;
                }
            }

            if (cause.cause) {
                return parseContractError(cause.cause);
            }
        }

        if (err.shortMessage && typeof err.shortMessage === "string") {
            const match = err.shortMessage.match(/execution reverted:?\s*(\w+)?/);
            if (match && match[1]) {
                return ERROR_MESSAGES[match[1]] ?? err.shortMessage;
            }
            return err.shortMessage;
        }

        if (err.message && typeof err.message === "string") {
            for (const [name, msg] of Object.entries(ERROR_MESSAGES)) {
                if (err.message.includes(name)) {
                    return msg;
                }
            }
            return err.message;
        }
    }

    return "Transaction failed";
}
