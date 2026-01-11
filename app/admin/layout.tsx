import { NavLink } from "@/components/nav-link";
import { Separator } from "@/components/ui/separator";
import { Home, Users, Briefcase, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <nav className="flex flex-col space-y-2">
          <NavLink href="/admin/dashboard" icon={<Home className="h-4 w-4" />} text="Dashboard" />
          <NavLink href="/admin/users" icon={<Users className="h-4 w-4" />} text="Users" />
          <NavLink href="/admin/vendors" icon={<Briefcase className="h-4 w-4" />} text="Vendors" />
          <Separator />
          <NavLink href="/admin/settings" icon={<Settings className="h-4 w-4" />} text="Settings" />
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}