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
    .map((tx: any) => ({
      txHash: tx.signature,
      category: tx.narration?.category ?? "Uncategorized",
      status: tx.narration?.isNotarized ? "VERIFIED" : "PENDING",
      amount: tx.nativeTransfers?.[0]?.amount
        ? `${(tx.nativeTransfers[0].amount / 1e9).toFixed(4)} SOL`
        : "N/A",
      isIncoming: false,
      date: tx.timestamp
        ? new Date(tx.timestamp * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      note: tx.narration?.encryptedText ?? "",
      description: tx.description ?? "Unknown Transaction",
    }));

  // group by month
  const groups: Record<string, JournaledTransaction[]> = {};
  journaled.forEach((tx: any) => {
    const key = tx.date.split(" ").slice(0, 2).join(" "); // "Mar 7"
    const monthKey = new Date(tx.date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(tx);
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
