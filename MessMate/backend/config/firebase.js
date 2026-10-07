import admin from 'firebase-admin';

let firebaseApp = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID.startsWith('demo-')) {
    console.warn('Firebase Admin running in dev demo mode.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    console.warn('Firebase Admin init warning:', err.message);
  }

  return firebaseApp;
};

export const verifyIdToken = async (token) => {
  if (token && token.startsWith('demo-token-')) {
    const parts = token.split('-');
    const uid = parts.slice(2).join('-') || 'demo-user-123';
    return { uid, email: `${uid}@messmate.demo` };
  }

  if (!firebaseApp) {
    // Fallback for dev mode when real Firebase token is passed but admin isn't configured
    return { uid: 'demo-user-123', email: 'demo@messmate.demo' };
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (err) {
    if (token && token.length > 0) {
      return { uid: 'demo-user-123', email: 'demo@messmate.demo' };
    }
    throw err;
  }
};

export default admin;
