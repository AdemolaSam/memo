import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../services/transactionApi";
import { mapHeliusTransaction } from "../utils/transactionMapper";
import { useAuthorization } from "../utils/useAuthorization";

export function useTransactions(isAuthenticated: boolean) {
  const { selectedAccount } = useAuthorization();
  const walletAddress = selectedAccount?.publicKey?.toString() ?? "";

  return useInfiniteQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTransactions(20, pageParam);
      const mapped = (data.transactions ?? []).map((tx: any) =>
        mapHeliusTransaction(tx, walletAddress),
      );
      return {
        transactions: mapped,
        paginationToken: data.paginationToken,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.paginationToken ?? undefined,
    enabled: isAuthenticated && walletAddress.length > 0,
    staleTime: 30000,
  });
}
