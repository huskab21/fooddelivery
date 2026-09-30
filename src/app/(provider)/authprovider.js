"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthRedirectPath } from "@/lib/auth-redirect";

const AuthContext = createContext(null);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // localStorage уншиж дуустал

  // Хуудас ачаалагдахад өмнө нэвтэрсэн эсэхийг шалгана
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Auth уншихад алдаа:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAuth = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Нэвтрэхэд алдаа гарлаа");

    saveAuth(data);
    // Admin бол admin хуудас руу, энгийн хэрэглэгч бол checkout хийж байсан хуудас руугаа (байхгүй бол "/")
    router.push(
      data.user.role === "ADMIN" ? "/admin/categories" : getAuthRedirectPath(),
    );
  };

  const signup = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Бүртгүүлэхэд алдаа гарлаа");

    saveAuth(data);
    // Бүртгүүлмэгц шууд нэвтэрсэн болох тул хуучин хуудас руугаа буцна
    router.push(getAuthRedirectPath());
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth-ыг AuthProvider дотор ашиглана уу");
  return context;
}