import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
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

function sanitizePrivateKey(rawKey?: string | null): string {
  if (!rawKey) return "";
  let key = rawKey.trim();

  // If the user pasted the entire service account JSON into FIREBASE_PRIVATE_KEY
  if (key.startsWith("{") && key.endsWith("}")) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) {
        return sanitizePrivateKey(parsed.private_key);
      }
    } catch {
      // Not JSON, continue with normal processing
    }
  }

  // Strip surrounding quotes
  while (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // Replace escaped newlines (both \\\\n and \\n) with actual newlines
  key = key.replace(/\\\\n/g, "\n");
  key = key.replace(/\\n/g, "\n");
  key = key.replace(/\\r/g, "");
  key = key.replace(/\r\n/g, "\n");
  key = key.replace(/\\"/g, '"');

  return key.trim();
}

/**
 * Attempt to load credentials from multiple possible sources:
 * 1. Process environment variables (Vercel / Production)
 * 2. FIREBASE_SERVICE_ACCOUNT_KEY (full JSON string or base64)
 * 3. Local .env.local file fallback for development
 */
function resolveCredentials() {
  let projectId = cleanEnvString(process.env.FIREBASE_PROJECT_ID);
  let clientEmail = cleanEnvString(process.env.FIREBASE_CLIENT_EMAIL);
  let privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  // Check if a full service account JSON was provided in an env var
  const fullJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_CONFIG;
  if (fullJsonRaw && (!projectId || !privateKey)) {
    try {
      let jsonStr = fullJsonRaw.trim();
      if (!jsonStr.startsWith("{")) {
        // Maybe base64 encoded
        try {
          jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
        } catch {}
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.project_id) projectId = parsed.project_id;
      if (parsed.client_email) clientEmail = parsed.client_email;
      if (parsed.private_key) privateKey = sanitizePrivateKey(parsed.private_key);
    } catch (e: any) {
      console.warn("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", e.message);
    }
  }

  // Local development fallback: try loading .env.local manually if running in Node
  if ((!projectId || !privateKey) && typeof process !== "undefined" && process.cwd) {
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
          } else if (trimmed.startsWith("FIREBASE_PRIVATE_KEY=") && !privateKey) {
            privateKey = sanitizePrivateKey(trimmed.slice("FIREBASE_PRIVATE_KEY=".length));
          }
        }
      }
    } catch {}
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

  const { projectId, clientEmail, privateKey } = resolveCredentials();

  if (!projectId || !clientEmail || !privateKey) {
    const missing: string[] = [];
    if (!projectId) missing.push("FIREBASE_PROJECT_ID");
    if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

    lastInitError = `Missing required environment variables: ${missing.join(", ")}. If you just added them in Vercel, please trigger a redeployment.`;
    console.warn(`[FirebaseAdmin] ${lastInitError}`);
    return null;
  }

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    lastInitError =
      "FIREBASE_PRIVATE_KEY is invalid: missing '-----BEGIN PRIVATE KEY-----' header. Check quotes and line breaks.";
    console.error(`[FirebaseAdmin] ${lastInitError}`);
    return null;
  }

  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    lastInitError = null;
    console.log("[FirebaseAdmin] Successfully initialized Firebase Admin app for project:", projectId);
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
  const { projectId, clientEmail, privateKey } = resolveCredentials();
  const app = getFirebaseAdminApp();
  return {
    connected: !!app,
    projectId: projectId || null,
    clientEmail: clientEmail || null,
    hasPrivateKey: !!privateKey,
    error: lastInitError,
  };
}
