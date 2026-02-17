import "server-only";
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Helper to initialize admin app
function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

function createFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
            : undefined,
    } as ServiceAccount;

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

const adminApp = createFirebaseAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminAuth, adminDb };
