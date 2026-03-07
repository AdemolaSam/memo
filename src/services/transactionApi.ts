import { api } from "./api";

export async function fetchTransactions(
  limit: number = 20,
  paginationToken?: string,
) {
  const response = await api.get("/transactions", {
    params: { limit, paginationToken },
  });
  return response.data;
}

export async function fetchTransaction(signature: string) {
  const response = await api.get(`/transactions/${signature}`);
  return response.data.transaction;
}

export async function saveNarration(
  signature: string,
  encryptedText: string,
  category: string,
) {
  const response = await api.post(`/transactions/${signature}/narration`, {
    encryptedText,
    category,
  });
  return response.data.narration;
}

export async function updateNarration(
  signature: string,
  encryptedText: string,
  category: string,
) {
  const response = await api.put(`/transactions/${signature}/narration`, {
    encryptedText,
    category,
  });
  return response.data.narration;
}

export async function notarize(signature: string, plaintextHash: string) {
  const response = await api.post(`/transactions/${signature}/notarize`, {
    plaintextHash,
  });
  return response.data.notarization;
}

export async function addViewer(
  signature: string,
  viewerWallet: string,
  encryptedTextForViewer: string,
) {
  const response = await api.post(`/transactions/${signature}/viewers`, {
    viewerWallet,
    encryptedTextForViewer,
  });
  return response.data.viewer;
}

export async function removeViewer(signature: string, viewerWallet: string) {
  await api.delete(`/transactions/${signature}/viewers/${viewerWallet}`);
}

export async function exportTransactions() {
  const response = await api.get("/export", {
    responseType: "blob",
  });
  return response.data;
}
