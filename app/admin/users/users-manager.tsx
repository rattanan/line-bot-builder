"use client";

import Link from "next/link";
import { useState } from "react";
import AppIcon from "@/app/components/AppIcon";
import { useLanguage } from "@/app/components/LanguageProvider";

export type AdminUserRow = {
  id: number;
  email: string;
  full_name: string;
  role: "USER" | "ADMIN";
  email_verified_at: string | null;
  bot_count: number;
  total_credit: number;
  created_at: string;
};

type EditState = {
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  creditBalance: string;
  creditReason: string;
};

export default function UsersManager({ initialUsers, adminId }: { initialUsers: AdminUserRow[]; adminId: number }) {
  const { language, text } = useLanguage();
  const locale = language === "th" ? "th-TH" : "en-US";
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<EditState>({
    email: "",
    fullName: "",
    role: "USER",
    creditBalance: "0",
    creditReason: "",
  });
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filteredUsers = users.filter((user) => `${user.full_name} ${user.email} ${user.role}`.toLowerCase().includes(query.trim().toLowerCase()));

  function beginEdit(user: AdminUserRow) {
    setEditingId(user.id);
    setEdit({
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      creditBalance: String(user.total_credit),
      creditReason: text("Admin credit adjustment", "ปรับเครดิตโดยผู้ดูแล"),
    });
    setError(null);
  }

  async function saveUser(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || text("Unable to update user", "ไม่สามารถอัปเดตผู้ใช้ได้"));
      setUsers((current) => current.map((user) => (
        user.id === id
          ? {
              ...user,
              email: data.user.email,
              full_name: data.user.full_name,
              role: data.user.role,
              total_credit: data.user.credit_balance,
            }
          : user
      )));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : text("Unable to update user", "ไม่สามารถอัปเดตผู้ใช้ได้"));
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(user: AdminUserRow) {
    if (!window.confirm(text(`Delete ${user.email}? This also removes the user's agents and top-up orders.`, `ลบ ${user.email} ใช่ไหม การดำเนินการนี้จะลบเอเจนต์และรายการเติมเครดิตของผู้ใช้ด้วย`))) return;
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || text("Unable to delete user", "ไม่สามารถลบผู้ใช้ได้"));
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : text("Unable to delete user", "ไม่สามารถลบผู้ใช้ได้"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <label className="relative mt-6 block"><span className="sr-only">{text("Search users", "ค้นหาผู้ใช้")}</span><AppIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("Search name, email or role", "ค้นหาชื่อ อีเมล หรือสิทธิ์")} className="w-full py-3 pl-11 pr-4 text-sm" /></label>
      <div className="app-table-static-header mt-6 isolate overflow-x-auto rounded-[1.5rem] border border-slate-200 dark:border-white/10">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.15em] text-slate-500 dark:bg-white/[0.045] dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{text("User", "ผู้ใช้")}</th>
              <th className="px-4 py-3">{text("Role", "สิทธิ์")}</th>
              <th className="px-4 py-3">{text("Verified", "ยืนยันแล้ว")}</th>
              <th className="px-4 py-3">{text("Agents", "เอเจนต์")}</th>
              <th className="px-4 py-3">{text("Credit", "เครดิต")}</th>
              <th className="px-4 py-3">{text("Created", "สร้างเมื่อ")}</th>
              <th className="px-4 py-3 text-right">{text("Actions", "จัดการ")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-white/10 dark:bg-transparent">
            {filteredUsers.map((user) => {
              const isEditing = editingId === user.id;
              const isSelf = user.id === adminId;
              return (
                <tr key={user.id} className="align-top transition hover:bg-blue-50/50 dark:hover:bg-blue-400/[0.05]">
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <div className="grid gap-2">
                        <input
                          aria-label={text("Full name", "ชื่อ-นามสกุล")}
                          className="rounded-xl border border-zinc-200 px-3 py-2"
                          value={edit.fullName}
                          onChange={(event) => setEdit((current) => ({ ...current, fullName: event.target.value }))}
                        />
                        <input
                          aria-label={text("Email", "อีเมล")}
                          type="email"
                          className="rounded-xl border border-zinc-200 px-3 py-2"
                          value={edit.email}
                          onChange={(event) => setEdit((current) => ({ ...current, email: event.target.value }))}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-zinc-900">{user.full_name}</div>
                        <div className="text-zinc-500">{user.email}</div>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <select
                        aria-label={text("Role", "สิทธิ์")}
                        className="rounded-xl border border-zinc-200 px-3 py-2"
                        value={edit.role}
                        disabled={isSelf}
                        onChange={(event) => setEdit((current) => ({ ...current, role: event.target.value as "USER" | "ADMIN" }))}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : user.role}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${user.email_verified_at ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {user.email_verified_at ? text("Verified", "ยืนยันแล้ว") : text("Pending", "รอยืนยัน")}
                    </span>
                  </td>
                  <td className="px-4 py-4">{user.bot_count}</td>
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <div className="grid min-w-44 gap-2">
                        <label className="grid gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {text("New balance", "ยอดเครดิตใหม่")}
                          </span>
                          <input
                            aria-label={text("New credit balance", "ยอดเครดิตใหม่")}
                            type="number"
                            min="0"
                            max="1000000000"
                            step="1"
                            inputMode="numeric"
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 tabular-nums"
                            value={edit.creditBalance}
                            onChange={(event) => setEdit((current) => ({ ...current, creditBalance: event.target.value }))}
                          />
                        </label>
                        <label className="grid gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {text("Reason", "เหตุผล")}
                          </span>
                          <input
                            aria-label={text("Credit adjustment reason", "เหตุผลการปรับเครดิต")}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2"
                            value={edit.creditReason}
                            onChange={(event) => setEdit((current) => ({ ...current, creditReason: event.target.value }))}
                          />
                        </label>
                      </div>
                    ) : (
                      <span className="font-semibold tabular-nums text-blue-700 dark:text-blue-300">
                        {Number(user.total_credit).toLocaleString(locale)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-zinc-500">{new Date(user.created_at).toLocaleDateString(locale)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/users/${user.id}/topups`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">
                        {text("Top-up history", "ประวัติเติมเครดิต")}
                      </Link>
                      {isEditing ? (
                        <>
                          <button disabled={busyId === user.id} onClick={() => saveUser(user.id)} className="app-button-primary min-h-9 px-3 py-1.5 text-xs disabled:opacity-50">{text("Save", "บันทึก")}</button>
                          <button disabled={busyId === user.id} onClick={() => setEditingId(null)} className="app-button-outline min-h-9 px-3 py-1.5 text-xs disabled:opacity-50">{text("Cancel", "ยกเลิก")}</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => beginEdit(user)} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">{text("Edit", "แก้ไข")}</button>
                          <button disabled={isSelf || busyId === user.id} onClick={() => removeUser(user)} className="app-button-danger min-h-9 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">{text("Delete", "ลบ")}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filteredUsers.length && <div className="app-empty-state mt-5 min-h-48"><p className="text-sm text-zinc-500">{text("No users match your search.", "ไม่พบผู้ใช้ที่ตรงกับการค้นหา")}</p></div>}
    </>
  );
}
