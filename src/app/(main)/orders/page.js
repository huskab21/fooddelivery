import { demoOrders } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";

export default function OrdersPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Orders</p>
          <h1 className="text-3xl font-bold text-slate-900">Your recent orders</h1>
        </div>
      </div>

      <div className="space-y-3">
        {demoOrders.map((order) => (
          <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">{order.id}</p>
              <p className="text-sm text-slate-500">{order.customer}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-base font-semibold text-slate-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
