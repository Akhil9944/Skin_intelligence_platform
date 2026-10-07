"use client";

import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface TriageConcern {
  name: string;
  tier: number;
  priority_label: string;
  is_harmful: boolean;
  clinical_rationale: string;
  recommended_actives: string[];
  restricted_actives: string[];
}

interface ConcernTriage {
  prioritized_list: TriageConcern[];
  primary_target: TriageConcern;
  secondary_targets: TriageConcern[];
  has_harmful_concern: boolean;
}

interface RecommendationResponse {
  score: number;
  clinical_summary: string;
  lifestyle_prescription: string[];
  warning_notes: string;
  concern_triage?: ConcernTriage;
  priority_triage_rationale?: string;
}

export default function DermatologistRecommendationsPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${getApiBase()}/assessment/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dermatologist recommendations", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Expert AI Consultation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
            Dermatologist Recommendations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Personalized clinical insights dynamically formulated from your current skin health score.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500 dark:text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium">Analyzing skin telemetry and generating clinical prescription...</span>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Score Banner Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Evaluated Score Index</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                  {data.clinical_summary}
                </p>
              </div>

              <div className="text-center sm:text-right bg-slate-50 dark:bg-slate-950 px-6 py-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 min-w-[140px] shadow-inner transition-colors">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 block tracking-tight">
                  {data.score}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                  / 100 Points
                </span>
              </div>
            </div>

            {/* Lifestyle Prescription Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl transition-colors">
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
                Targeted Lifestyle Prescription
              </h3>
              <ul className="space-y-3">
                {data.lifestyle_prescription?.map((item: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start bg-slate-50/80 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                  >
                    <span className="bg-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3.5 mt-0.5 shrink-0 shadow-xs shadow-indigo-500/30">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinical Warning & Cautions Banner */}
            <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-300">
                  Clinical Cautions & Notes
                </h3>
              </div>
              <p className="text-amber-900/80 dark:text-amber-200/80 text-sm leading-relaxed pl-7">
                {data.warning_notes}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-semibold">
            Failed to load recommendations. Please verify your backend server connection.
          </div>
        )}
      </main>
    </div>
  );
}
