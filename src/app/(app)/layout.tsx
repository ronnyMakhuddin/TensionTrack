"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen,
  BrainCircuit,
  LayoutDashboard,
  LineChart,
  Utensils,
  Activity,
  Bike,
  ScrollText,
  Wind,
  BellRing,
  Video,
  Loader2,
  LogOut,
  Bed,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const menuItems = [
    { href: "/", label: "Dasbor", icon: LayoutDashboard },
    { href: "/trends", label: "Tren", icon: LineChart },
    { href: "/diet", label: "Catatan Diet", icon: Utensils },
    { href: "/recipes", label: "Resep Sehat", icon: ScrollText },
    { href: "/activity", label: "Aktivitas", icon: Activity },
    { href: "/sleep", label: "Tidur", icon: Bed },
    { href: "/exercises", label: "Latihan", icon: Bike },
    { href: "/relaxation", label: "Relaksasi", icon: Wind },
    { href: "/reminders", label: "Pengingat", icon: BellRing },
    { href: "/consultation", label: "Konsultasi", icon: Video },
    { href: "/advice", label: "Saran AI", icon: BrainCircuit },
    { href: "/education", label: "Edukasi", icon: BookOpen },
  ];

  const currentPage = menuItems.find((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  });
  
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Icons.Logo className="size-6 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">
                TensionTrack
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPage?.href === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={{ children: "Keluar" }}
                >
                  <LogOut className="size-4" />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-lg font-semibold">
              {currentPage?.label || "Dasbor"}
            </h2>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
