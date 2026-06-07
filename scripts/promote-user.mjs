import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local file to fetch service account key
let serviceAccount;
try {
  const envContent = readFileSync('.env.local', 'utf8');
  const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.*)/);
  if (match) {
    serviceAccount = JSON.parse(match[1].trim());
  }
} catch (e) {
  // Fallback to serviceAccountKey.json
  try {
    serviceAccount = JSON.parse(readFileSync(resolve('serviceAccountKey.json'), 'utf8'));
  } catch (err) {
    console.error("Error: Could not find FIREBASE_SERVICE_ACCOUNT_KEY in .env.local or serviceAccountKey.json");
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/promote-user.mjs <user-email>");
  process.exit(1);
}

async function promote() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    console.error(`Error: User with email "${email}" not found in Firestore.`);
    console.log("Please make sure the user is registered first through the app's signup page.");
    process.exit(1);
  }

  const userDoc = snapshot.docs[0];
  await userDoc.ref.update({ role: 'ADMIN' });
  console.log(`Success! User "${email}" (UID: ${userDoc.id}) has been promoted to ADMIN.`);
}

promote().catch(console.error);
