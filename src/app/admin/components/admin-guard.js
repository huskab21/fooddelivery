"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(provider)/authprovider";

// /admin доторх бүх хуудсыг хамгаална:
// - нэвтрээгүй бол → /login
// - нэвтэрсэн ч ADMIN биш бол → /
// - ADMIN бол → хуудсыг харуулна
export function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (loading) return; // localStorage уншиж дуустал хүлээнэ
    if (!user) router.replace("/login");
    else if (!isAdmin) router.replace("/");
  }, [loading, user, isAdmin, router]);

  // Шалгаж дуустал эсвэл admin биш бол admin-ий контентыг огт render хийхгүй
  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  return children;
}