"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle, Droplets, Moon, Award } from "lucide-react";

interface AdherenceData {
  user_id: number;
  adherence_percentage: number;
  streak_days: number;
  hydration_score_avg: number;
  sleep_score_avg: number;
  status_message: string;
}

interface ProgressData {
  user_id: number;
  current_score: number;
  previous_score: number;
  score_delta: number;
  trend_direction: string;
}

export default function AnalyticsDashboard() {
  const [adherence, setAdherence] = useState<AdherenceData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User session not found. Please log in.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [adhRes, progRes] = await Promise.all([
          fetch("http://localhost:8001/analytics/adherence", { headers }),
          fetch("http://localhost:8001/analytics/progress", { headers })
        ]);

        if (adhRes.ok && progRes.ok) {
          setAdherence(await adhRes.json());
          setProgress(await progRes.json());
        } else {
          setError("Failed to load analytics telemetry.");
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
        setError("Cannot connect to backend server on port 8001.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-10 text-slate-500 dark:text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-semibold">Loading clinical analytics telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const isImproving = progress?.trend_direction === "Improving";
  const isDeclining = progress?.trend_direction === "Declining";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Routine Adherence Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Routine Adherence</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{adherence?.status_message ?? "Consistency Analysis"}</p>
            </div>
          </div>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {adherence?.adherence_percentage ?? 0}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 border-t border-slate-200/70 dark:border-slate-800/80 pt-4 mt-2">
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/70 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Streak</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{adherence?.streak_days ?? 0} Days</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/70 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3 text-sky-500" /> Avg Water
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{adherence?.hydration_score_avg ?? 0} gls</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/70 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Moon className="w-3 h-3 text-indigo-500" /> Avg Sleep
            </span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{adherence?.sleep_score_avg ?? 0} hrs</span>
          </div>
        </div>
      </div>

      {/* Skin Progress Delta Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-7 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Progress Trajectory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Delta vs. prior session</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full border ${
            isImproving
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : isDeclining
              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
          }`}>
            {isImproving ? <TrendingUp className="w-3.5 h-3.5" /> : isDeclining ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {progress ? (progress.score_delta > 0 ? `+${progress.score_delta}` : `${progress.score_delta}`) : 0} pts ({progress?.trend_direction ?? "Stable"})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-200/70 dark:border-slate-800/80 pt-4 mt-2">
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/70 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Health Index</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{progress?.current_score ?? 0}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/70 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Prior Health Index</span>
            <span className="text-lg font-black text-slate-600 dark:text-slate-300">{progress?.previous_score ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}