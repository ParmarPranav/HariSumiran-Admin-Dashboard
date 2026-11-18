import { getApps, initializeApp, cert } from "firebase-admin/app";
import type { App, ServiceAccount } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import type { Messaging } from "firebase-admin/messaging";
import { createPrivateKey } from "crypto";
import fs from "fs";
import path from "path";

let firebaseAdminApp: App | null = null;
let lastInitError: string | null = null;

function cleanEnvString(val?: string | null): string {
  if (!val) return "";
  let s = val.trim();
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export function reconstructPemKey(input?: string | null): string {
  if (!input) return "";
  let str = input.trim();

  // Strip surrounding quotes
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }

  // If the user pasted the entire service account JSON into FIREBASE_PRIVATE_KEY
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      if (parsed.private_key) {
        return reconstructPemKey(parsed.private_key);
      }
    } catch {}
  }

  // Check if placeholder was copied from .env.example
  if (str.includes("...")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY contains placeholder '...' — please paste the full private key from your service account JSON file."
    );
  }

  // Convert literal \n or \\n into real newlines
  str = str.replaceAll("\\n", "\n").replaceAll("\\r", "").replaceAll("\r\n", "\n");

  const beginTag = "-----BEGIN PRIVATE KEY-----";
  const endTag = "-----END PRIVATE KEY-----";

  if (str.includes(beginTag) && str.includes(endTag)) {
    const startIdx = str.indexOf(beginTag) + beginTag.length;
    const endIdx = str.indexOf(endTag);
    const middle = str.slice(startIdx, endIdx);

    // Filter to base64 characters only
    const cleanBase64 = middle.replace(/[\s\r\n]+/g, "");
    const chunks = cleanBase64.match(/.{1,64}/g) || [];
    return `${beginTag}\n${chunks.join("\n")}\n${endTag}\n`;
  }

  // Ensure headers exist if they were stripped
  if (!str.includes(beginTag)) {
    str = `${beginTag}\n${str}`;
  }
  if (!str.includes(endTag)) {
    str = `${str}\n${endTag}\n`;
  }
  return str;
}

/**
 * Attempt to resolve service account credentials from:
 * 1. FIREBASE_SERVICE_ACCOUNT_BASE64 (base64 encoded JSON)
 * 2. FIREBASE_SERVICE_ACCOUNT_KEY / FIREBASE_CONFIG (raw JSON)
 * 3. Individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 4. Local .env.local fallback for dev
 */
function resolveCredentials(): {
  serviceAccount?: ServiceAccount;
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  error?: string;
} {
  // Option 1: Base64 encoded Service Account JSON (100% newline/quote safe for Vercel)
  const base64Json = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64Json && base64Json.trim()) {
    try {
      const decoded = Buffer.from(base64Json.trim(), "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        parsed.private_key = reconstructPemKey(parsed.private_key);
        return {
          serviceAccount: parsed,
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
        };
      }
    } catch (e: any) {
      console.warn("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:", e.message);
    }
  }

  // Option 2: Full JSON string in FIREBASE_SERVICE_ACCOUNT_KEY
  const fullJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_CONFIG;
  if (fullJsonRaw && fullJsonRaw.trim()) {
    try {
      let jsonStr = fullJsonRaw.trim();
      if (!jsonStr.startsWith("{")) {
        try {
          jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
        } catch {}
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        parsed.private_key = reconstructPemKey(parsed.private_key);
        return {
          serviceAccount: parsed,
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
        };
      }
    } catch (e: any) {
      console.warn("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
    }
  }

  // Option 3: Individual Environment Variables
  let projectId = cleanEnvString(process.env.FIREBASE_PROJECT_ID);
  let clientEmail = cleanEnvString(process.env.FIREBASE_CLIENT_EMAIL);
  let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Local development fallback
  if ((!projectId || !rawPrivateKey) && typeof process !== "undefined" && process.cwd) {
    try {
      const localEnvPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(localEnvPath)) {
        const fileContent = fs.readFileSync(localEnvPath, "utf8");
        const lines = fileContent.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("FIREBASE_PROJECT_ID=") && !projectId) {
            projectId = cleanEnvString(trimmed.slice("FIREBASE_PROJECT_ID=".length));
          } else if (trimmed.startsWith("FIREBASE_CLIENT_EMAIL=") && !clientEmail) {
            clientEmail = cleanEnvString(trimmed.slice("FIREBASE_CLIENT_EMAIL=".length));
          } else if (trimmed.startsWith("FIREBASE_PRIVATE_KEY=") && !rawPrivateKey) {
            rawPrivateKey = trimmed.slice("FIREBASE_PRIVATE_KEY=".length);
          }
        }
      }
    } catch {}
  }

  if (!projectId || !clientEmail || !rawPrivateKey) {
    const missing: string[] = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!rawPrivateKey) missing.push("FIREBASE_PRIVATE_KEY");
    return {
      error: `Missing required environment variables: ${missing.join(", ")}. If recently updated in Vercel, please trigger a redeployment.`,
    };
  }

  let privateKey: string;
  try {
    privateKey = reconstructPemKey(rawPrivateKey);
    // Validate with native crypto
    createPrivateKey(privateKey);
  } catch (err: any) {
    return {
      error: `Failed to parse private key: ${err.message}. Ensure the full private key from your service account JSON is set.`,
      projectId,
      clientEmail,
    };
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdminApp(): App | null {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
    return firebaseAdminApp;
  }

  const creds = resolveCredentials();

  if (creds.error) {
    lastInitError = creds.error;
    console.warn(`[FirebaseAdmin] ${lastInitError}`);
    return null;
  }

  try {
    if (creds.serviceAccount) {
      firebaseAdminApp = initializeApp({
        credential: cert(creds.serviceAccount),
      });
    } else if (creds.projectId && creds.clientEmail && creds.privateKey) {
      firebaseAdminApp = initializeApp({
        credential: cert({
          projectId: creds.projectId,
          clientEmail: creds.clientEmail,
          privateKey: creds.privateKey,
        }),
      });
    } else {
      lastInitError = "Missing Firebase service account credentials.";
      return null;
    }

    lastInitError = null;
    console.log("[FirebaseAdmin] Successfully initialized Firebase Admin app for project:", creds.projectId);
    return firebaseAdminApp;
  } catch (error: any) {
    lastInitError = `Firebase Admin initialization error: ${error.message}`;
    console.error("[FirebaseAdmin]", lastInitError);
    return null;
  }
}

export function getFCM(): Messaging | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getMessaging(app);
  } catch (error: any) {
    lastInitError = `Error getting Messaging instance: ${error.message}`;
    console.error("[FirebaseAdmin]", lastInitError);
    return null;
  }
}

export function getFirebaseAdminStatus(): {
  connected: boolean;
  projectId: string | null;
  clientEmail: string | null;
  hasPrivateKey: boolean;
  error: string | null;
} {
  const creds = resolveCredentials();
  const app = getFirebaseAdminApp();
  return {
    connected: !!app,
    projectId: creds.projectId || null,
    clientEmail: creds.clientEmail || null,
    hasPrivateKey: !!(creds.privateKey || creds.serviceAccount),
    error: lastInitError || creds.error || null,
  };
}
