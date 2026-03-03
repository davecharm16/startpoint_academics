"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@startpoint/supabase/client";
import { Button, CopyButton } from "@startpoint/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@startpoint/ui";
import { Sheet, SheetContent, SheetTrigger } from "@startpoint/ui";
import {
  FolderOpen,
  Gift,
  Share2,
  UserCircle,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/client/projects", label: "My Projects", icon: FolderOpen },
  { href: "/client/referrals", label: "Referrals", icon: Gift },
  { href: "/client/social-rewards", label: "Social Rewards", icon: Share2 },
  { href: "/client/profile", label: "Profile", icon: UserCircle },
];

interface ClientNavProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    referral_code?: string;
  };
}

export function ClientNav({ user }: ClientNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/client/projects") {
      return (
        pathname === "/client" ||
        pathname === "/client/projects" ||
        pathname.startsWith("/client/projects/")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-4 mt-4">
              <Link
                href="/client"
                className="flex items-center gap-2 font-semibold text-lg text-primary"
                onClick={() => setIsOpen(false)}
              >
                <FolderOpen className="h-6 w-6" />
                Client Portal
              </Link>

              {/* Referral Code in Mobile Menu */}
              {user.referral_code && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    Referral:
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {user.referral_code}
                  </span>
                  <CopyButton value={user.referral_code} label="Copy referral code" />
                </div>
              )}

              <nav className="flex flex-col gap-2 mt-4">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/client"
          className="flex items-center gap-2 font-semibold text-primary"
        >
          <FolderOpen className="h-5 w-5" />
          <span className="hidden sm:inline">Client Portal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Referral Code + User Menu */}
        <div className="ml-auto flex items-center gap-4">
          {/* Referral Code Badge (desktop) */}
          {user.referral_code && (
            <div className="hidden md:flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1">
              <span className="text-xs text-muted-foreground">Ref:</span>
              <span className="font-mono text-sm font-bold text-primary">
                {user.referral_code}
              </span>
              <CopyButton value={user.referral_code} label="Copy referral code" />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.full_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
