import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../services/transactionApi";
import { useAuthorization } from "../utils/useAuthorization";
import { mapHeliusTransaction } from "../utils/transactionMapper";

export function useTransactions(isAuthenticated: boolean) {
  const { selectedAccount } = useAuthorization();
  const walletAddress = selectedAccount?.publicKey?.toString() ?? "";

  console.log(
    "useTransactions — wallet:",
    walletAddress,
    "auth:",
    isAuthenticated,
  );

  return useQuery({
    queryKey: ["transactions", walletAddress], // include wallet in key
    queryFn: async () => {
      console.log("Fetching for wallet:", walletAddress);
      const data = await fetchTransactions(20);
      //   console.log("Raw response:", JSON.stringify(data));
      const mapped = (data.transactions ?? []).map((tx: any) =>
        mapHeliusTransaction(tx, walletAddress),
      );
      return { transactions: mapped, paginationToken: data.paginationToken };
    },
    enabled: isAuthenticated && walletAddress.length > 0, // both required
    staleTime: 30000,
  });
}
