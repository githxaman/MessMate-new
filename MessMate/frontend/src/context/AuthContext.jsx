import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, firebaseConfigured } from '../config/firebase';
import { setDemoAuthToken, userAPI } from '../services/api';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../config/demoAccounts';

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = 'messmate-demo-session';

const createDemoUser = (token, user) => ({
  uid: user.firebaseUid,
  email: user.email,
  getIdToken: async () => token,
});

const saveDemoSession = (token, user) => {
  setDemoAuthToken(token);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ token, user }));
};

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
    const savedDemoSession = localStorage.getItem(DEMO_SESSION_KEY);
    if (savedDemoSession) {
      try {
        const { token, user } = JSON.parse(savedDemoSession);
        if (token && user?.firebaseUid && user?.email) {
          setDemoAuthToken(token);
          setFirebaseUser(createDemoUser(token, user));
          setProfile(user);
          setLoading(false);
          return;
        }
      } catch (sessionError) {
        console.warn('Stored demo session could not be restored:', sessionError);
      }
      localStorage.removeItem(DEMO_SESSION_KEY);
    }

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
        const normalizedEmail = email.trim().toLowerCase();
        const demoAccount = DEMO_ACCOUNTS[normalizedEmail];
        if (!import.meta.env.DEV || firebaseConfigured) {
          throw fbErr;
        }

        if (demoAccount && demoAccount.role !== 'student' && password === DEMO_PASSWORD) {
          const { role, name } = demoAccount;
          const demoToken = `demo-token-${role}`;
          const demoProfile = {
            _id: '650000000000000000000001',
            firebaseUid: `demo-uid-${role}`,
            name,
            email: normalizedEmail,
            role,
            foodPreference: 'vegetarian',
            roomNumber: '101',
          };
          saveDemoSession(demoToken, demoProfile);
          setFirebaseUser(createDemoUser(demoToken, demoProfile));
          setProfile(demoProfile);
          return { user: createDemoUser(demoToken, demoProfile), profile: demoProfile };
        }

        const { data } = await userAPI.loginDemoStudent({ email: normalizedEmail, password });
        saveDemoSession(data.token, data.user);
        setFirebaseUser(createDemoUser(data.token, data.user));
        setProfile(data.user);
        return { user: createDemoUser(data.token, data.user), profile: data.user };
      }

      setDemoAuthToken(null);
      localStorage.removeItem(DEMO_SESSION_KEY);
      const userProfile = await fetchProfile();
      if (!userProfile) {
        throw new Error('Profile not found. Please complete registration.');
      }
      return { user: cred.user, profile: userProfile };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message || 'Login failed');
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (email, password, userData) => {
    setError(null);
    try {
      if (import.meta.env.DEV && !firebaseConfigured) {
        const { data } = await userAPI.registerDemoStudent({ ...userData, password });
        saveDemoSession(data.token, data.user);
        setFirebaseUser(createDemoUser(data.token, data.user));
        setProfile(data.user);
        return { user: createDemoUser(data.token, data.user), profile: data.user };
      }

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
    setDemoAuthToken(null);
    localStorage.removeItem(DEMO_SESSION_KEY);
    setFirebaseUser(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    const { data: response } = await userAPI.updateProfile(data);
    setProfile(response.user);
    return response.user;
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
