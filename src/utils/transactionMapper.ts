import { Transaction, TransactionType } from "../components/TransactionCard";
import { useAuthorization } from "../utils/useAuthorization";

function getTransactionType(heliusTx: any): TransactionType {
  const type = heliusTx.type?.toUpperCase();
  switch (type) {
    case "SWAP":
      return "SWAP";
    case "TRANSFER":
      return "TRANSFER";
    case "NFT_MINT":
      return "NFT_MINT";
    case "NFT_SALE":
      return "NFT_SALE";
    case "STAKE":
      return "STAKE";
    default:
      return "UNKNOWN";
  }
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function personalizeDescription(heliusTx: any, walletAddress: string): string {
  const description = heliusTx.description?.trim();
  const transfer = heliusTx.nativeTransfers?.[0];

  if (!description && !transfer) return "Unknown Transaction";

  const isIncoming = transfer?.toUserAccount === walletAddress;
  const counterparty = isIncoming
    ? transfer?.fromUserAccount
    : transfer?.toUserAccount;

  const shortCounterparty = counterparty ? shortenAddress(counterparty) : null;
  const solAmount = transfer?.amount
    ? (transfer.amount / 1e9).toFixed(4)
    : null;

  // build personalized description
  if (heliusTx.type === "TRANSFER" && solAmount && shortCounterparty) {
    return isIncoming
      ? `Received ${solAmount} SOL from ${shortCounterparty}`
      : `Sent ${solAmount} SOL to ${shortCounterparty}`;
  }

  if (heliusTx.type === "SWAP") {
    // Helius description for swaps is already good — just shorten addresses
    return description
      ? description.replace(/[1-9A-HJ-NP-Za-km-z]{32,44}/g, (addr: string) =>
          addr === walletAddress ? "You" : shortenAddress(addr),
        )
      : "Token Swap";
  }

  if (heliusTx.type === "NFT_MINT") return "Minted an NFT";
  if (heliusTx.type === "NFT_SALE") return "NFT Sale";
  if (heliusTx.type === "STAKE") return "Staked SOL";

  // fallback — shorten addresses in Helius description and replace wallet with "You"
  if (description) {
    return description.replace(
      /[1-9A-HJ-NP-Za-km-z]{32,44}/g,
      (addr: string) => (addr === walletAddress ? "You" : shortenAddress(addr)),
    );
  }

  return "Transaction";
}

function getAmountUsd(heliusTx: any): string {
  const lamports = heliusTx.nativeTransfers?.[0]?.amount ?? 0;
  const sol = lamports / 1e9;
  // rough SOL price — replace with real price from portfolio hook later
  return `$${(sol * 150).toFixed(2)}`;
}

function isIncoming(heliusTx: any, walletAddress: string): boolean {
  const transfer = heliusTx.nativeTransfers?.[0];
  return transfer?.toUserAccount === walletAddress;
}

export function mapHeliusTransaction(
  heliusTx: any,
  walletAddress: string,
): Transaction {
  return {
    txHash: heliusTx.signature,
    type: getTransactionType(heliusTx),
    description: personalizeDescription(heliusTx, walletAddress),
    amount: `${((heliusTx.nativeTransfers?.[0]?.amount ?? 0) / 1e9).toFixed(4)} SOL`,
    amountUsd: getAmountUsd(heliusTx),
    isIncoming: isIncoming(heliusTx, walletAddress),
    date: new Date(heliusTx.timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    category: heliusTx.narration?.category ?? undefined,
    note: undefined,
    nftImageUrl: heliusTx.events?.nft?.image ?? undefined,
  };
}
