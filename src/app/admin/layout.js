"use client";

import Sidebar from "./components/sidebar";
import { AdminGuard } from "./components/admin-guard";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </AdminGuard>
  );
}