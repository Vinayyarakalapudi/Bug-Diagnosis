import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify the token is still valid in the background
      authApi
        .getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        })
        .catch(() => {
          // interceptor handles redirect on 401
        });
    }
    setLoading(false);
  }, []);

  const persistSession = (data) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    persistSession(data);
    return data.user;
  };

  const register = async (fullName, email, password) => {
    const data = await authApi.register({ full_name: fullName, email, password });
    persistSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
