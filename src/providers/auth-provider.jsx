"use client";

import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: "guest",
    name: "Guest user",
    email: "guest@example.com",
    role: "customer",
  });

  const login = (nextUser) => setUser(nextUser);
  const logout = () =>
    setUser({
      id: "guest",
      name: "Guest user",
      email: "guest@example.com",
      role: "customer",
    });

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user && user.id !== "guest"),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
