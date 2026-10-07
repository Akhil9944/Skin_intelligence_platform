"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Moon, 
  Droplets, 
  Smile, 
  RefreshCw, 
  Calendar, 
  Award, 
  Flame, 
  Shield, 
  PlusCircle 
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface HabitImpact {
  name: string;
  value: string;
  impact: string;
  status: string;
  simple_note: string;
}

interface HistoryPoint {
  date: string;
  score: number;
  sleep: number;
  water: number;
  stress: number;
}

interface Milestone {
  title: string;
  desc: string;
  earned: boolean;
  icon: string;
}

interface ProgressData {
  current_score: number;
  previous_score: number;
  score_change: number;
  trend_label: string;
  trend_status: string;
  projected_score_7d: number;
  logging_streak: number;
  total_logs: number;
  ai_coach_note: string;
  habit_impacts: HabitImpact[];
  history_points: HistoryPoint[];
  milestones: Milestone[];
}

export default function ProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${getApiBase()}/analytics/detailed-progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not load progress data.");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load progress. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-xs mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AI & ML Progress Tracker</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your Skin Progress & Results
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Track your skin health score over time, see how your daily habits help, and review next week's AI forecast.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/tracker")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Today's Habits</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Loading your skin progress and AI insights...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm mb-6">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchProgress}
              className="mt-3 px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* 1. Current Skin Health Score */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Skin Score
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {data.trend_label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    {data.current_score}
                  </span>
                  <span className="text-slate-400 text-base font-bold">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  Calculated by Machine Learning from your sleep, water, and stress logs.
                </p>
              </div>

              {/* 2. Score Change */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent Change
                  </span>
                  <span className={`flex items-center gap-0.5 text-xs font-black ${
                    data.score_change > 0 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : data.score_change < 0 
                      ? "text-rose-600 dark:text-rose-400" 
                      : "text-slate-500"
                  }`}>
                    {data.score_change > 0 ? (
                      <><ArrowUpRight className="w-4 h-4" /> Improved</>
                    ) : data.score_change < 0 ? (
                      <><ArrowDownRight className="w-4 h-4" /> Dropped</>
                    ) : (
                      <><Minus className="w-4 h-4" /> Steady</>
                    )}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-4xl sm:text-5xl font-black ${
                    data.score_change > 0 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : data.score_change < 0 
                      ? "text-rose-600 dark:text-rose-400" 
                      : "text-slate-800 dark:text-slate-200"
                  }`}>
                    {data.score_change > 0 ? `+${data.score_change}` : data.score_change}
                  </span>
                  <span className="text-slate-400 text-base font-bold">Points</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {data.score_change > 0 
                    ? "Your skin is getting healthier thanks to your consistent routine!"
                    : data.score_change < 0 
                    ? "A small dip from stress or less sleep. Easy to bounce back!"
                    : "Your skin barrier is in a balanced, steady maintenance phase."}
                </p>
              </div>

              {/* 3. 7-Day ML Forecast */}
              <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Next Week Forecast
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    ML Target
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-indigo-700 dark:text-indigo-400">
                    {data.projected_score_7d}
                  </span>
                  <span className="text-indigo-400 text-base font-bold">/ 100</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  Predicted by Machine Learning if you maintain your good daily hydration and sleep.
                </p>
              </div>
            </div>

            {/* AI Skin Coach Note Card */}
            <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-600 text-white p-6 sm:p-7 shadow-lg shadow-indigo-600/15 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200">
                  AI Skin Coach Note
                </h3>
                <p className="text-base font-medium mt-1 leading-relaxed text-indigo-50">
                  "{data.ai_coach_note}"
                </p>
              </div>
            </div>

            {/* How Your Habits Helped Your Skin */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>How Your Habits Help Your Skin</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.habit_impacts.map((habit, idx) => {
                  const isSleep = habit.name.includes("Sleep");
                  const isWater = habit.name.includes("Water");
                  return (
                    <div
                      key={idx}
                      className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {isSleep ? (
                              <Moon className="w-5 h-5 text-indigo-500" />
                            ) : isWater ? (
                              <Droplets className="w-5 h-5 text-cyan-500" />
                            ) : (
                              <Smile className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            habit.impact.startsWith("+")
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                              : habit.impact.startsWith("-")
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {habit.impact}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {habit.name}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {habit.value}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                          {habit.simple_note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score History Timeline */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Score History Over Time
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your calculated skin health score across recent logged days.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{data.total_logs} Days Recorded</span>
                </div>
              </div>

              {data.history_points.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No daily logs recorded yet.</p>
                  <button
                    onClick={() => router.push("/dashboard/tracker")}
                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Log your first day in Daily Tracker &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.history_points.map((pt, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 min-w-[75px]">
                          {pt.date}
                        </span>
                        {/* Progress Bar representation */}
                        <div className="w-32 sm:w-48 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(10, pt.score))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {pt.score}/100
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" /> {pt.sleep}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-500" /> {pt.water} glasses
                        </span>
                        <span className="flex items-center gap-1">
                          <Smile className="w-3 h-3 text-amber-500" /> {pt.stress}/10 stress
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones & Badges */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Habit Milestones & Achievements</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-5 flex items-start gap-3 transition-all ${
                      m.earned
                        ? "border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20"
                        : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 opacity-60"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      m.earned
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {m.icon === "sparkles" ? (
                        <Sparkles className="w-5 h-5" />
                      ) : m.icon === "flame" ? (
                        <Flame className="w-5 h-5" />
                      ) : m.icon === "droplet" ? (
                        <Droplets className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {m.title}
                        </h4>
                        {m.earned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
