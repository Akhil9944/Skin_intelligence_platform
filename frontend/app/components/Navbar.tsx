"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutDashboard, Activity, UserCheck, History as HistoryIcon, LogOut, ClipboardCheck, Sun, Moon, Stethoscope, Cpu, ShoppingBag, TrendingUp, BarChart3, Layers, FileText } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Executive", href: "/dashboard/executive", icon: Layers },
    { label: "Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Routine & Score", href: "/dashboard/routine", icon: ClipboardCheck },
    { label: "Products", href: "/dashboard/products", icon: ShoppingBag },
    { label: "Progress", href: "/dashboard/progress", icon: TrendingUp },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Ingredients", href: "/dashboard/ingredients", icon: Cpu },
    { label: "Advisory", href: "/dashboard/recommendations", icon: Stethoscope },
    { label: "Tracker", href: "/dashboard/tracker", icon: Activity },
    { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
    { label: "History", href: "/dashboard/history", icon: HistoryIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-4 py-3 sm:px-8 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Skin Intelligence
            </span>
            <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Clinical Platform
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs shadow-slate-900/5"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
