import { api } from "./api";

export async function fetchSharedWithMe() {
  const response = await api.get("/transactions/shared");
  return response.data.shared ?? [];
}
