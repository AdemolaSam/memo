import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { JournaledTransaction } from "../components/JournalRow";

async function fetchNarrations() {
  const response = await api.get("/transactions", {
    params: { limit: 100 },
  });
  const transactions = response.data.transactions ?? [];

  // only return transactions that have narrations
  const journaled: JournaledTransaction[] = transactions
    .filter((tx: any) => tx.narration)
    .map((tx: any) => {
      const timestamp = tx.timestamp * 1000;
      const date = new Date(timestamp);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      return {
        txHash: tx.signature,
        category: tx.narration?.category ?? "Uncategorized",
        status: tx.narration?.isNotarized ? "VERIFIED" : "PENDING",
        amount: tx.nativeTransfers?.[0]?.amount
          ? `${(tx.nativeTransfers[0].amount / 1e9).toFixed(4)} SOL`
          : "N/A",
        isIncoming: false,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        monthKey, // attach for grouping
        note: tx.narration?.encryptedText ?? "",
        description: tx.description ?? "Unknown Transaction",
      };
    });

  // group by monthKey
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

export function useJournal(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ["journal"],
    queryFn: fetchNarrations,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}
