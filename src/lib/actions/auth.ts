'use server';

import { adminAuth, adminDb } from '../firebase/admin';
import { cookies } from 'next/headers';

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('name') as string;
  const firstName = (formData.get('firstName') as string) || fullName?.split(' ')[0] || '';
  const lastName = (formData.get('lastName') as string) || fullName?.split(' ').slice(1).join(' ') || '';

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  try {
    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName || `${firstName} ${lastName}`.trim(),
    });

    // 2. Add user profile to Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      displayName: fullName || `${firstName} ${lastName}`.trim(),
      role: 'USER',
      createdAt: new Date().toISOString(),
      cart: [],
    });

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      return { error: 'This email is already registered' };
    }
    return { error: error.message || 'Failed to register' };
  }
}

export async function loginUser(idToken: string) {
  // This would be called from the client after sign-in to set a session cookie
  const cookieStore = await cookies();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return { success: true };
  } catch (error) {
    console.error('Login session error:', error);
    return { error: 'Failed to create session' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('__session');
  return { success: true };
}

export async function demoLogin() {
  const cookieStore = await cookies();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  
  // Set a mock session cookie
  cookieStore.set('__session', 'demo-session-token', {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  
  return { success: true };
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session) {
    throw new Error('Unauthorized: No session token');
  }

  // Support demo token in development / local testing
  if (session === 'demo-session-token') {
    return { uid: 'demo-admin', email: 'admin@bbetter.com', role: 'ADMIN' };
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    
    // Fetch user document from Firestore to verify role
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('Unauthorized: User record not found');
    }
    
    const userData = userDoc.data();
    if (userData?.role !== 'ADMIN') {
      throw new Error('Unauthorized: Access denied');
    }
    
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: userData.role
    };
  } catch (error: any) {
    console.error('Session verification failed:', error);
    throw new Error('Unauthorized: Invalid session');
  }
}

export async function verifyUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session) {
    throw new Error('Unauthorized: No session token');
  }

  // Support demo token in development / local testing
  if (session === 'demo-session-token') {
    return { uid: 'demo-user', email: 'user@example.com' };
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    };
  } catch (error) {
    throw new Error('Unauthorized: Invalid session');
  }
}
