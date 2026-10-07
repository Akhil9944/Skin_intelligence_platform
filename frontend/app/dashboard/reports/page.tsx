"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Printer,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Droplets,
  Sun,
  HeartPulse,
  Scale,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Award,
  RefreshCw,
  Clock,
  Layers,
  Info
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface RadarPoint {
  id: string;
  pillar: string;
  score: number;
  cohort_avg: number;
  status: string;
  simple_meaning: string;
}

interface RoutineStep {
  step: string;
  product: string;
  why: string;
}

interface RecommendedProduct {
  brand: string;
  name: string;
  category: string;
  match_percentage: number;
  simple_benefit: string;
  ai_reason: string;
}

interface SafetyPrecaution {
  rule: string;
  explanation: string;
}

interface ClinicalReportData {
  report_id: string;
  report_date: string;
  patient: {
    name: string;
    skin_type: string;
    primary_concern: string;
    is_sensitive: boolean;
    consistency_streak: string;
    routine_adherence: string;
  };
  scores: {
    current_score: number;
    projected_7d: number;
    status_label: string;
  };
  lifestyle_telemetry: {
    avg_sleep: string;
    avg_water: string;
    avg_stress: string;
    avg_sun: string;
  };
  radar_points: RadarPoint[];
  morning_routine: RoutineStep[];
  evening_routine: RoutineStep[];
  recommended_products: RecommendedProduct[];
  safety_precautions: SafetyPrecaution[];
  ai_clinical_signoff: {
    assessment_note: string;
    clinical_signee: string;
    verification_status: string;
  };
}

export default function ClinicalReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ClinicalReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchReport() {
      try {
        const res = await fetch(`${getApiBase()}/analytics/clinical-report`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error("Unable to load clinical report data.");
        }
        const json = await res.json();
        setData(json);
        if (json.radar_points && json.radar_points.length > 0) {
          setSelectedPillar(json.radar_points[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  // 5-Point Polygon Radar Mathematics
  const renderRadarPolygon = (points: RadarPoint[], field: "score" | "cohort_avg") => {
    const total = points.length;
    const center = 180;
    const radius = 120;

    return points
      .map((p, i) => {
        const angle = (2 * Math.PI * i) / total - Math.PI / 2;
        const val = p[field];
        const r = (val / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const getPillarIcon = (id: string) => {
    switch (id) {
      case "hydration":
        return Droplets;
      case "barrier":
        return ShieldCheck;
      case "oil_balance":
        return Scale;
      case "sun_defense":
        return Sun;
      case "sensitivity":
        return HeartPulse;
      default:
        return Sparkles;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Generating Your Clinical Skin Health Report...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report Not Available</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">{error || "Could not retrieve report data."}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const activePillarInfo = data.radar_points.find((p) => p.id === selectedPillar) || data.radar_points[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 print:p-0 print:max-w-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Format: Official Clinical Summary
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>
        </div>

        {/* CLINICAL REPORT PAPER CONTAINER */}
        <div className="bg-white dark:bg-slate-900 print:bg-white print:text-black rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-lg print:shadow-none print:border-none print:p-0">
          
          {/* 1. OFFICIAL REPORT HEADER */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 print:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25 print:bg-slate-900">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                      Clinical Skin Health Report
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 print:border-slate-300 print:text-slate-800">
                      Official Record
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5">
                    Personalized Skin Intelligence & Daily Care Prescriptions
                  </p>
                </div>
              </div>

              {/* Report ID & Date Badges */}
              <div className="text-left sm:text-right">
                <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                  {data.report_id}
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{data.report_date}</span>
                </div>
              </div>
            </div>

            {/* Patient Meta Strip */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 print:bg-slate-100 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 print:border-slate-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black mt-0.5">
                  {data.patient.name}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skin Type</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black mt-0.5">
                  {data.patient.skin_type} Skin
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primary Focus</span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 print:text-black mt-0.5">
                  {data.patient.primary_concern}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Barrier Type</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black mt-0.5">
                  {data.patient.is_sensitive ? "Sensitive (Needs Gentle Care)" : "Balanced Barrier"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. CLINICAL SCORE & PROJECTION BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 print:border-slate-300 print:bg-slate-50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Health Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 print:text-black">
                  {data.scores.current_score}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold print:bg-slate-200 print:text-black">
                {data.scores.status_label}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/60 print:border-slate-300 print:bg-slate-50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">7-Day Projected Target</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 print:text-black">
                  {data.scores.projected_7d}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Expected improvement by following prescribed regimen.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-slate-900 border border-purple-100 dark:border-purple-900/60 print:border-slate-300 print:bg-slate-50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Routine Adherence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-purple-600 dark:text-purple-400 print:text-black">
                  {data.patient.routine_adherence}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Streak: {data.patient.consistency_streak}
              </p>
            </div>
          </div>

          {/* 3. 5-POINT SKIN BALANCE VISUALIZER (RADAR CHART) */}
          <div className="mb-10 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-950/40 print:border-slate-300 print:bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black">
                    5-Point Skin Balance Visualizer
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  An interactive balance map comparing your 5 skin pillars against healthy benchmark averages.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600 print:bg-black" />
                  <span>Your Skin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border border-dashed border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 print:border-slate-500" />
                  <span>Healthy Average</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Native SVG Radar Polygon */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                  <svg viewBox="0 0 360 360" className="w-full h-full">
                    {/* Concentric Pentagon Rings (20%, 40%, 60%, 80%, 100%) */}
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, ringIdx) => {
                      const total = 5;
                      const center = 180;
                      const radius = 120 * level;
                      const ringPoints = Array.from({ length: total })
                        .map((_, i) => {
                          const angle = (2 * Math.PI * i) / total - Math.PI / 2;
                          const x = center + radius * Math.cos(angle);
                          const y = center + radius * Math.sin(angle);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(" ");

                      return (
                        <polygon
                          key={ringIdx}
                          points={ringPoints}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-slate-200 dark:text-slate-800 print:text-slate-300"
                        />
                      );
                    })}

                    {/* Radiating Axis Lines */}
                    {data.radar_points.map((p, i) => {
                      const total = 5;
                      const center = 180;
                      const radius = 120;
                      const angle = (2 * Math.PI * i) / total - Math.PI / 2;
                      const x = center + radius * Math.cos(angle);
                      const y = center + radius * Math.sin(angle);

                      return (
                        <line
                          key={p.id}
                          x1={center}
                          y1={center}
                          x2={x}
                          y2={y}
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-slate-200 dark:text-slate-800 print:text-slate-300"
                        />
                      );
                    })}

                    {/* Cohort Benchmark Polygon (Dashed green) */}
                    <polygon
                      points={renderRadarPolygon(data.radar_points, "cohort_avg")}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* User Score Polygon (Translucent Indigo) */}
                    <polygon
                      points={renderRadarPolygon(data.radar_points, "score")}
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                    />

                    {/* User Score Vertex Dots */}
                    {data.radar_points.map((p, i) => {
                      const total = 5;
                      const center = 180;
                      const radius = 120;
                      const angle = (2 * Math.PI * i) / total - Math.PI / 2;
                      const r = (p.score / 100) * radius;
                      const x = center + r * Math.cos(angle);
                      const y = center + r * Math.sin(angle);
                      const isSelected = selectedPillar === p.id;

                      return (
                        <circle
                          key={p.id}
                          cx={x}
                          cy={y}
                          r={isSelected ? "6" : "4.5"}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "fill-indigo-600 stroke-white stroke-2"
                              : "fill-indigo-500 hover:fill-indigo-600"
                          }`}
                          onClick={() => setSelectedPillar(p.id)}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* 5 Pillars Detail Cards */}
              <div className="lg:col-span-6 space-y-2.5">
                {data.radar_points.map((p) => {
                  const Icon = getPillarIcon(p.id);
                  const isSelected = selectedPillar === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPillar(p.id)}
                      className={`cursor-pointer rounded-2xl p-3.5 border transition-all ${
                        isSelected
                          ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-sm"
                          : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      } print:bg-white print:border-slate-200`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white print:text-black">
                              {p.pillar}
                            </span>
                            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 print:text-black">
                              {p.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 print:text-black">
                            {p.score}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Avg: {p.cohort_avg}%)
                          </span>
                        </div>
                      </div>

                      {/* Description visible when selected */}
                      {isSelected && (
                        <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                          {p.simple_meaning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. PRESCRIBED DAILY SKINCARE REGIMEN */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Prescribed AM & PM Daily Regimen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning Routine */}
              <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 p-5 print:border-slate-300 print:bg-white">
                <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400 print:text-black">
                  <Sun className="w-4 h-4" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">Morning Protocol (Protection Focus)</h3>
                </div>

                <div className="space-y-3">
                  {data.morning_routine.map((step, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 print:border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                          {step.step}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white print:text-black mt-0.5">
                        {step.product}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {step.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/10 p-5 print:border-slate-300 print:bg-white">
                <div className="flex items-center gap-2 mb-4 text-indigo-700 dark:text-indigo-400 print:text-black">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">Evening Protocol (Repair Focus)</h3>
                </div>

                <div className="space-y-3">
                  {data.evening_routine.map((step, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 print:border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                          {step.step}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white print:text-black mt-0.5">
                        {step.product}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {step.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. TOP COMPATIBLE PRODUCTS (ML MATCHED) */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                Clinically Matched Products
              </h2>
              <span className="text-xs text-slate-500">TF-IDF Vector Space Matched</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.recommended_products.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 print:border-slate-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      {p.match_percentage}% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white print:text-black line-clamp-1">
                    {p.brand} {p.name}
                  </h4>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 print:text-slate-800 mt-1">
                    {p.simple_benefit}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                    "{p.ai_reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. SAFETY PRECAUTIONS & CLASH GUIDELINES */}
          <div className="mb-10 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 print:border-slate-300 print:bg-white">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-black mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              Essential Safety & Active Ingredient Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.safety_precautions.map((sec, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white print:text-black">
                      {sec.rule}:
                    </span>{" "}
                    <span className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-700">
                      {sec.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. AI DERMATOLOGIST CLINICAL SIGN-OFF */}
          <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 print:border-slate-400 print:bg-slate-50">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 print:bg-slate-900">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white print:text-black">
                    Official AI Dermatologist Clinical Sign-Off
                  </h3>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 print:text-slate-600">
                    {data.ai_clinical_signoff.verification_status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-800 leading-relaxed font-medium italic">
                  "{data.ai_clinical_signoff.assessment_note}"
                </p>
                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 print:border-slate-300 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    {data.ai_clinical_signoff.clinical_signee}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Authorized Electronic Clinical Assessment
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
