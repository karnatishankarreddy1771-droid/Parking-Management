import { firebaseConfig } from '../firebase/firebase';

export function formatFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred.';

  const code = error.code || '';
  const message = error.message || String(error);
  const proj = firebaseConfig.projectId || 'Firebase';

  if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key' || message.includes('API key')) {
    return `Your Firebase API Key is missing or invalid. Click "Configure Firebase SDK Credentials" on the login page to enter your Web API Key from the Firebase Console (${proj}).`;
  }

  if (code === 'auth/unauthorized-domain' || code === 'auth/domain-not-allowed' || message.includes('unauthorized-domain')) {
    const origin = typeof window !== 'undefined' ? window.location.hostname : 'your current domain';
    return `Unauthorized domain (${origin}). Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add "${origin}" and "${proj}.firebaseapp.com".`;
  }

  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return `Email/Password sign-in is disabled in Firebase Console for project "${proj}". To enable: go to Firebase Console -> Authentication -> Sign-in method -> Email/Password -> Enable.`;
  }

  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid email or password.';
  }

  if (code === 'auth/email-already-in-use') {
    return `This email address is already registered in ${proj}.`;
  }

  if (code === 'auth/weak-password') {
    return 'Password must be at least 6 characters.';
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again in a few minutes.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }

  return message;
}
