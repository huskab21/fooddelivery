"use client";

import { Fragment, useEffect, useState } from "react";
import { Soup, Timer, MapPin } from "lucide-react";
import { fetchMyOrders, getErrorMessage } from "@/app/_api/api";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_STYLES = {
  PENDING: { label: "Pending", className: "border-red-500 text-slate-900" },
  DELIVERED: { label: "Delivered", className: "border-transparent bg-slate-100 text-slate-900" },
  CANCELED: { label: "Cancelled", className: "border-transparent bg-slate-100 text-slate-400" },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${mm}/${dd}`;
};

// Mongo _id-ийн сүүлийн 5 тэмдэгтийг захиалгын дугаар болгож харуулна
const orderNumber = (id) => id.slice(-5).toUpperCase();

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab нээгдэх бүрд component дахин mount болж шинэ өгөгдөл татна
  useEffect(() => {
    fetchMyOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4">
      <h4 className="text-lg font-semibold text-black mb-4">Order history</h4>

      {loading && <p className="py-6 text-center text-sm text-slate-400">Loading orders…</p>}

      {!loading && error && (
        <p className="py-6 text-center text-sm text-red-500">Could not load orders: {error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          title="No Orders Yet?"
          description="🍕 You haven't placed any orders yet. Start exploring our menu and satisfy your cravings!"
        />
      )}

      {!loading &&
        !error &&
        orders.map((order, index) => {
          const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;

          return (
            <Fragment key={order._id}>
              {index > 0 && <div className="border-t border-dashed border-slate-300 my-4" />}

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-black">
                    ${Number(order.totalPrice).toFixed(2)} (#{orderNumber(order._id)})
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {order.foodOrderItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-slate-500"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Soup className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.food?.foodName ?? "Deleted food"}</span>
                    </div>
                    <span className="text-black">x {item.quantity}</span>
                  </div>
                ))}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Timer className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{order.address}</span>
                </div>
              </div>
            </Fragment>
          );
        })}
    </div>
  );
}