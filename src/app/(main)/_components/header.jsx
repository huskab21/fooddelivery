"use client";

import Link from "next/link";
import { useCart } from "@/providers/cart-provider";
import { useAuth } from "@/providers/auth-provider";

export default function Header() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
            F
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">FoodFlow</p>
            <p className="text-lg font-semibold text-slate-900">Fresh & fast</p>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
            <span className="text-slate-400">⌕</span>
            <input
              aria-label="Search food"
              value=""
              readOnly
              placeholder="Search dishes"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="relative rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
            🛒
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
              {user.name.charAt(0)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs text-slate-400">Signed in</p>
              <p className="text-sm font-medium text-slate-800">{user.name}</p>
            </div>
            <button type="button" onClick={logout} className="ml-1 text-xs text-slate-500 hover:text-slate-800">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
