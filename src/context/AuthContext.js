import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  validateSession: async () => {},
  loading: true,
});

export function AuthProvider({children}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const validateSession = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('teacherData');

      if (!saved) {
        clearSession();
        return false;
      }

      setUser(JSON.parse(saved));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.log('[AUTH] validate error', error);
      clearSession();
      return false;
    }
  }, [clearSession]);

  useEffect(() => {
    const restore = async () => {
      await validateSession();
      setLoading(false);
    };

    restore();
  }, [validateSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        validateSession();
      }
    });

    return () => subscription.remove();
  }, [validateSession]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      loading,
      login: async teacherData => {
        await AsyncStorage.setItem('teacherData', JSON.stringify(teacherData));
        setUser(teacherData);
        setIsLoggedIn(true);
      },
      logout: async () => {
        await AsyncStorage.multiRemove(['teacherData', 'teacher_token']);
        clearSession();
      },
      validateSession,
    }),
    [clearSession, isLoggedIn, loading, user, validateSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
