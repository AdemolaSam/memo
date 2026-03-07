import { api } from "./api";
import * as SecureStore from "expo-secure-store";

export async function getChallenge(walletAddress: string): Promise<string> {
  const response = await api.post("/auth/challenge", { walletAddress });
  return response.data.challenge;
}

export async function verifySignature(
  walletAddress: string,
  message: string,
  signature: string,
): Promise<string> {
  console.log("Calling verify at:", api.defaults.baseURL + "/auth/verify");
  const response = await api.post("/auth/verify", {
    walletAddress,
    message,
    signature,
  });
  const token = response.data.token;
  await SecureStore.setItemAsync("jwt_token", token);
  return token;
}

export async function getStoredToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("jwt_token");
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync("jwt_token");
}
