"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  BarChart3, 
  Moon, 
  Droplets, 
  Smile, 
  Sun, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Zap, 
  ArrowRight,
  HelpCircle 
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface HabitWeight {
  habit: string;
  influence_pct: number;
  icon: string;
  simple_explanation: string;
}

interface RiskGauge {
  risk_name: string;
  percentage: number;
  level: string;
  status: string;
  simple_tip: string;
}

interface AIInsight {
  title: string;
  text: string;
  icon: string;
}

interface AnalyticsData {
  habit_weights: HabitWeight[];
  risk_gauges: RiskGauge[];
  ai_insights: AIInsight[];
  initial_simulation: {
    predicted_score: number;
    summary_text: string;
    sleep_hours: number;
    water_glasses: number;
    stress_level: number;
    sun_exposure_hours: number;
  };
  ml_engine_type: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Simulator state
  const [sleep, setSleep] = useState(7.5);
  const [water, setWater] = useState(8);
  const [stress, setStress] = useState(4);
  const [sun, setSun] = useState(1.0);
  const [simulatedScore, setSimulatedScore] = useState<number>(78);
  const [simulatedText, setSimulatedText] = useState("");
  const [simulating, setSimulating] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${getApiBase()}/analytics/skincare-insights`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not load skincare analytics.");
      }

      const json: AnalyticsData = await res.json();
      setData(json);

      if (json.initial_simulation) {
        setSleep(json.initial_simulation.sleep_hours || 7.5);
        setWater(json.initial_simulation.water_glasses || 8);
        setStress(json.initial_simulation.stress_level || 4);
        setSun(json.initial_simulation.sun_exposure_hours || 1.0);
        setSimulatedScore(json.initial_simulation.predicted_score || 78);
        setSimulatedText(json.initial_simulation.summary_text || "");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Run real-time simulation whenever sliders change
  const handleSimulate = async (newSleep: number, newWater: number, newStress: number, newSun: number) => {
    setSimulating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/analytics/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sleep_hours: newSleep,
          water_glasses: newWater,
          stress_level: newStress,
          sun_exposure_hours: newSun
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSimulatedScore(json.predicted_score);
        setSimulatedText(json.summary_text);
      }
    } catch (e) {
      // Fallback local math if network blips
      const fallback = Math.min(98, Math.max(20, Math.round(45 + newSleep * 3.6 + newWater * 2.2 - newStress * 2.6)));
      setSimulatedScore(fallback);
    } finally {
      setSimulating(false);
    }
  };

  const onSliderChange = (type: string, val: number) => {
    let s = sleep;
    let w = water;
    let st = stress;
    let su = sun;

    if (type === "sleep") {
      s = val;
      setSleep(val);
    } else if (type === "water") {
      w = val;
      setWater(val);
    } else if (type === "stress") {
      st = val;
      setStress(val);
    } else if (type === "sun") {
      su = val;
      setSun(val);
    }

    handleSimulate(s, w, st, su);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-xs mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>AI Skincare Analytics & Habit Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Skincare Analytics & What-If Simulator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
            See which daily habits affect your skin health the most and use the interactive AI simulator to predict future results.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Calculating habit influence and risk analytics...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm mb-6">
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-3 px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* 1. INTERACTIVE "WHAT-IF" SIMULATOR */}
            <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm mb-10 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Interactive "What-If" Skin Score Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-2xl leading-relaxed">
                Move the sliders below to test how improving your sleep, water, or stress would instantly change your Machine Learning predicted skin score.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sliders Area (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Sleep Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        Daily Sleep Hours
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                        {sleep} Hours
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      step={0.5}
                      value={sleep}
                      onChange={(e) => onSliderChange("sleep", parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                      <span>4h (Tired)</span>
                      <span>7.5h (Optimal)</span>
                      <span>10h (Deep Rest)</span>
                    </div>
                  </div>

                  {/* Water Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        Daily Water Glasses
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 font-bold border border-cyan-200 dark:border-cyan-800">
                        {water} Glasses
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      step={1}
                      value={water}
                      onChange={(e) => onSliderChange("water", parseInt(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                      <span>2 Glasses</span>
                      <span>8 Glasses (Goal)</span>
                      <span>12 Glasses</span>
                    </div>
                  </div>

                  {/* Stress Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Smile className="w-4 h-4 text-amber-500" />
                        Daily Stress Level
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
                        Level {stress} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={stress}
                      onChange={(e) => onSliderChange("stress", parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                      <span>1 (Calm & Relaxed)</span>
                      <span>5 (Moderate)</span>
                      <span>10 (High Stress)</span>
                    </div>
                  </div>

                  {/* Sun Exposure Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Sun className="w-4 h-4 text-orange-500" />
                        Outdoor Sun Exposure
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800">
                        {sun} Hours
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={sun}
                      onChange={(e) => onSliderChange("sun", parseFloat(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                      <span>0h (Indoors)</span>
                      <span>1.5h (Mild Sun)</span>
                      <span>5h (Direct Sun)</span>
                    </div>
                  </div>
                </div>

                {/* Score Result Box (5 Columns) */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white p-7 shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live ML Prediction</span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-indigo-100 font-bold">
                      Simulated Skin Health Score
                    </p>
                    <div className="flex items-baseline justify-center gap-2 mt-2">
                      <span className="text-6xl font-black tracking-tight">
                        {simulatedScore}
                      </span>
                      <span className="text-2xl font-bold text-indigo-200">/ 100</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/20 text-left">
                    <p className="text-xs leading-relaxed text-indigo-50 font-medium">
                      {simulatedText || `With this routine, Machine Learning predicts a skin score of ${simulatedScore}/100.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. "WHAT AFFECTS YOUR SKIN MOST?" (ML HABIT WEIGHTS) */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span>What Affects Your Skin Most?</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Calculated by our Machine Learning model based on how daily habits influence skin barrier health.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.habit_weights.map((hw, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {hw.icon === "moon" ? (
                          <Moon className="w-4 h-4 text-indigo-500" />
                        ) : hw.icon === "droplet" ? (
                          <Droplets className="w-4 h-4 text-cyan-500" />
                        ) : hw.icon === "smile" ? (
                          <Smile className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Sun className="w-4 h-4 text-orange-500" />
                        )}
                        {hw.habit}
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        {hw.influence_pct}% Influence
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${hw.influence_pct}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {hw.simple_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SIMPLE SKIN RISK GAUGES */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Simple Skin Risk Levels
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Real-time risk calculations based on your recent habit patterns and skin profile.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.risk_gauges.map((rg, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {rg.risk_name}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          rg.status === "good"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : rg.status === "caution"
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}>
                          {rg.level}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          {rg.percentage}%
                        </span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full ${
                            rg.status === "good"
                              ? "bg-emerald-500"
                              : rg.status === "caution"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${rg.percentage}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rg.simple_tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. AI SKIN PATTERN DISCOVERIES */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>AI Skin Pattern Discoveries</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Simple takeaways formulated by Gemini AI based on your personal skin habits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.ai_insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {insight.icon === "sparkles" ? (
                          <Sparkles className="w-4 h-4" />
                        ) : insight.icon === "eye" ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {insight.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {insight.text}
                    </p>
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
