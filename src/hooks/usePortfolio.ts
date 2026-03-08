import { useQuery } from "@tanstack/react-query";
import { fetchPortfolioValue } from "../services/transactionApi";
import { useAuthorization } from "../utils/useAuthorization";

export function usePortfolio(isAuthenticated: boolean) {
  const { selectedAccount } = useAuthorization();
  const walletAddress = selectedAccount?.publicKey?.toString() ?? "";

  return useQuery({
    queryKey: ["portfolio", walletAddress],
    queryFn: () => fetchPortfolioValue(),
    enabled: isAuthenticated && !!walletAddress,
    staleTime: 60000,
    refetchInterval: 120000, // refresh every 2 minutes
  });
}
