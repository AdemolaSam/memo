import { useQuery } from "@tanstack/react-query";
import { fetchTransaction } from "../services/transactionApi";

export function useTransaction(txHash: string) {
  return useQuery({
    queryKey: ["transaction", txHash],
    queryFn: () => fetchTransaction(txHash),
    enabled: !!txHash,
    staleTime: 60000,
  });
}
