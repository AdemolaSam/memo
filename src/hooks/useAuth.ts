import { useState, useCallback } from "react";
import { useMobileWallet } from "../utils/useMobileWallet";
import { useAuthorization } from "../utils/useAuthorization";
import {
  getChallenge,
  verifySignature,
  clearToken,
  getStoredToken,
} from "../services/authApi";
import bs58 from "bs58";

import * as Notifications from "expo-notifications";
import { api } from "../services/api";
import Constants from "expo-constants";

async function registerPushToken(): Promise<void> {
  // request permission
  console.log("registerPushToken called");
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Push notification permission denied");
    return;
  }

  // get Expo push token

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId:
      Constants.expoConfig?.extra?.eas?.projectId ??
      "592e386d-a882-4065-b592-9bab3e5fce1d",
  });

  const pushToken = tokenData.data;
  console.log("Push token:", pushToken);

  // send to backend
  await api.post("/webhook/push-token", { pushToken });
  console.log("Push token registered with backend");
}

type AuthState =
  | "idle"
  | "connecting"
  | "signing"
  | "verifying"
  | "authenticated"
  | "error";

export function useAuth() {
  const { connect, disconnect, signMessage } = useMobileWallet();
  const { selectedAccount } = useAuthorization();
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [error, setError] = useState<string | null>(null);
  const login = useCallback(async () => {
    try {
      setError(null);
      setAuthState("connecting");

      console.log("Step 1: Connecting wallet...");
      const account = await connect();
      console.log("Step 2: Got account:", account.publicKey.toString());

      const walletAddress = account.publicKey.toString();

      console.log("Step 3: Getting challenge...");
      const message = await getChallenge(walletAddress);
      console.log("Step 4: Got message:", message);

      setAuthState("signing");
      console.log("Step 5: Signing message...");
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      console.log("Step 6: Got signature");

      setAuthState("verifying");
      const signatureBase58 = bs58.encode(signatureBytes);
      console.log("Step 7: Verifying with backend...");
      await verifySignature(walletAddress, message, signatureBase58);
      console.log("Step 8: Authenticated!");

      setAuthState("authenticated");

      // register push token after successful auth
      try {
        await registerPushToken();
      } catch (err) {
        // non-critical — don't fail auth if push token fails
        console.warn("Push token registration failed:", err);
      }
    } catch (err: any) {
      console.error("Auth error full:", JSON.stringify(err?.response?.data));
      console.error("Auth error status:", err?.response?.status);
      console.error("Auth error message:", err?.message);
      setError(
        err?.response?.data?.message ?? err?.message ?? "Authentication failed",
      );
      setAuthState("error");
    }
  }, [connect, signMessage]);

  const logout = useCallback(async () => {
    await clearToken();
    await disconnect();
    setAuthState("idle");
  }, [disconnect]);

  const checkExistingAuth = useCallback(async (): Promise<boolean> => {
    const token = await getStoredToken();
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setAuthState("authenticated");

      // register push token on session restore too
      try {
        console.log("Restoring session — registering push token...");
        await registerPushToken();
      } catch (err) {
        console.warn("Push token registration failed on restore:", err);
      }

      return true;
    }
    return false;
  }, []);

  return {
    login,
    logout,
    checkExistingAuth,
    authState,
    setAuthState,
    error,
    isAuthenticated: authState === "authenticated" || selectedAccount !== null,
    isLoading: ["connecting", "signing", "verifying"].includes(authState),
  };
}
