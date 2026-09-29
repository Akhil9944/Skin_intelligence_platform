"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, AlertTriangle, RefreshCw, Cpu, Zap, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface ParsedIngredient {
  canonical_name: string;
  category: string;
  comedogenic_rating: number;
  irritancy_rating: number;
  role: string;
  is_active: boolean;
  is_allergen: boolean;
}

interface Conflict {
  actives: string[];
  severity: string;
  title: string;
  scientific_rationale: string;
}

interface AnalysisResult {
  product_name: string;
  overall_safety_score: number;
  comedogenic_risk_pct: number;
  irritation_risk_pct: number;
  ml_engine_type: string;
  total_parsed: number;
  parsed_ingredients: ParsedIngredient[];
  unmatched_tokens: string[];
  conflicts_detected: Conflict[];
  patient_warnings: string[];
  clinical_summary: string;
}

const PRESET_FORMULAS = [
  {
    name: "Gentle Barrier Cream (Safe)",
    text: "Aqua, Glycerin, Ceramide NP, Squalane, Centella Asiatica, Hyaluronic Acid, Niacinamide"
  },
  {
    name: "Dangerous Active Clash (BHA + Retinol)",
    text: "Water, Alcohol Denat, Salicylic Acid 2%, Retinol 0.5%, Fragrance, Glycolic Acid"
  },
  {
    name: "Comedogenic Pore-Clogging Heavy Oil",
    text: "Aqua, Cocos Nucifera (Coconut) Oil, Isopropyl Myristate, Fragrance"
  }
];

export default function IngredientScannerPage() {
  const [ingredientsText, setIngredientsText] = useState("");
  const [productName, setProductName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (textToAnalyze?: string, namePreset?: string) => {
    const text = textToAnalyze || ingredientsText;
    if (!text.trim()) {
      setError("Please paste or type an ingredient list.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8001/ingredients/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ingredients_text: text,
          product_name: namePreset || productName
        })
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json);
      } else {
        setError("Failed to evaluate formula. Please check your backend connection.");
      }
    } catch (err) {
      setError("Server error during ingredient inference.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold shadow-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI & ML Formulation Safety Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
            Ingredient Intelligence Scanner
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            Standardize raw product labels with NLP, detect biochemical active clashes, and evaluate formula safety using Random Forest regression.
          </p>
        </div>

        {/* Preset Selector Chips */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">Try Sample Lab Formulas:</span>
          {PRESET_FORMULAS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setProductName(preset.name);
                setIngredientsText(preset.text);
                handleAnalyze(preset.text, preset.name);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Product Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. CeraVe Daily Moisturizing Lotion or The Ordinary Niacinamide"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Paste Ingredients List (Separated by commas)
              </label>
              <textarea
                rows={4}
                placeholder="Aqua, Glycerin, Niacinamide 10%, Salicylic Acid, Retinol, Ceramide NP, Fragrance..."
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
              />
            </div>

            {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

            <button
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Formula...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run ML Formula Safety Inference
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Score & Risk Hero */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  ML Formula Evaluation
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {result.product_name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {result.clinical_summary}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {result.total_parsed} Ingredients Standardized
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Random Forest ML Model
                  </span>
                </div>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-3 gap-3 min-w-[320px] text-center">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
                    {result.overall_safety_score}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety Index</span>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">
                    {result.comedogenic_risk_pct}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pore Clog</span>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 block">
                    {result.irritation_risk_pct}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Irritation</span>
                </div>
              </div>
            </div>

            {/* Conflicts Card */}
            {result.conflicts_detected.length > 0 && (
              <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-6 sm:p-7 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <AlertOctagon className="w-5 h-5" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    {result.conflicts_detected.length} Biochemical Active Conflict(s) Detected
                  </h4>
                </div>
                {result.conflicts_detected.map((conflict, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{conflict.title}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{conflict.scientific_rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Patient Warnings */}
            {result.patient_warnings.length > 0 && (
              <div className="rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Patient Profile Contraindications</h4>
                </div>
                {result.patient_warnings.map((warn, i) => (
                  <p key={i} className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed pl-6">
                    • {warn}
                  </p>
                ))}
              </div>
            )}

            {/* INCI Table */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                Parsed Pharmacological INCI Table
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Ingredient</th>
                      <th className="pb-3">Function / Role</th>
                      <th className="pb-3 text-center">Comedogenic (0-5)</th>
                      <th className="pb-3 text-center">Irritancy (0-5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.parsed_ingredients.map((ing, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {ing.canonical_name}
                          {ing.is_active && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">{ing.role}</td>
                        <td className="py-3 text-center font-extrabold">
                          <span className={ing.comedogenic_rating >= 3 ? "text-rose-600" : "text-emerald-600"}>
                            {ing.comedogenic_rating} / 5
                          </span>
                        </td>
                        <td className="py-3 text-center font-extrabold">
                          <span className={ing.irritancy_rating >= 3 ? "text-rose-600" : "text-emerald-600"}>
                            {ing.irritancy_rating} / 5
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
