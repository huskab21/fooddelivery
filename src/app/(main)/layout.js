"use client";

import { CartProvider } from "@/providers/cart-provider";
import Header from "@/app/(main)/_components/header";
import CartSheet from "@/app/(main)/_features/cart-sheet";

export default function MainLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-stone-100 text-slate-900">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
        <CartSheet />
      </div>
    </CartProvider>
  );
}
