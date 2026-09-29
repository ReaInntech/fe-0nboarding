import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
function formatPrivateKey(keyStr?: string) {
  if (!keyStr) return undefined;
  
  // Remove wrapping quotes if present
  let key = keyStr.replace(/^"|"$/g, '');
  
  // Extract base64 content between the standard PEM headers
  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/s);
  if (match) {
    // Remove literal '\n', literal '\', and all whitespace from the base64 content
    const base64 = match[1].replace(/\\n/g, '').replace(/\\/g, '').replace(/\s+/g, '');
    
    // Split into 64-character lines (standard PEM format)
    const formattedBase64 = base64.match(/.{1,64}/g)?.join('\n') || '';
    return `-----BEGIN PRIVATE KEY-----\n${formattedBase64}\n-----END PRIVATE KEY-----\n`;
  }
  
  // Fallback if it doesn't match the standard enclosing tags
  return key.replace(/\\n/g, '\n');
}

const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin with singleton pattern
const app = admin.apps.length > 0
  ? admin.apps[0]
  : (projectId && clientEmail && privateKey
    ? admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    : null);

if (!app) {
  console.warn('[Firebase Admin] Warning: SDK not initialized due to missing credentials. Server-side auth may fail.');
}

// Safely export services (will throw if app is null and accessed, but we guard usage)
export const adminAuth = app ? admin.auth(app) : null as unknown as admin.auth.Auth;
export const adminDb = app ? admin.firestore(app) : null as unknown as admin.firestore.Firestore;
