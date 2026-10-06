"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  PlusCircle, 
  ArrowUpRight, 
  ClipboardCheck, 
  UserCheck, 
  History as HistoryIcon, 
  Activity, 
  Moon, 
  Droplets, 
  Sun, 
  Stethoscope, 
  Cpu, 
  ShoppingBag, 
  TrendingUp, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Layers,
  FileText
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface UserProfile {
  skin_type: string;
  primary_concern: string;
  is_sensitive: boolean;
}

interface DashboardTelemetry {
  current_score: number;
  score_change: number;
  trend_label: string;
  projected_score_7d: number;
  adherence_percentage: number;
  ai_coach_note: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [telemetry, setTelemetry] = useState<DashboardTelemetry>({
    current_score: 75.0,
    score_change: 0.0,
    trend_label: "Stable",
    projected_score_7d: 78.0,
    adherence_percentage: 85,
    ai_coach_note: "Welcome back! Your skin barrier is in a healthy, steady condition today."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);

    async function loadDashboardData() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Profile, Detailed Progress, and Adherence in parallel
        const [profRes, progRes, adhRes] = await Promise.allSettled([
          fetch("http://localhost:8001/profile", { headers }),
          fetch("http://localhost:8001/analytics/detailed-progress", { headers }),
          fetch("http://localhost:8001/analytics/adherence", { headers })
        ]);

        if (profRes.status === "fulfilled" && profRes.value.ok) {
          const profJson = await profRes.value.json();
          setProfile(profJson);
        }

        let score = 75.0;
        let delta = 0.0;
        let trend = "Stable";
        let projected = 78.0;
        let coachNote = "Welcome back! Your skin barrier is in a healthy, steady condition today.";
        let adherence = 85;

        if (progRes.status === "fulfilled" && progRes.value.ok) {
          const progJson = await progRes.value.json();
          score = progJson.current_score || 75.0;
          delta = progJson.score_change || 0.0;
          trend = progJson.trend_label || "Stable";
          projected = progJson.projected_score_7d || 78.0;
          if (progJson.ai_coach_note) {
            coachNote = progJson.ai_coach_note;
          }
        }

        if (adhRes.status === "fulfilled" && adhRes.value.ok) {
          const adhJson = await adhRes.value.json();
          adherence = adhJson.adherence_percentage || 85;
        }

        setTelemetry({
          current_score: score,
          score_change: delta,
          trend_label: trend,
          projected_score_7d: projected,
          adherence_percentage: adherence,
          ai_coach_note: coachNote
        });
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
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

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        {/* 1. WELCOME HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified AI Skincare Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your Skin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              All your AI skin scores, daily tools, and progress tracking in one place.
            </p>

            {/* Active Skin Profile Tags */}
            {profile && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
                  {profile.skin_type} Skin
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
                  {profile.primary_concern}
                </span>
                {profile.is_sensitive ? (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800/60">
                    Sensitive Skin
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
                    Normal Barrier
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/dashboard/tracker")}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Log Today's Habits
            </button>
            <button
              onClick={() => router.push("/dashboard/ingredients")}
              className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-indigo-500" /> Scan Product Label
            </button>
            <button
              onClick={() => router.push("/dashboard/executive")}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400 dark:text-indigo-600" /> Executive View
            </button>
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="flex items-center gap-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-4 py-3 text-xs font-bold shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Clinical Report
            </button>
          </div>
        </div>

        {/* 2. UNIFIED AI HEALTH SUMMARY BANNER */}
        <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 p-6 sm:p-8 shadow-sm mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Stat 1: Skin Health Score */}
            <div className="border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skin Health Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  {telemetry.current_score}
                </span>
                <span className="text-slate-400 text-sm font-bold">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Calculated by Machine Learning from your sleep, water, and stress.
              </p>
            </div>

            {/* Stat 2: Routine Consistency */}
            <div className="border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Routine Consistency
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                  {telemetry.adherence_percentage}%
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Healthy
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                How consistently you follow your morning & evening skincare steps.
              </p>
            </div>

            {/* Stat 3: Recent Change & Next Target */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Score Trend
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-4xl sm:text-5xl font-black ${
                  telemetry.score_change >= 0 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                  {telemetry.score_change >= 0 ? `+${telemetry.score_change}` : telemetry.score_change}
                </span>
                <span className="text-slate-400 text-sm font-bold">Pts</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Next week's ML forecast target: <strong className="text-indigo-600 dark:text-indigo-400">{telemetry.projected_score_7d} / 100</strong>
              </p>
            </div>
          </div>

          {/* AI Coach Greeting Banner */}
          <div className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center gap-3 shadow-md shadow-indigo-600/15">
            <Sparkles className="w-5 h-5 shrink-0 text-amber-300" />
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              "{telemetry.ai_coach_note}"
            </p>
          </div>
        </div>

        {/* 3. ORGANIZED SIMPLE FEATURE HUBS */}
        <div className="space-y-12">

          {/* HUB 1: DAILY SKINCARE ESSENTIALS */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Daily Skincare Essentials
                </h2>
                <p className="text-xs text-slate-500">
                  Your daily morning & night routine, product matching, and habit logging.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Routine & Score */}
              <div
                onClick={() => router.push("/dashboard/routine")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Routine & Steps</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Review your personalized AM/PM skincare steps tailored to your skin type.
                </p>
              </div>

              {/* Product Matcher */}
              <div
                onClick={() => router.push("/dashboard/products")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Find <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Product Matcher</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Find gentle, tested skincare products scored with a % match for your skin.
                </p>
              </div>

              {/* Daily Habit Tracker */}
              <div
                onClick={() => router.push("/dashboard/tracker")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Log <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Habit Tracker</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Log your daily sleep hours, water intake, stress, and sun exposure.
                </p>
              </div>
            </div>
          </div>

          {/* HUB 2: PROGRESS & FUTURE PROJECTIONS */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Progress & Future Projections
              </h2>
              <p className="text-xs text-slate-500">
                Track how your skin improves over time, test what-if habit changes, and read doctor advice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Progress & Results */}
              <div
                onClick={() => router.push("/dashboard/progress")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    View <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Progress & Results</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  See how your skin score changed, review habit impacts, and earn milestones.
                </p>
              </div>

              {/* Analytics & Simulator */}
              <div
                onClick={() => router.push("/dashboard/analytics")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Simulate <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI What-If Simulator</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Move sliders for sleep and water to see how your skin score changes instantly.
                </p>
              </div>

              {/* Dermatologist Advisory */}
              <div
                onClick={() => router.push("/dashboard/recommendations")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Read <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Advice & Tips</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Receive practical lifestyle precautions and tips to keep your skin calm.
                </p>
              </div>

              {/* Clinical Report & 5-Point Visualizer Card */}
              <div
                onClick={() => router.push("/dashboard/reports")}
                className="group cursor-pointer rounded-3xl border border-indigo-200/90 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all md:col-span-3 mt-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white group-hover:scale-110 transition-all shadow-md shadow-indigo-600/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Printable Clinical Skin Health Report</h3>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">New</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Download or print an official clinical skin health report featuring our interactive 5-Point Skin Balance Visualizer and AI doctor sign-off.
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform self-start sm:self-center shrink-0">
                    Open Report <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HUB 3: DIAGNOSTICS & SETTINGS */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Diagnostics & Settings
              </h2>
              <p className="text-xs text-slate-500">
                Check bottle ingredients, calibrate your skin profile, and inspect past logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Ingredient Scanner */}
              <div
                onClick={() => router.push("/dashboard/ingredients")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Scan <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Ingredient Scanner</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Paste bottle labels to detect harsh chemicals, active clashes, and pore-clogging oils.
                </p>
              </div>

              {/* Skin Profile Calibration */}
              <div
                onClick={() => router.push("/dashboard/profile")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Edit <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Skin Profile Settings</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Update your skin type (Oily, Dry, Combination, Normal) and primary concerns.
                </p>
              </div>

              {/* History Timeline */}
              <div
                onClick={() => router.push("/dashboard/history")}
                className="group cursor-pointer rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500/60 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <HistoryIcon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                    History <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Logged History</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Look back at previous days you logged, sleep hours, and water intake.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
