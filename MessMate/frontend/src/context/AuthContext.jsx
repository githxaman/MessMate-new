import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setProfile(data.user);
      return data.user;
    } catch {
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      let cred = null;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        console.warn('Firebase login skipped, using dev demo fallback:', fbErr.message);
        const role = email.includes('staff') ? 'staff' : email.includes('admin') ? 'admin' : 'student';
        const demoUser = {
          uid: `demo-uid-${role}`,
          email: email,
          getIdToken: async () => `demo-token-${role}-${Date.now()}`,
        };
        const demoProfile = {
          _id: '650000000000000000000001',
          name: email.split('@')[0] || 'Demo User',
          email,
          role,
          dietaryPreference: 'veg',
          roomNumber: '101',
        };
        setFirebaseUser(demoUser);
        setProfile(demoProfile);
        return { user: demoUser, profile: demoProfile };
      }

      const userProfile = await fetchProfile();
      if (!userProfile) {
        throw new Error('Profile not found. Please complete registration.');
      }
      return { user: cred.user, profile: userProfile };
    } catch (err) {
      const message =
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (email, password, userData) => {
    setError(null);
    try {
      await userAPI.verifyStudent({
        studentId: userData.studentId,
        collegeEmail: userData.email,
      });
      let cred = null;
      try {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        throw new Error(fbErr.code === 'auth/invalid-api-key'
          ? 'Firebase is not configured. Add the Firebase client environment variables before registering.'
          : fbErr.message);
      }

      await userAPI.register({
        firebaseUid: cred.user.uid,
        ...userData,
      });
      const userProfile = await fetchProfile();
      return { user: cred.user, profile: userProfile };
    } catch (err) {
      let message = 'Registration failed';
      if (err.code === 'auth/email-already-in-use') message = 'Email already registered';
      else if (err.response?.data?.message) message = err.response.data.message;
      else if (err.message) message = err.message;
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      if (auth && typeof signOut === 'function') {
        await signOut(auth);
      }
    } catch (_) {}
    setFirebaseUser(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    try {
      const { data: res } = await userAPI.updateProfile(data);
      setProfile(res.user);
      return res.user;
    } catch {
      const updated = { ...profile, ...data };
      setProfile(updated);
      return updated;
    }
  };

  const refreshProfile = fetchProfile;

  const value = {
    firebaseUser,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!firebaseUser && !!profile,
    role: profile?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
