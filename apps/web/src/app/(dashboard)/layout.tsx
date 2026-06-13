import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Sidebar />
      <TopNav />
      <main className="md:ml-64 pt-16 p-4 md:p-6">{children}</main>
      <MobileNav />
    </div>
  );
}
