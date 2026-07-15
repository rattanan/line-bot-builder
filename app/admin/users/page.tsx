import Header from "../../components/Header";
import { requireAdminUser } from "@/lib/auth";
import { getAdminUsers } from "@/lib/admin";
import { redirect } from "next/navigation";
import UsersManager from "./users-manager";
import LocalizedText from "@/app/components/LocalizedText";

export default async function AdminUsersPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/login?next=/admin/users");

  const users = await getAdminUsers();

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="app-card p-8">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500"><LocalizedText english="Admin portal" thai="ระบบผู้ดูแล" /></span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight"><LocalizedText english="User management" thai="จัดการผู้ใช้" /></h1>
          <p className="mt-3 text-sm text-zinc-600"><LocalizedText english="Edit user details and permissions, remove accounts, and review individual billing history." thai="แก้ไขข้อมูลและสิทธิ์ผู้ใช้ ลบบัญชี และตรวจสอบประวัติการเติมเครดิตรายคน" /></p>
          <UsersManager initialUsers={users} adminId={admin.id} />
        </section>
      </main>
    </div>
  );
}
