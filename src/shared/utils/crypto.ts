import crypto from "crypto";
import { env } from "@/shared/config/global.config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * Returns: iv:authTag:encryptedData (all base64 encoded)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine iv, authTag, and encrypted data
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the encrypt function
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Get the encryption key from environment
 * Must be exactly 32 bytes for AES-256
 */
function getEncryptionKey(): Buffer {
  const secret = env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }

  // Hash the secret to ensure it's exactly 32 bytes
  return crypto.createHash("sha256").update(secret).digest();
}
