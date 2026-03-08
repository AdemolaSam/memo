import nacl from "tweetnacl";

// in-memory cache — cleared on app restart, re-derived via wallet sign
let cachedKeypair: nacl.BoxKeyPair | null = null;

const DERIVATION_MESSAGE = "memo-encryption-key-v1";

export function setDerivedKeypair(signatureBytes: Uint8Array): nacl.BoxKeyPair {
  // use first 32 bytes of signature as keypair seed
  const seed = signatureBytes.slice(0, 32);
  const keypair = nacl.box.keyPair.fromSecretKey(seed);
  cachedKeypair = keypair;
  return keypair;
}

export function getCachedKeypair(): nacl.BoxKeyPair | null {
  return cachedKeypair;
}

export function clearCachedKeypair(): void {
  cachedKeypair = null;
}

export function getDerivationMessage(): Uint8Array {
  return new TextEncoder().encode(DERIVATION_MESSAGE);
}

export function encryptNote(
  plaintext: string,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array,
): string {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = new TextEncoder().encode(plaintext);
  const encrypted = nacl.box(
    messageBytes,
    nonce,
    recipientPublicKey,
    senderSecretKey,
  );
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce);
  combined.set(encrypted, nonce.length);
  return Buffer.from(combined).toString("base64");
}

export function decryptNote(
  encryptedText: string,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array,
): string | null {
  try {
    const combined = new Uint8Array(Buffer.from(encryptedText, "base64"));
    const nonce = combined.slice(0, nacl.box.nonceLength);
    const encrypted = combined.slice(nacl.box.nonceLength);
    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      senderPublicKey,
      recipientSecretKey,
    );
    if (!decrypted) return null;
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
