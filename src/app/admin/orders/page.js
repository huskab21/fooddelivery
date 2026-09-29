"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getErrorMessage,
} from "@/app/_api/api";

const PAGE_SIZE = 12;

const STATUSES = ["PENDING", "DELIVERED", "CANCELED"];

const STATUS_META = {
  PENDING: { label: "Pending", className: "border-red-500" },
  DELIVERED: { label: "Delivered", className: "border-green-500" },
  CANCELED: { label: "Cancelled", className: "border-slate-200" },
};

// ---------- Helpers ----------
const formatDate = (iso) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${mm}/${dd}`;
};

// Food schema-ийн талбарын нэр өөр бол энд засна
const foodName = (food) => food?.foodName ?? food?.name ?? "Deleted food";

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ---------- Icons ----------
const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
);
const CalendarIcon = () => (
  <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
);
const ChevronDown = () => <Icon d="m6 9 6 6 6-6" />;
const ChevronsUpDown = () => <Icon d="m7 15 5 5 5-5M7 9l5-5 5 5" className="h-3.5 w-3.5" />;
const ChevronLeft = () => <Icon d="m15 18-6-6 6-6" />;
const ChevronRight = () => <Icon d="m9 18 6-6-6-6" />;
const XIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;

// ---------- Page ----------
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("date"); // "date" | "status"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [openFoodId, setOpenFoodId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // Огноогоор шүүх + эрэмбэлэх
  const visible = useMemo(() => {
    const fromTime = from ? new Date(`${from}T00:00`).getTime() : -Infinity;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
    const dir = sortDir === "asc" ? 1 : -1;

    return orders
      .filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= fromTime && t <= toTime;
      })
      .sort((a, b) =>
        sortKey === "date"
          ? (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
          : (STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status)) * dir
      );
  }, [orders, from, to, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allOnPageSelected =
    pageOrders.length > 0 && pageOrders.every((o) => selected.has(o._id));

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageOrders.forEach((o) => (allOnPageSelected ? next.delete(o._id) : next.add(o._id)));
      return next;
    });

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const closeMenus = () => {
    setOpenFoodId(null);
    setOpenStatusId(null);
  };

  // Нэг захиалгын status солих (optimistic update)
  const updateOne = async (id, status) => {
    setOpenStatusId(null);
    const previous = orders;
    setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
    } catch (err) {
      setOrders(previous);
      alert(getErrorMessage(err));
    }
  };

  // Сонгосон олон захиалгын status солих
  const saveBulk = async () => {
    if (!bulkStatus) return;
    setSaving(true);
    try {
      await bulkUpdateOrderStatus([...selected], bulkStatus);
      setOrders((os) => os.map((o) => (selected.has(o._id) ? { ...o, status: bulkStatus } : o)));
      setSelected(new Set());
      setBulkOpen(false);
      setBulkStatus(null);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const renderEmptyRow = (text) => (
    <tr>
      <td colSpan={8} className="py-16 text-center text-sm text-slate-500">
        {text}
      </td>
    </tr>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="text-xs text-slate-500">{visible.length} items</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm text-slate-700">
            <CalendarIcon />
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="bg-transparent outline-none"
              aria-label="From date"
            />
            <span>-</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="bg-transparent outline-none"
              aria-label="To date"
            />
          </div>

          <button
            disabled={selected.size === 0}
            onClick={() => setBulkOpen(true)}
            className="h-9 rounded-full bg-slate-900 px-4 text-sm font-medium text-white transition-colors disabled:bg-slate-200 disabled:text-slate-400"
          >
            Change delivery state
            {selected.size > 0 && ` (${selected.size})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left text-sm">
        <thead className="border-y border-slate-200 text-slate-500">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-slate-900"
                aria-label="Select all orders on this page"
              />
            </th>
            <th className="w-12 px-2 py-3 font-medium">№</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Food</th>
            <th className="px-4 py-3 font-medium">
              <button onClick={() => toggleSort("date")} className="flex items-center gap-2">
                Date <ChevronsUpDown />
              </button>
            </th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Delivery Address</th>
            <th className="px-4 py-3 font-medium">
              <button onClick={() => toggleSort("status")} className="flex items-center gap-2">
                Delivery state <ChevronsUpDown />
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {loading && renderEmptyRow("Loading orders…")}
          {!loading && error && renderEmptyRow(`Could not load orders: ${error}`)}
          {!loading && !error && pageOrders.length === 0 &&
            renderEmptyRow("No orders in this date range.")}

          {pageOrders.map((order, i) => {
            const isSelected = selected.has(order._id);
            const count = order.foodOrderItems.length;
            const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;

            return (
              <tr
                key={order._id}
                className={`border-b border-slate-200 ${isSelected ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(order._id)}
                    className="h-4 w-4 accent-slate-900"
                    aria-label={`Select order ${i + 1}`}
                  />
                </td>
                <td className="px-2 py-3 text-slate-900">
                  {(currentPage - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-4 py-3 text-slate-600">{order.user?.email ?? "Unknown"}</td>

                {/* Food dropdown */}
                <td className="relative px-4 py-3">
                  <button
                    onClick={() => setOpenFoodId(openFoodId === order._id ? null : order._id)}
                    className="flex items-center gap-6 rounded-full px-2 py-1 text-slate-600 hover:bg-slate-100"
                  >
                    {count} {count === 1 ? "food" : "foods"}
                    <ChevronDown />
                  </button>

                  {openFoodId === order._id && (
                    <div className="absolute left-4 top-full z-20 w-64 space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                      {order.foodOrderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {item.food?.imageUrl ? (
                            <img
                              src={item.food.imageUrl}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-slate-100" />
                          )}
                          <span className="flex-1 truncate text-slate-800">
                            {foodName(item.food)}
                          </span>
                          <span className="text-slate-600">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">${Number(order.totalPrice).toFixed(2)}</td>
                <td className="max-w-[240px] px-4 py-3 text-xs text-slate-500">
                  <p className="line-clamp-2">{order.address}</p>
                </td>

                {/* Status dropdown */}
                <td className="relative px-4 py-3">
                  <button
                    onClick={() => setOpenStatusId(openStatusId === order._id ? null : order._id)}
                    className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold text-slate-900 ${meta.className}`}
                  >
                    {meta.label}
                    <ChevronsUpDown />
                  </button>

                  {openStatusId === order._id && (
                    <div className="absolute left-4 top-full z-20 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateOne(order._id, s)}
                          className={`block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-slate-100 ${
                            s === order.status ? "font-semibold" : ""
                          }`}
                        >
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1 p-4">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>

          {getPageNumbers(currentPage, totalPages).map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-full text-sm ${
                  p === currentPage
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* Dropdown-ийн гадна дарахад хаах */}
      {(openFoodId || openStatusId) && (
        <div className="fixed inset-0 z-10" onClick={closeMenus} />
      )}

      {/* Bulk status modal */}
      {bulkOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setBulkOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Change delivery state</h2>
              <button
                onClick={() => setBulkOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="mb-6 flex gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setBulkStatus(s)}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-medium ${
                    bulkStatus === s
                      ? "bg-red-50 text-red-500 ring-1 ring-red-500"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>

            <button
              onClick={saveBulk}
              disabled={!bulkStatus || saving}
              className="h-10 w-full rounded-full bg-slate-900 text-sm font-medium text-white disabled:bg-slate-300"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}