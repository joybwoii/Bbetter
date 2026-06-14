const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

require('dotenv').config({ path: '.env.local' });

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) 
  : null;

if (!serviceAccount) {
  console.error("Service account key not found in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const email = 'adminbbetter@gmail.com';
  const password = 'bbetter@2026';
  
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User exists in Auth, updating password...');
      await auth.updateUser(userRecord.uid, { password });
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log('User not found in Auth, creating...');
        userRecord = await auth.createUser({
          email,
          password,
          displayName: 'Admin User',
        });
      } else {
        throw e;
      }
    }

    // Ensure Firestore document exists and has ADMIN role
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: 'ADMIN',
      displayName: 'Admin User',
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log('Admin user successfully seeded/verified.');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
