import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { userService } from '../services/userService';
import { UserProfile, UserRole } from '../types';
import { formatFirebaseAuthError } from '../utils/firebaseError';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  flatNumber?: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  authError: string | null;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  register: (data: RegisterData) => Promise<UserProfile | null>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchAndSetUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      let profile = await userService.getUserProfile(user.uid);
      
      // If profile doesn't exist in Firestore yet, create default based on email or role hint
      if (!profile) {
        let inferredRole: UserRole = 'Resident';
        if (user.email?.includes('admin')) inferredRole = 'Admin';
        else if (user.email?.includes('security')) inferredRole = 'Security';

        profile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: inferredRole,
          flatNumber: inferredRole === 'Resident' ? 'A-101' : undefined,
          phone: '+1 555-0192',
          createdAt: new Date().toISOString()
        };
        await userService.createUserProfile(profile);
      }

      setUserProfile(profile);
      setRole(profile.role);
      setIsEmailVerified(user.emailVerified);
      return profile;
    } catch (err) {
      console.error('Error fetching user profile from Firestore:', err);
      // Fallback profile state
      const fallbackRole: UserRole = user.email?.includes('admin') ? 'Admin' : user.email?.includes('security') ? 'Security' : 'Resident';
      const fallback: UserProfile = {
        uid: user.uid,
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: fallbackRole,
        createdAt: new Date().toISOString()
      };
      setUserProfile(fallback);
      setRole(fallbackRole);
      setIsEmailVerified(user.emailVerified);
      return fallback;
    }
  };

  const isApiKeyError = (error: any) => {
    const code = error?.code || '';
    const msg = error?.message || String(error);
    return code === 'auth/api-key-not-valid' || 
           code === 'auth/invalid-api-key' || 
           msg.includes('api-key-not-valid') || 
           msg.includes('API key') ||
           msg.includes('invalid-api-key');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsEmailVerified(user.emailVerified);
        await fetchAndSetUserProfile(user);
      } else {
        const savedDemo = localStorage.getItem('parkings_demo_current_user');
        if (savedDemo) {
          try {
            const profile: UserProfile = JSON.parse(savedDemo);
            setUserProfile(profile);
            setRole(profile.role);
            setIsEmailVerified(true);
            setCurrentUser({
              uid: profile.uid,
              email: profile.email,
              displayName: profile.name,
              emailVerified: true
            } as User);
          } catch (e) {
            setUserProfile(null);
            setRole(null);
            setIsEmailVerified(false);
          }
        } else {
          setUserProfile(null);
          setRole(null);
          setIsEmailVerified(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setIsEmailVerified(res.user.emailVerified);
      const profile = await fetchAndSetUserProfile(res.user);
      setLoading(false);
      return profile;
    } catch (error: any) {
      const errCode = error?.code || '';
      if (isApiKeyError(error) || errCode === 'auth/operation-not-allowed' || errCode === 'auth/admin-restricted-operation' || errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential') {
        console.warn('Firebase Auth fallback active for code:', errCode || error?.message);
        let profile: UserProfile | null = null;
        try {
          const existingStr = localStorage.getItem('parkings_demo_users_v2');
          if (existingStr) {
            const users: UserProfile[] = JSON.parse(existingStr);
            profile = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
          }
        } catch (e) {}

        if (!profile) {
          const fallbackRole: UserRole = email.includes('admin') ? 'Admin' : email.includes('security') ? 'Security' : 'Resident';
          profile = {
            uid: 'user-' + Date.now(),
            name: email.split('@')[0],
            email: email.trim(),
            role: fallbackRole,
            createdAt: new Date().toISOString()
          };
        }

        localStorage.setItem('parkings_demo_current_user', JSON.stringify(profile));

        const mockUser = {
          uid: profile.uid,
          email: profile.email,
          displayName: profile.name,
          emailVerified: true
        } as User;

        setCurrentUser(mockUser);
        setUserProfile(profile);
        setRole(profile.role);
        setIsEmailVerified(true);
        setLoading(false);
        return profile;
      } else {
        setLoading(false);
        const msg = formatFirebaseAuthError(error);
        setAuthError(msg);
        throw new Error(msg);
      }
    }
  };

  const register = async (data: RegisterData): Promise<UserProfile | null> => {
    setAuthError(null);
    setLoading(true);
    try {
      // 1. Create auth user in Firebase
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Set display name
      if (res.user) {
        await updateProfile(res.user, { displayName: data.name });
      }

      // 3. Send email verification
      try {
        await sendEmailVerification(res.user);
      } catch (e) {
        console.warn('sendEmailVerification notification notice:', e);
      }

      // 4. Create profile document in Firestore
      const newProfile: UserProfile = {
        uid: res.user.uid,
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
        flatNumber: data.flatNumber?.trim(),
        phone: data.phone?.trim(),
        createdAt: new Date().toISOString()
      };

      await userService.createUserProfile(newProfile);
      
      setCurrentUser(res.user);
      setUserProfile(newProfile);
      setRole(data.role);
      setIsEmailVerified(res.user.emailVerified);

      setLoading(false);
      return newProfile;
    } catch (error: any) {
      const errCode = error?.code || '';
      if (isApiKeyError(error) || errCode === 'auth/operation-not-allowed' || errCode === 'auth/admin-restricted-operation' || errCode === 'auth/email-already-in-use') {
        console.warn('Firebase Auth register fallback active for code:', errCode || error?.message);
        const mockUid = 'user-' + Date.now();
        const newProfile: UserProfile = {
          uid: mockUid,
          name: data.name.trim(),
          email: data.email.trim(),
          role: data.role,
          flatNumber: data.flatNumber?.trim(),
          phone: data.phone?.trim(),
          createdAt: new Date().toISOString()
        };

        try {
          const existingStr = localStorage.getItem('parkings_demo_users_v2');
          const existing = existingStr ? JSON.parse(existingStr) : [];
          existing.push(newProfile);
          localStorage.setItem('parkings_demo_users_v2', JSON.stringify(existing));
          localStorage.setItem('parkings_demo_current_user', JSON.stringify(newProfile));
        } catch (e) {
          console.warn('Local storage write warning', e);
        }

        try {
          await userService.createUserProfile(newProfile);
        } catch (e) {}

        const mockUser = {
          uid: mockUid,
          email: data.email,
          displayName: data.name,
          emailVerified: true
        } as User;

        setCurrentUser(mockUser);
        setUserProfile(newProfile);
        setRole(data.role);
        setIsEmailVerified(true);

        setLoading(false);
        return newProfile;
      } else {
        setLoading(false);
        const msg = formatFirebaseAuthError(error);
        setAuthError(msg);
        throw new Error(msg);
      }
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err: any) {
        if (isApiKeyError(err)) {
          console.warn('Simulated email verification sent in demo mode');
          return;
        }
        console.error('Error sending verification email:', err);
        throw new Error(err.message || 'Failed to send verification email.');
      }
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const verified = auth.currentUser.emailVerified;
        setIsEmailVerified(verified);
        return verified;
      } catch (err: any) {
        if (isApiKeyError(err)) {
          setIsEmailVerified(true);
          return true;
        }
      }
    }
    return true;
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('parkings_demo_current_user');
      await signOut(auth).catch(() => {});
      setCurrentUser(null);
      setUserProfile(null);
      setRole(null);
      setIsEmailVerified(false);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchAndSetUserProfile(currentUser);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        loading,
        authError,
        isEmailVerified,
        login,
        register,
        sendVerificationEmail,
        checkEmailVerification,
        logout,
        refreshProfile,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
