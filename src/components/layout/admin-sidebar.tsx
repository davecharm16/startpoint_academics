"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FileText },
  { href: "/admin/writers", label: "Writers", icon: Users },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  userName: string;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 border-b">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-bold text-lg">Startpoint</h1>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t p-4 space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-background border-r">
        <NavContent />
      </aside>
    </>
  );
}
