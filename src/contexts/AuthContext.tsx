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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsEmailVerified(user.emailVerified);
        await fetchAndSetUserProfile(user);
      } else {
        setUserProfile(null);
        setRole(null);
        setIsEmailVerified(false);
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
      setLoading(false);
      let msg = 'Authentication failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        msg = 'Network error. Please verify your internet connection.';
      } else if (error.message) {
        msg = error.message;
      }
      setAuthError(msg);
      throw new Error(msg);
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
      setLoading(false);
      let msg = 'Registration failed. Please check your inputs.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Invalid email format.';
      } else if (error.message) {
        msg = error.message;
      }
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err: any) {
        console.error('Error sending verification email:', err);
        throw new Error(err.message || 'Failed to send verification email.');
      }
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      setIsEmailVerified(verified);
      return verified;
    }
    return false;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
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
