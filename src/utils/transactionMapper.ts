import { Transaction, TransactionType } from "../components/TransactionCard";

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

function getAmountUsd(heliusTx: any): string {
  const lamports = heliusTx.nativeTransfers?.[0]?.amount ?? 0;
  const sol = lamports / 1e9;
  return `$${(sol * 20).toFixed(2)}`; // rough SOL price — replace with real price later
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
    description: heliusTx.description ?? "Unknown transaction",
    amount: `${(heliusTx.nativeTransfers?.[0]?.amount ?? 0) / 1e9} SOL`,
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
