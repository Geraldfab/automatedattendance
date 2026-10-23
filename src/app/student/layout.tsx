import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "STUDENT" && user.role !== "ADMIN") {
    redirect("/faculty");
  }

  return (
    <DashboardShell role="STUDENT" user={user}>
      {children}
    </DashboardShell>
  );
}
