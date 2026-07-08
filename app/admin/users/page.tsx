"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";

type User = {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "staff";
  created_at: string;
  updated_at: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, fullName, password, role }),
    });

    if (res.ok) {
      setUsername("");
      setFullName("");
      setPassword("");
      setRole("staff");
      await loadUsers();
    } else {
      alert("Failed to create user");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadUsers();
    } else {
      alert("Delete failed");
    }
  };

  const handleEdit = async (user: User) => {
    const nextFullName = prompt("Full name", user.full_name) ?? user.full_name;
    const nextPassword = prompt("New password (leave blank to keep current)", "") ?? "";
    const nextRole = prompt("Role (admin/staff)", user.role) ?? user.role;

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: nextFullName,
        password: nextPassword.trim() || undefined,
        role: nextRole === "admin" ? "admin" : "staff",
      }),
    });

    if (res.ok) {
      await loadUsers();
    } else {
      alert("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">User management</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Create login accounts</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              เพิ่มผู้ใช้ที่สามารถเข้าใช้งานระบบได้ และกำหนด role สำหรับ admin หรือ staff
            </p>

            <form onSubmit={handleCreate} className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Username</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Full name</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Password</span>
                <input
                  type="password"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Role</span>
                <select
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "staff")}
                >
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <button className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
                Add User
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 sm:px-8">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Users</h2>
                <p className="text-sm text-zinc-500">{isLoading ? "Loading..." : `${users.length} account(s)`}</p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {users.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-zinc-500 sm:px-8">
                  No users found.
                </div>
              ) : (
                users.map((user) => (
                  <article key={user.id} className="px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{user.full_name}</p>
                          <p className="text-sm text-zinc-500">@{user.username}</p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
