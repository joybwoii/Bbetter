import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

// Ensure we don't initialize twice
let app;
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  app = initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Firebase admin initialization error:", error);
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function wipeDatabase() {
  console.log("Starting database wipe...");
  const collections = ['products', 'categories', 'orders', 'users'];
  
  for (const coll of collections) {
    console.log(`Deleting collection ${coll}...`);
    await deleteCollection(coll, 100);
  }
  
  // Also delete all Auth users
  console.log("Deleting all Auth users...");
  const listUsersResult = await auth.listUsers(1000);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
  if (uids.length > 0) {
    await auth.deleteUsers(uids);
  }
  
  console.log("Database wiped clean.");
}

async function createAdminUser() {
  console.log("Creating strict admin user...");
  try {
    const userRecord = await auth.createUser({
      email: 'adminbbetter@gmail.com',
      password: 'bbetter@2026',
      displayName: 'Bbetter Admin'
    });
    
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: 'adminbbetter@gmail.com',
      displayName: 'Bbetter Admin',
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    });
    
    console.log(`Admin user created with UID: ${userRecord.uid}`);
  } catch (err) {
    console.error("Error creating admin user:", err);
  }
}

async function main() {
  await wipeDatabase();
  await createAdminUser();
  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);
