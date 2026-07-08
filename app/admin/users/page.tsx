import Header from "../../components/Header";
import { requireAdminUser } from "@/lib/auth";
import { getAdminUsers } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/login?next=/admin/users");

  const users = await getAdminUsers();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)]">
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Bots</th>
                  <th className="px-4 py-3">Credit</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-900">{user.full_name}</div>
                      <div className="text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4">{user.role}</td>
                    <td className="px-4 py-4">{user.bot_count}</td>
                    <td className="px-4 py-4">{user.total_credit}</td>
                    <td className="px-4 py-4 text-zinc-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
