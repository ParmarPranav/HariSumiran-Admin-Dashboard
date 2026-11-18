import crypto from "crypto";
import QRCode from "qrcode";

// Default Master Root Super Admin 2FA Credentials (strictly RFC 4648 Base32 compliant: A-Z, 2-7)
export const ROOT_SUPER_ADMIN_2FA_SECRET = "HARISUMIRANROOTMANDIRADMIN234567";
export const ROOT_SUPER_ADMIN_RECOVERY_CODES = [
  "34AA-5F87",
  "BB9D-835A",
  "3EC0-0853",
  "8D6F-40A4",
  "1C75-BD03",
  "D5DA-1C9E",
  "B0CD-7F32",
  "50BA-5D49",
];

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Decodes a Base32 encoded string into a Buffer
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) {
      throw new Error(`Invalid Base32 character: ${clean[i]}`);
    }
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Encodes a Buffer into a Base32 string
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generates a cryptographically random Base32 secret for TOTP setup
 */
export function generateTOTPSecret(byteLength = 20): string {
  const randomBytes = crypto.randomBytes(byteLength);
  return base32Encode(randomBytes);
}

/**
 * Generates single-use emergency break-glass recovery codes
 */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${hex.slice(0, 4)}-${hex.slice(4)}`);
  }
  return codes;
}

/**
 * Generates a 6-digit TOTP code according to RFC 6238 (HMAC-SHA1)
 */
export function generateTOTP(
  secret: string,
  timeMs: number = Date.now(),
  stepSeconds = 30
): string {
  const key = base32Decode(secret);
  const counter = Math.floor(timeMs / 1000 / stepSeconds);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1000000;

  return code.toString().padStart(6, "0");
}

export interface VerifyTotpResult {
  valid: boolean;
  timeStep?: number;
  reason?: string;
}

/**
 * Verifies a 6-digit TOTP token with clock drift tolerance and anti-replay protection
 * @param token The 6-digit code entered by the user
 * @param secret The Base32 secret key
 * @param window Clock drift tolerance window (default 1 = ±30 seconds)
 * @param lastUsedTimeStep The last verified counter step (to prevent replay attacks)
 */
export function verifyTOTP(
  token: string,
  secret: string,
  window = 1,
  lastUsedTimeStep?: number
): VerifyTotpResult {
  const cleanToken = (token || "").trim().replace(/\s+/g, "");
  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return { valid: false, reason: "Invalid token format. Must be 6 digits." };
  }

  const now = Date.now();
  const currentStep = Math.floor(now / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const checkStep = currentStep + i;

    // Anti-replay check: this step has already been consumed
    if (lastUsedTimeStep !== undefined && checkStep <= lastUsedTimeStep) {
      continue;
    }

    const checkTime = checkStep * 30 * 1000;
    try {
      if (generateTOTP(secret, checkTime) === cleanToken) {
        return {
          valid: true,
          timeStep: checkStep,
        };
      }
    } catch (e: any) {
      return { valid: false, reason: e.message };
    }
  }

  return { valid: false, reason: "Code does not match or has expired." };
}

/**
 * Verifies and burns a single-use emergency recovery code
 */
export function verifyRecoveryCode(
  enteredCode: string,
  recoveryCodes: string[] = []
): { valid: boolean; remainingCodes: string[] } {
  const cleanCode = (enteredCode || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const matchingIndex = recoveryCodes.findIndex((c) => {
    const cleanSaved = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return cleanSaved === cleanCode;
  });

  if (matchingIndex === -1) {
    return { valid: false, remainingCodes: recoveryCodes };
  }

  // Remove the used recovery code
  const remainingCodes = [
    ...recoveryCodes.slice(0, matchingIndex),
    ...recoveryCodes.slice(matchingIndex + 1),
  ];

  return { valid: true, remainingCodes };
}

/**
 * Builds the standard otpauth:// URL recognized by Google Authenticator
 */
export function buildOtpAuthUrl(
  account: string,
  secret: string,
  issuer = "HariSumiran"
): string {
  const cleanAccount = (account || "").trim();
  const cleanIssuer = (issuer || "HariSumiran").trim();
  return `otpauth://totp/${encodeURIComponent(cleanIssuer)}:${cleanAccount}?secret=${secret}&issuer=${encodeURIComponent(
    cleanIssuer
  )}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generates a base64 Data URL for QR Code image
 */
export async function generateQRCodeDataUrl(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl, {
    width: 380,
    margin: 3,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
