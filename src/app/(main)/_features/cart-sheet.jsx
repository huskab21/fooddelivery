"use client";

import { useCart } from "@/providers/cart-provider";
import { Button } from "@/components/ui/button";

export default function CartSheet() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <aside className="fixed right-6 top-24 w-[360px] rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Your cart</h2>
        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
          {items.length} items
        </span>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">${item.price.toFixed(2)}</p>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} className="text-xs text-slate-400 hover:text-red-500">
                  Remove
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 text-lg text-slate-500">
                    −
                  </button>
                  <span className="min-w-4 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 text-lg text-slate-500">
                    +
                  </button>
                </div>
                <p className="font-semibold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        <Button className="w-full rounded-xl bg-orange-500 text-white hover:bg-orange-600">
          Checkout
        </Button>
      </div>
    </aside>
  );
}
