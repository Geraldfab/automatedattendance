import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "FACULTY" && user.role !== "ADMIN") {
    redirect("/student");
  }

  return (
    <DashboardShell role="FACULTY" user={user}>
      {children}
    </DashboardShell>
  );
}
