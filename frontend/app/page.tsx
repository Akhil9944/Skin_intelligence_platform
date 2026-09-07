import Link from "next/link";
import { Sparkles, ShieldCheck, Activity, ArrowRight, Brain, Droplets, Sun, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-6 py-4 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Skin Intelligence
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all hover:scale-102"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-28 lg:pt-28">
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-8 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Clinical AI Dermatological Platform
          </div>

          <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Precision Skincare, <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Powered by Clinical AI.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Synthesize your static skin profile, sleep hygiene, daily hydration, stress markers, and UV environmental telemetry into personalized clinical regimens.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-102"
            >
              Analyze Your Skin Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              Existing Member Login
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Random Forest ML Regressor</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Google Gemini Clinical Engine</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero-Trust Data Isolation</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-md">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Predictive ML Scoring</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Trained regressors compute your multi-variable Skin Health Score based on sleep duration, hydration, and stress levels.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-md">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dynamic Routine Synthesis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Curated morning, evening, and weekly active-ingredient recommendations generated according to your barrier sensitivity.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none backdrop-blur-md">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Environmental Telemetry</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Correlate UV sun exposure, weather conditions, and pollution index against your skin condition history.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
