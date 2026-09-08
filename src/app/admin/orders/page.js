import { demoOrders } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AdminOrdersPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Orders</p>
          <h1 className="text-3xl font-bold text-slate-900">Order management</h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoOrders.map((order) => (
              <tr key={order.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-800">{order.id}</td>
                <td className="px-4 py-3 text-slate-600">{order.customer}</td>
                <td className="px-4 py-3 text-slate-800">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
