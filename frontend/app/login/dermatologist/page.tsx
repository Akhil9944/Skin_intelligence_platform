"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/app/apiConfig";
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  LogIn, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  AlertCircle, 
  Sparkles,
  HeartPulse,
  Activity,
  Users
} from "lucide-react";

export default function DermatologistLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    try {
      const response = await fetch(`${getApiBase()}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.role || data.role.toLowerCase() !== "dermatologist") {
          setError("Access restricted. The account entered does not have Certified Dermatologist privileges. Please use the Patient login.");
          return;
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email || loginEmail);
        router.push("/dashboard/dermatologist");
      } else {
        setError(data.detail || "Invalid clinical credentials. Please verify your practitioner email and password.");
      }
    } catch (err) {
      setError("Cannot connect to clinical server. Ensure the backend is active on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setEmail("dermatologist@clinic.com");
    setPassword("doctor123");
    handleLogin(undefined, "dermatologist@clinic.com", "doctor123");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white transition-colors relative flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 dark:bg-teal-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white shadow-md shadow-teal-500/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block">Skin Intelligence</span>
            <span className="text-[10px] font-semibold tracking-wider text-teal-600 dark:text-teal-400 uppercase">Clinician Portal</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Are you a patient?</span>
          <Link
            href="/login"
            className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            Patient Sign In
          </Link>
        </div>
      </header>

      {/* Body Content */}
      <div className="flex flex-1 flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto w-full px-6 py-12 gap-12">
        {/* Left Side Presentation */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Medical Practitioner Gateway
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Certified Dermatologist <br />
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Clinical Command Center.
            </span>
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-md">
            Sign in to access patient cohort telemetry, triage acute skin conditions, audit chemical active interactions, and prescribe calibrated clinical routines.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Full longitudinal access to patient skin health trajectories</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Random Forest clinical concern prioritization & triage alerts</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Direct clinical guidance notes and prescription entry</span>
            </div>
          </div>

          {/* Quick Demo Login Badge */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Demo Practitioner Account
                </p>
                <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                  Pre-configured with sample patients & clinical history.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30 active:scale-95 disabled:opacity-50"
              >
                1-Click Demo Login
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="mb-6">
              <div className="h-12 w-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Sign In</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your licensed practitioner credentials below.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-4 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Practitioner Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dermatologist@clinic.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-10 py-2.5 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clinical Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-10 py-2.5 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:opacity-95 hover:shadow-teal-500/35 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" /> Authenticating Practitioner...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In to Clinical Command Center
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient seeking personalized routine?{" "}
                <Link href="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                  Go to Patient Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Clinical Dermatology Gateway • Skin Intelligence Healthcare System
      </footer>
    </div>
  );
}
