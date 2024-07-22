import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('data');
      console.log("Token:" + token);
      if (token !== null) {
        setIsLoggedIn(true);
      }
      setIsLoading(false); // Set loading to false after checking token
    } catch (error) {
      console.error('Failed to load the token');
      setIsLoading(false); // Set loading to false even if there is an error
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('data');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Failed to remove the token');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
