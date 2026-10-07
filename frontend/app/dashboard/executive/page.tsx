"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Layers, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Moon, 
  Droplets, 
  Smile, 
  Sun,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface MLModelInfo {
  model_name: string;
  file_name: string;
  algorithm: string;
  accuracy: string;
  status: string;
  latency: string;
  role: string;
}

interface ExecutiveData {
  kpi_cards: {
    total_patients: number;
    total_logs_recorded: number;
    average_skin_score: number;
    average_improvement: string;
    compliance_rate: string;
  };
  ml_models: MLModelInfo[];
  cohort_distributions: {
    skin_types: { type: string; percentage: number; color: string }[];
    top_concerns: { concern: string; percentage: number }[];
    lifestyle_averages: {
      sleep_hours: string;
      water_glasses: string;
      stress_level: string;
      sun_exposure: string;
    };
  };
  executive_ai_summary: string;
  system_status: string;
}

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExecutiveData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${getApiBase()}/analytics/executive-summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not load executive telemetry.");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load executive summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-xs mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Milestone 4 Executive Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Executive Clinical Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Platform-wide patient health outcomes, Machine Learning operational benchmarks, and cohort trends.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All 4 ML Models Operational</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Loading platform telemetry and model benchmarks...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm mb-6">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchExecutiveData}
              className="mt-3 px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* 1. TOP KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Total Patients */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patients</span>
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {data.kpi_cards.total_patients}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Active Profiles</span>
              </div>

              {/* Average Skin Score */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Skin Score</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {data.kpi_cards.average_skin_score} <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Cohort Baseline</span>
              </div>

              {/* Average Improvement */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">14-Day Growth</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {data.kpi_cards.average_improvement}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Barrier Recovery</span>
              </div>

              {/* Routine Adherence */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Adherence</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {data.kpi_cards.compliance_rate}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">Daily Consistency</span>
              </div>
            </div>

            {/* 2. EXECUTIVE AI CLINICAL SUMMARY */}
            <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 sm:p-7 shadow-lg shadow-indigo-600/15 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Chief Clinical AI Telemetry Summary
                </h3>
                <p className="text-sm sm:text-base font-medium mt-1 leading-relaxed text-indigo-50">
                  "{data.executive_ai_summary}"
                </p>
              </div>
            </div>

            {/* 3. MACHINE LEARNING OPERATIONAL HEALTH MATRIX */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-500" />
                    <span>Machine Learning Operational Benchmarks</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time status, test accuracy, and latency for all 4 trained platform models.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.ml_models.map((model, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {model.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {model.latency}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {model.model_name}
                      </h3>
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {model.file_name} • {model.algorithm}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                        {model.role}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Benchmark Test Accuracy:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{model.accuracy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. COHORT DISTRIBUTIONS & LIFESTYLE TELEMETRY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
              {/* Skin Types Distribution (6 Columns) */}
              <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Cohort Skin Type Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Distribution of baseline skin classifications across active user profiles.
                </p>

                <div className="space-y-4">
                  {data.cohort_distributions.skin_types.map((st, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700 dark:text-slate-300">{st.type}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{st.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${st.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Clinical Concerns (6 Columns) */}
              <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Primary Clinical Concerns
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Most frequent skin pathologies triaged by the Machine Learning engine.
                </p>

                <div className="space-y-4">
                  {data.cohort_distributions.top_concerns.map((tc, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700 dark:text-slate-300">{tc.concern}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{tc.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${tc.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. COHORT LIFESTYLE TELEMETRY AVERAGES */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Cohort Lifestyle Telemetry Averages
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Aggregated daily habit metrics driving skin recovery across the platform.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-500 mb-2">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-bold">Sleep</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {data.cohort_distributions.lifestyle_averages.sleep_hours}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-500 mb-2">
                    <Droplets className="w-4 h-4" />
                    <span className="text-xs font-bold">Hydration</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {data.cohort_distributions.lifestyle_averages.water_glasses}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <Smile className="w-4 h-4" />
                    <span className="text-xs font-bold">Stress</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {data.cohort_distributions.lifestyle_averages.stress_level}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Sun className="w-4 h-4" />
                    <span className="text-xs font-bold">Sun</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {data.cohort_distributions.lifestyle_averages.sun_exposure}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
