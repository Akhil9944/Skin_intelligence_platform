"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Sun,
  Moon,
  Calendar,
  RefreshCw,
  AlertCircle,
  Snowflake,
  CloudRain,
  Flower2,
  ThermometerSun,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  Layers,
  ShieldAlert,
  Cpu,
  Zap
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface RoutineStep {
  step?: string;
  product: string;
  purpose: string;
  frequency?: string;
  treatment?: string;
  benefit?: string;
}

interface SeasonalGuide {
  season: string;
  focus: string;
  key_measures: string[];
  ingredient_guide: {
    prioritize: string[];
    avoid: string[];
  };
}

interface TriageConcern {
  name: string;
  tier: number;
  priority_label: string;
  is_harmful: boolean;
  clinical_rationale: string;
  recommended_actives: string[];
  restricted_actives: string[];
  ml_urgency_score?: number;
  ml_engine_type?: string;
  telemetry_driver?: string;
}

interface ConcernTriage {
  prioritized_list: TriageConcern[];
  primary_target: TriageConcern;
  secondary_targets: TriageConcern[];
  has_harmful_concern: boolean;
  ml_engine_type?: string;
  telemetry_context?: {
    stress_level: number;
    sleep_hours: number;
    water_glasses: number;
    sun_exposure_hours: number;
  };
}

interface RoutineData {
  skin_type: string;
  primary_concern: string;
  is_sensitive: boolean;
  morning_routine: RoutineStep[];
  evening_routine: RoutineStep[];
  weekly_treatment: RoutineStep[];
  seasonal_recommendations?: {
    summer: SeasonalGuide;
    winter: SeasonalGuide;
    monsoon: SeasonalGuide;
    spring_autumn: SeasonalGuide;
  };
  concern_triage?: ConcernTriage;
}

type SeasonKey = "summer" | "winter" | "monsoon" | "spring_autumn";

export default function RoutineAssessmentPage() {
  const router = useRouter();
  const [scoreData, setScoreData] = useState<{ skin_health_score: number; status: string } | null>(null);
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [activeSeason, setActiveSeason] = useState<SeasonKey>("summer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const month = new Date().getMonth();
    if (month === 11 || month === 0 || month === 1) setActiveSeason("winter");
    else if (month >= 2 && month <= 4) setActiveSeason("summer");
    else if (month >= 5 && month <= 8) setActiveSeason("monsoon");
    else setActiveSeason("spring_autumn");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [scoreRes, routineRes] = await Promise.all([
          fetch(`${getApiBase()}/assessment/score`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${getApiBase()}/routine/generate`, {
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
            <ShieldCheck className="w-4 h-4" />Clinical Intelligence
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
            <span className="text-sm font-semibold">Synthesizing Clinical AI Routine...</span>
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
                  {routine.concern_triage && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      routine.concern_triage.primary_target.tier === 1
                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                        : "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      ML Priority: {routine.concern_triage.primary_target.name} {routine.concern_triage.primary_target.ml_urgency_score ? `(${routine.concern_triage.primary_target.ml_urgency_score}%)` : ""}
                    </span>
                  )}
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

            {/* Clinical Concern Prioritization & Hierarchy Card */}
            {routine.concern_triage && (
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      routine.concern_triage.primary_target.tier === 1
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                        : routine.concern_triage.primary_target.tier === 2
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Clinical Concern Prioritization & Hierarchy
                        </h3>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          routine.concern_triage.has_harmful_concern
                            ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        }`}>
                          {routine.concern_triage.has_harmful_concern ? "Acute Barrier Alert" : "Non-Acute / Balanced"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Random Forest ML Regressor (concern_priority_model.pkl) quantifies clinical urgency; Gemini AI schedules targeted actives.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Hybrid ML + AI Stratification</span>
                  </div>
                </div>

                {/* Triage Grid: Primary Target vs Secondary Concerns */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Primary Target Card */}
                  <div className="lg:col-span-2 rounded-2xl p-5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">
                          Priority #1 Target
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {routine.concern_triage.primary_target.name}
                        </h4>
                        {routine.concern_triage.primary_target.ml_urgency_score !== undefined && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 shadow-xs">
                            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                            {routine.concern_triage.primary_target.ml_urgency_score}% ML Urgency
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        routine.concern_triage.primary_target.tier === 1
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                          : routine.concern_triage.primary_target.tier === 2
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                      }`}>
                        {routine.concern_triage.primary_target.priority_label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white font-semibold">Clinical Rationale: </strong>
                      {routine.concern_triage.primary_target.clinical_rationale}
                    </p>

                    {routine.concern_triage.primary_target.telemetry_driver && (
                      <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-indigo-900 dark:text-indigo-300">ML Telemetry Attribution: </strong>
                          {routine.concern_triage.primary_target.telemetry_driver}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1.5">
                          Prescribed Actives
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {routine.concern_triage.primary_target.recommended_actives.map((act, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1.5">
                          Restricted / Contraindicated
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {routine.concern_triage.primary_target.restricted_actives.map((act, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Targets or Next Phase */}
                  <div className="rounded-2xl p-5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                        Secondary Concerns (Phase 2)
                      </span>
                      {routine.concern_triage.secondary_targets && routine.concern_triage.secondary_targets.length > 0 ? (
                        <div className="space-y-2.5">
                          {routine.concern_triage.secondary_targets.map((sec, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{sec.name}</span>
                                <div className="flex items-center gap-1.5">
                                  {sec.ml_urgency_score !== undefined && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                      {sec.ml_urgency_score}% ML
                                    </span>
                                  )}
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Tier {sec.tier}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {sec.clinical_rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
                          Single focus profile. Full protocol concentrated on {routine.concern_triage.primary_target.name}.
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed italic">
                      * Actives for secondary concerns are safely sequenced to prevent barrier irritation and ingredient clash.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Routines Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Morning Routine */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Morning Routine</h3>
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
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Evening Routine</h3>
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

            {/* Seasonal Clinical Adaptation & Environmental Measures */}
            {routine.seasonal_recommendations && (
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                      <ThermometerSun className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Seasonal Clinical Adaptation</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          Climate Protocol
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Targeted barrier defense adjustments across changing weather patterns</p>
                    </div>
                  </div>

                  {/* Season Switcher Tabs */}
                  <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-x-auto gap-1">
                    {([
                      { id: "summer", label: "Summer", icon: Sun, color: "text-amber-500" },
                      { id: "winter", label: "Winter", icon: Snowflake, color: "text-sky-500" },
                      { id: "monsoon", label: "Monsoon", icon: CloudRain, color: "text-emerald-500" },
                      { id: "spring_autumn", label: "Spring / Autumn", icon: Flower2, color: "text-rose-500" },
                    ] as const).map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeSeason === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveSeason(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {routine.seasonal_recommendations[activeSeason] && (
                  <div className="space-y-6 pt-2">
                    {/* Environmental Focus Banner */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3">
                      <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          {routine.seasonal_recommendations[activeSeason].season} — Clinical Focus
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                          {routine.seasonal_recommendations[activeSeason].focus}
                        </p>
                      </div>
                    </div>

                    {/* 2-Column Grid: Key Measures on Left, Ingredients on Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Key Measures */}
                      <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Essential Seasonal Measures & Protocol
                        </h4>
                        <div className="space-y-2.5">
                          {routine.seasonal_recommendations[activeSeason].key_measures.map((measure, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-black text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                {measure}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ingredient Guide Box */}
                      <div className="space-y-4">
                        {/* Ingredients to Prioritize */}
                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2.5">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Ingredients to Prioritize
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {routine.seasonal_recommendations[activeSeason].ingredient_guide.prioritize.map((ing, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Ingredients to Avoid / Minimize */}
                        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 space-y-2.5">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            Avoid or Minimize
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {routine.seasonal_recommendations[activeSeason].ingredient_guide.avoid.map((ing, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-2xs"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
