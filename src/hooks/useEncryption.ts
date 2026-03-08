import { useCallback, useState } from "react";
import { useMobileWallet } from "../utils/useMobileWallet";
import {
  setDerivedKeypair,
  getCachedKeypair,
  getDerivationMessage,
} from "../utils/encryption";
import { BoxKeyPair } from "tweetnacl";

export function useEncryption() {
  const { signMessage } = useMobileWallet();
  const [deriving, setDeriving] = useState(false);

  const getKeypair = useCallback(async (): Promise<BoxKeyPair> => {
    // return cached keypair if available
    const cached = getCachedKeypair();
    if (cached) return cached;

    // derive from wallet signature
    setDeriving(true);
    try {
      console.log("Deriving encryption keypair from wallet...");
      const message = getDerivationMessage();
      const signatureBytes = await signMessage(message);
      const keypair = setDerivedKeypair(signatureBytes);
      console.log("Encryption keypair derived successfully");
      return keypair;
    } finally {
      setDeriving(false);
    }
  }, [signMessage]);

  return { getKeypair, deriving };
}
