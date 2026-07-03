import { DashboardMobileBar } from "@/components/dashboard/DashboardMobileBar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-surface">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileBar />
        {children}
      </div>
    </div>
  );
}
