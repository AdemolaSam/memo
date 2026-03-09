import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { JournaledTransaction } from "../components/JournalRow";
import { mapHeliusTransaction } from "../utils/transactionMapper";

async function fetchNarrations(walletAddress: string) {
  const response = await api.get("/transactions", {
    params: { limit: 100 },
  });
  const transactions = response.data.transactions ?? [];

  const getAmount = (tx: any): string => {
    // try nativeTransfers first
    if (tx.nativeTransfers?.length > 0) {
      const transfer = tx.nativeTransfers.find(
        (t: any) =>
          t.fromUserAccount === walletAddress ||
          t.toUserAccount === walletAddress,
      );
      if (transfer?.amount) {
        return `${(transfer.amount / 1e9).toFixed(4)} SOL`;
      }
    }

    // try tokenTransfers
    if (tx.tokenTransfers?.length > 0) {
      const transfer = tx.tokenTransfers[0];
      const amount = transfer.tokenAmount ?? 0;
      const symbol = transfer.symbol ?? "tokens";
      return `${amount} ${symbol}`;
    }

    // fallback to fee
    if (tx.fee) {
      return `${(tx.fee / 1e9).toFixed(6)} SOL`;
    }

    return "—";
  };

  const journaled: JournaledTransaction[] = transactions
    .filter((tx: any) => tx.narration)
    .map((tx: any) => {
      const timestamp = tx.timestamp * 1000;
      const date = new Date(timestamp);
      const amount = getAmount(tx);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const personalizedDescription = mapHeliusTransaction(
        tx,
        walletAddress,
      ).description;

      return {
        txHash: tx.signature,
        category: tx.narration?.category ?? "Uncategorized",
        status: tx.narration?.isNotarized ? "VERIFIED" : "PENDING",
        amount: amount
          ? `${(tx.nativeTransfers[0].amount / 1e9).toFixed(4)} SOL`
          : "N/A",
        isIncoming: false,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        monthKey,
        note: tx.narration?.encryptedText ?? null,
        description: personalizedDescription,
      };
    });

  const groups: Record<string, JournaledTransaction[]> = {};
  journaled.forEach((tx: any) => {
    if (!groups[tx.monthKey]) groups[tx.monthKey] = [];
    groups[tx.monthKey].push(tx);
  });

  const sections = Object.entries(groups).map(([title, data]) => ({
    title,
    data,
  }));

  return { sections, total: journaled.length };
}

export function useJournal(isAuthenticated: boolean, walletAddress: string) {
  return useQuery({
    queryKey: ["journal", walletAddress],
    queryFn: () => fetchNarrations(walletAddress),
    enabled: isAuthenticated && !!walletAddress,
    staleTime: 30000,
  });
}
