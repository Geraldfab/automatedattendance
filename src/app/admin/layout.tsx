import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect(user.role === "FACULTY" ? "/faculty" : "/student");
  }

  return (
    <DashboardShell role="ADMIN" user={user}>
      {children}
    </DashboardShell>
  );
}
