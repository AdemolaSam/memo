import { useQuery } from "@tanstack/react-query";
import { fetchSharedWithMe } from "../services/sharedApi";

export function useSharedWithMe(isAuthenticated: boolean) {
  return useQuery({
    queryKey: ["shared-with-me"],
    queryFn: fetchSharedWithMe,
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}
