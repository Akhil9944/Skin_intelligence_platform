"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, PlusCircle, ArrowUpRight, ClipboardCheck, UserCheck, History as HistoryIcon, Activity, Moon, Droplets, Sun, Stethoscope } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 dark:border-slate-800 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {/* Welcome Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> AI Engine Ready
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Clinical Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Monitor your AI Skin Health Index, review personalized regimens, and record daily lifestyle telemetry.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/tracker")}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer w-fit"
          >
            <PlusCircle className="w-4 h-4" /> Log Daily Habits
          </button>
        </div>

        {/* Quick Health Indicators Bar */}
        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 shadow-xs backdrop-blur-md flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Sleep</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">7.5 - 8.5 hrs</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 shadow-xs backdrop-blur-md flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Hydration Goal</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">8+ Glasses</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 shadow-xs backdrop-blur-md flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">UV Defense</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white">SPF 50 Daily</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 shadow-xs backdrop-blur-md flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">ML Regressor</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Calibrated</span>
            </div>
          </div>
        </div>

        {/* Interactive Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Routine & Score */}
          <div
            onClick={() => router.push("/dashboard/routine")}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Open <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Routine & Score</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Synthesize your skin health score through Random Forest inference and review custom AM/PM regimens.
            </p>
          </div>

          {/* Dermatologist Advisory */}
          <div
            onClick={() => router.push("/dashboard/recommendations")}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Consult <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dermatologist Advisory</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Receive expert clinical lifestyle prescriptions, barrier alerts, and dermatologist precautions.
            </p>
          </div>

          {/* Daily Tracker */}
          <div
            onClick={() => router.push("/dashboard/tracker")}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <Activity className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Log <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Habit Telemetry</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Record daily sleep hours, water intake, stress levels, and weather or UV sun exposure.
            </p>
          </div>

          {/* Skin Profile */}
          <div
            onClick={() => router.push("/dashboard/profile")}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Calibrate <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skin Profile Calibration</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Update your baseline skin classification (Oily, Dry, Combination, Normal) and sensitivities.
            </p>
          </div>

          {/* History */}
          <div
            onClick={() => router.push("/dashboard/history")}
            className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-7 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all backdrop-blur-xl relative overflow-hidden md:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                Timeline <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historical Telemetry Timeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Inspect historical records, environmental trends, and chronological adherence patterns across past logged days.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
