const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback-secret-at-least-32-chars-long-123"
);

/**
 * Encrypts a payload into a signed JWS-like string (data.signature)
 */
export async function encrypt(payload: any) {
  const json = JSON.stringify(payload);
  // Base64 encode the JSON string safely for UTF-8
  const data = b64EncodeUnicode(json);
  const signature = await sign(data);
  return `${data}.${signature}`;
}

/**
 * Decrypts and verifies a signed session string
 */
export async function decrypt(session: string | undefined): Promise<any | null> {
  if (!session) return null;
  
  // Basic format check to avoid errors with old JSON-style sessions
  const parts = session.split(".");
  if (parts.length !== 2) {
    console.warn("Invalid session format or legacy session detected.");
    return null;
  }
  
  const [dataB64, signature] = parts;
  
  try {
    const verified = await verify(dataB64, signature);
    if (!verified) return null;
    
    // Decode base64 to JSON safely for UTF-8
    const json = b64DecodeUnicode(dataB64);
    return JSON.parse(json);
  } catch (error) {
    console.error("Session decryption failed:", error);
    return null;
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

async function sign(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data) as any
  );
  // Convert signature to base64
  return uint8ArrayToBase64(new Uint8Array(signature));
}

async function verify(data: string, signature: string): Promise<boolean> {
  try {
    const key = await getEncryptionKey();
    const sigBuffer = base64ToUint8Array(signature);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer as any,
      new TextEncoder().encode(data) as any
    );
  } catch {
    return false;
  }
}

let cachedKey: CryptoKey | null = null;
async function getEncryptionKey() {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    SECRET as any,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return cachedKey;
}

// ─── Base64 Utilities (UTF-8 Compatible) ──────────────────────────────────────

function b64EncodeUnicode(str: string) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(_match, p1) {
          return String.fromCharCode(Number('0x' + p1));
  }));
}

function b64DecodeUnicode(str: string) {
  try {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    console.error("Base64 decode error:", e);
    throw e;
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
