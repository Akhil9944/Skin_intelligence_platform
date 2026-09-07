"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sun, Moon, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface RoutineStep {
  step?: string;
  product: string;
  purpose: string;
  frequency?: string;
  treatment?: string;
  benefit?: string;
}

interface RoutineData {
  skin_type: string;
  primary_concern: string;
  is_sensitive: boolean;
  morning_routine: RoutineStep[];
  evening_routine: RoutineStep[];
  weekly_treatment: RoutineStep[];
}

export default function RoutineAssessmentPage() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState<{ skin_health_score: number; status: string } | null>(null);
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [scoreRes, routineRes] = await Promise.all([
          fetch("http://localhost:8001/assessment/score", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8001/routine/generate", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (scoreRes.ok && routineRes.ok) {
          const scoreJson = await scoreRes.json();
          const routineJson = await routineRes.json();
          setScoreData(scoreJson);
          setRoutine(routineJson);
        } else {
          const errData = await routineRes.json();
          setError(errData.detail || "Please configure your Skin Profile first.");
        }
      } catch (err) {
        setError("Cannot connect to server. Ensure backend is running on port 8001.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" /> Milestone 2 Clinical Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Skin Health & Routine Planner
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Weighted regression scoring combined with personalized dermatological recommendations.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-8 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">{error}</p>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Configure Skin Profile Now
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 p-24 text-slate-500">
            <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Synthesizing Clinical AI Regimen...</span>
          </div>
        ) : scoreData && routine ? (
          <div className="space-y-10">
            {/* Score Hero Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Quantitative Health Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Skin Barrier Health Index
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                  Evaluated using Random Forest regression based on your daily sleep cycles, water glasses, stress index, and UV radiation exposure.
                </p>
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Type: {routine.skin_type}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Concern: {routine.primary_concern}
                  </span>
                  {routine.is_sensitive && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
                      Sensitive Barrier
                    </span>
                  )}
                </div>
              </div>

              {/* Circular Gauge Score Container */}
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 min-w-[220px] shadow-inner">
                <div className="relative flex items-center justify-center">
                  <span className="text-6xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                    {scoreData.skin_health_score}
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">/ 100 Clinical Points</span>
                <span className={`mt-3 text-xs font-extrabold px-3 py-1 rounded-full ${
                  scoreData.skin_health_score >= 80
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                }`}>
                  {scoreData.status} Condition
                </span>
              </div>
            </div>

            {/* Routines Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Morning Routine */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Morning Regimen</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pollution shielding, antioxidant protection & UV barrier</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {routine.morning_routine.map((item, index) => (
                    <div key={index} className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-950/70 space-y-1 transition-all hover:border-indigo-400 dark:hover:border-indigo-600">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{item.step}</span>
                        <span className="text-[11px] font-semibold text-slate-400">Step {index + 1}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.product}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Evening Regimen</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active cellular repair, renewal & barrier moisture lock</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {routine.evening_routine.map((item, index) => (
                    <div key={index} className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-950/70 space-y-1 transition-all hover:border-indigo-400 dark:hover:border-indigo-600">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{item.step}</span>
                        <span className="text-[11px] font-semibold text-slate-400">Step {index + 1}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.product}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Treatment Schedule */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Targeted Treatments</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chemical exfoliation and deep conditioning masks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routine.weekly_treatment.map((item, index) => (
                  <div key={index} className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-950/70 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                      {item.frequency}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm pt-1">{item.treatment}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
