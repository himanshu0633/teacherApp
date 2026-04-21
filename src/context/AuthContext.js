import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export function AuthProvider({children}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('teacherData');
        if (saved) {
          setUser(JSON.parse(saved));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('[AUTH] restore error', error);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

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
        setUser(null);
        setIsLoggedIn(false);
      },
    }),
    [isLoggedIn, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
