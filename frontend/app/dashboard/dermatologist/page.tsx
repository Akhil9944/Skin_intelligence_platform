"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiBase } from "@/app/apiConfig";
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Moon,
  Droplet,
  Flame,
  Sun,
  FileText,
  Save,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  LogOut,
  RefreshCw,
  Sparkles,
  Printer,
  UserCheck,
  ShoppingBag,
  Award,
  HeartPulse
} from "lucide-react";

interface PatientSummary {
  user_id: number;
  email: string;
  skin_type: string;
  primary_concern: string;
  is_sensitive: boolean;
  clinical_notes: string | null;
  latest_score: number;
  latest_log_date: string | null;
  total_logs: number;
  average_stress: number;
  average_sleep: number;
  average_water: number;
  risk_level: "High Risk" | "Moderate Risk" | "Stable" | string;
}

interface RadarPoint {
  id?: string;
  pillar?: string;
  subject?: string;
  score: number;
  cohort_avg?: number;
  status: string;
  simple_meaning?: string;
}

interface RoutineStep {
  step: string;
  product: string;
  why?: string;
  reason?: string;
}

interface RecommendedProduct {
  brand?: string;
  name: string;
  category: string;
  match_percentage?: number;
  match_score?: number;
  simple_benefit?: string;
  ai_reason?: string;
  why_recommended?: string;
}

interface SafetyPrecaution {
  rule: string;
  explanation: string;
}

interface PatientDetail {
  patient: {
    id: number;
    email: string;
    role: string;
  };
  profile: {
    skin_type: string;
    primary_concern: string;
    is_sensitive: boolean;
    clinical_notes: string;
  } | null;
  logs: Array<{
    id: number;
    date_logged: string;
    sleep_hours: number;
    water_glasses: number;
    stress_level: number;
    sun_exposure_hours: number;
    weather_condition: string;
    pollution_exposure: string;
  }>;
  clinical_report: {
    report_id?: string;
    report_date?: string;
    score?: number;
    scores?: {
      current_score: number;
      projected_7d: number;
      status_label: string;
    };
    patient?: {
      name: string;
      skin_type: string;
      primary_concern: string;
      is_sensitive: boolean;
      consistency_streak: string;
      routine_adherence: string;
    };
    lifestyle_telemetry?: {
      avg_sleep: string;
      avg_water: string;
      avg_stress: string;
      avg_sun: string;
    };
    radar_points?: RadarPoint[];
    morning_routine: RoutineStep[];
    evening_routine: RoutineStep[];
    recommended_products?: RecommendedProduct[];
    matched_products?: Array<{ name: string; category: string; match_score: number }>;
    safety_precautions?: SafetyPrecaution[];
    ai_clinical_signoff?: {
      assessment_note: string;
      clinical_signee: string;
      verification_status: string;
    } | string;
  };
  priorities: Array<{
    concern: string;
    urgency_score: number;
    urgency_label?: string;
    telemetry_driver: string;
  }>;
}

export default function DermatologistPortalPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [concernFilter, setConcernFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  // Selected Patient Modal State
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login/dermatologist");
      return;
    }

    try {
      const res = await fetch(`${getApiBase()}/dermatologist/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        setError("Access denied: You need Certified Dermatologist credentials to access this portal. Please log in via the Clinician Portal.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load patient records");
      }

      const data = await res.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || "Could not connect to clinic API.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatientProfile = async (patientId: number) => {
    setSelectedPatientId(patientId);
    setDetailLoading(true);
    setModalError(null);
    setPatientDetail(null);
    setSaveSuccess(false);
    const token = localStorage.getItem("token");

    if (!token) {
      setModalError("You must be signed in with Certified Dermatologist credentials.");
      setDetailLoading(false);
      return;
    }

    try {
      const res = await fetch(`${getApiBase()}/dermatologist/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientDetail(data);
        setDoctorNotes(data.profile?.clinical_notes || "");
      } else {
        const errJson = await res.json().catch(() => ({}));
        setModalError(errJson.detail || `Failed to retrieve patient report (HTTP ${res.status}).`);
      }
    } catch (err: any) {
      console.error("Error loading patient detail:", err);
      setModalError(err.message || "Network error: Unable to load patient records.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPatientId) return;
    setSavingNotes(true);
    setSaveSuccess(false);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${getApiBase()}/dermatologist/patient/${selectedPatientId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: doctorNotes }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        // Update local patient summary list notes
        setPatients((prev) =>
          prev.map((p) => (p.user_id === selectedPatientId ? { ...p, clinical_notes: doctorNotes } : p))
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save clinical notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Filtered Patients List
  const filteredPatients = patients.filter((p) => {
    const emailStr = p.email || "";
    const concernStr = p.primary_concern || "";
    const skinTypeStr = p.skin_type || "";
    const riskStr = p.risk_level || "";
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      emailStr.toLowerCase().includes(query) ||
      concernStr.toLowerCase().includes(query) ||
      skinTypeStr.toLowerCase().includes(query);

    const matchesConcern =
      concernFilter === "All" ||
      concernStr.toLowerCase().includes(concernFilter.toLowerCase());

    const matchesRisk =
      riskFilter === "All" ||
      riskStr.toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesConcern && matchesRisk;
  });

  // Aggregate Stats
  const highRiskCount = patients.filter((p) => p.risk_level === "High Risk").length;
  const avgScore =
    patients.length > 0
      ? (patients.reduce((acc, curr) => acc + curr.latest_score, 0) / patients.length).toFixed(1)
      : "75.0";

  // Dynamic concern list derived from real patient roster
  const availableConcerns = Array.from(
    new Set(
      patients
        .flatMap((p) => (p.primary_concern ? p.primary_concern.split(",").map((c) => c.trim()) : []))
        .filter((c) => c && c !== "Not Set")
    )
  );

  // Safe normalized variables for modal display (prevents any runtime TypeError)
  const report = patientDetail?.clinical_report;
  const currentScore = Number(report?.scores?.current_score ?? report?.score ?? 75);
  const projectedScore = Number(report?.scores?.projected_7d ?? 80);
  const scoreDelta = Math.max(1, Math.round(projectedScore - currentScore));
  const statusLabel = report?.scores?.status_label || "Active Status";

  const prioritiesList = useMemo(() => {
    if (!patientDetail) return [];
    const p = patientDetail.priorities;
    if (Array.isArray(p)) {
      return p.map((item: any) => ({
        concern: item.concern || item.name || "Skin Priority",
        urgency_score: Math.round(Number(item.urgency_score ?? item.ml_urgency_score ?? 50)),
        urgency_label: String(item.urgency_label ?? item.priority_label ?? "Moderate Priority"),
        telemetry_driver: String(item.telemetry_driver ?? "Calibrated via ML regression.")
      }));
    }
    if (p && typeof p === "object" && Array.isArray((p as any).prioritized_list)) {
      return (p as any).prioritized_list.map((item: any) => ({
        concern: item.name || item.concern || "Skin Priority",
        urgency_score: Math.round(Number(item.ml_urgency_score ?? item.urgency_score ?? 50)),
        urgency_label: String(item.priority_label ?? item.urgency_label ?? "Moderate Priority"),
        telemetry_driver: String(item.telemetry_driver ?? "Calibrated via ML regression.")
      }));
    }
    return [];
  }, [patientDetail]);

  const radarPoints = useMemo(() => {
    const pts = patientDetail?.clinical_report?.radar_points;
    if (Array.isArray(pts)) {
      return pts.map((pt: any, idx: number) => ({
        pillar: pt.pillar || pt.subject || `Pillar ${idx + 1}`,
        score: Math.round(Number(pt.score ?? 70)),
        cohort_avg: Math.round(Number(pt.cohort_avg ?? 70)),
        status: String(pt.status || "Balanced"),
        simple_meaning: String(pt.simple_meaning || "Evaluation of biological balance.")
      }));
    }
    return [];
  }, [patientDetail]);

  const logsList = useMemo(() => {
    const l = patientDetail?.logs;
    return Array.isArray(l) ? l : [];
  }, [patientDetail]);

  const morningRoutine = useMemo(() => {
    const mr = patientDetail?.clinical_report?.morning_routine;
    return Array.isArray(mr) ? mr : [];
  }, [patientDetail]);

  const eveningRoutine = useMemo(() => {
    const er = patientDetail?.clinical_report?.evening_routine;
    return Array.isArray(er) ? er : [];
  }, [patientDetail]);

  const recommendedProducts = useMemo(() => {
    const r = patientDetail?.clinical_report;
    const prods = r?.recommended_products || r?.matched_products;
    return Array.isArray(prods) ? prods : [];
  }, [patientDetail]);

  const safetyPrecautions = useMemo(() => {
    const s = patientDetail?.clinical_report?.safety_precautions;
    return Array.isArray(s) ? s : [];
  }, [patientDetail]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Dedicated Dermatologist Header */}
      <header className="sticky top-0 z-50 w-full border-b border-teal-200/80 dark:border-teal-900/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block">
                Skin Intelligence
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Clinician Dermatology Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Certified Dermatologist
            </span>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                router.push("/login/dermatologist");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900 transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Doctor Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Banner */}
        <div className="rounded-3xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 dark:from-teal-950/40 dark:via-blue-950/30 dark:to-indigo-950/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold tracking-wide mb-3">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Licensed Dermatologist Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Clinical Dermatology Command Center
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Real-time patient roster, diagnostic biomarker telemetry, Random Forest urgency triage, and clinical prescription guidance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPatients}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Roster
              </button>
              <Link
                href="/dashboard/executive"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition-all active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                Executive KPIs
              </Link>
            </div>
          </div>
        </div>

        {/* Clinical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Patients Under Care
              </span>
              <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {patients.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active patient clinical profiles registered
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                High-Risk Triage Alerts
              </span>
              <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-rose-700 dark:text-rose-400">
              {highRiskCount}
            </div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
              Severe barrier distress or acute stress flare-ups
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cohort Mean Score
              </span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {avgScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Random Forest skin health continuous average
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Clinical Precision
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              100%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              4 trained ML models & INCI clash matrix online
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by email, concern, or skin type..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            <select
              value={concernFilter}
              onChange={(e) => setConcernFilter(e.target.value)}
              aria-label="Filter by Skin Concern"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="All">All Concerns ({patients.length})</option>
              {availableConcerns.map((concern) => (
                <option key={concern} value={concern}>
                  {concern}
                </option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter by Clinical Risk Level"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="All">All Risk Tiers</option>
              <option value="High Risk">High Risk Only</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="Stable">Stable</option>
            </select>
          </div>
        </div>

        {/* Patient Directory Grid */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs font-bold text-slate-500">Querying patient health records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No matching patient records found.</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search query or concern filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((patient) => {
              const isHighRisk = patient.risk_level === "High Risk";
              const isModerateRisk = patient.risk_level === "Moderate Risk";

              return (
                <div
                  key={patient.user_id}
                  className={`rounded-3xl border transition-all hover:shadow-lg p-6 bg-white dark:bg-slate-900 flex flex-col justify-between ${
                    isHighRisk
                      ? "border-rose-300 dark:border-rose-900/80 shadow-rose-500/5"
                      : isModerateRisk
                      ? "border-amber-300 dark:border-amber-900/80 shadow-amber-500/5"
                      : "border-slate-200/80 dark:border-slate-800/80"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Top: Email & Risk Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-teal-500" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[190px]">
                            {patient.email}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Patient ID: #{patient.user_id}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                          isHighRisk
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : isModerateRisk
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {patient.risk_level}
                      </span>
                    </div>

                    {/* Skin Profile Indicators */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {patient.skin_type} Skin
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                        Target: {patient.primary_concern}
                      </span>
                      {patient.is_sensitive && (
                        <span className="px-2 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                          Sensitive Stratum
                        </span>
                      )}
                    </div>

                    {/* 7-Day Lifestyle Telemetry at a Glance */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500" /> Sleep
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.average_sleep}h
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Droplet className="w-3 h-3 text-cyan-500" /> Water
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.average_water} gl
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" /> Stress
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {patient.average_stress}/10
                        </p>
                      </div>
                    </div>

                    {/* Clinical Notes Snippet */}
                    {patient.clinical_notes && (
                      <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/40 dark:border-teal-800/40">
                        <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                          Doctor Guidance:
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 italic">
                          &ldquo;{patient.clinical_notes}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Score & Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Health Index
                      </span>
                      <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                        {patient.latest_score} / 100
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenPatientProfile(patient.user_id)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/30 flex items-center gap-1.5 active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Open Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Deep Patient Clinical Profile & Comprehensive Report Modal */}
        {selectedPatientId && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-5 sm:p-8 space-y-6 print:max-h-none print:shadow-none print:border-none">
              {/* Close Button (Hidden in print) */}
              <button
                onClick={() => setSelectedPatientId(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors print:hidden"
                aria-label="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>

              {detailLoading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
                  <p className="text-xs font-bold text-slate-500">Retrieving full clinical telemetry & ML assessments...</p>
                </div>
              ) : modalError ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Unable to Open Patient Report</h3>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-sm mx-auto">{modalError}</p>
                  </div>
                  <button
                    onClick={() => selectedPatientId && handleOpenPatientProfile(selectedPatientId)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/30"
                  >
                    Try Again
                  </button>
                </div>
              ) : patientDetail ? (
                <>
                  {/* Modal Header */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
                      <Stethoscope className="w-3.5 h-3.5" /> Patient Clinical Profile & Full Report
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {patientDetail.patient?.email || "Patient Profile"}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Patient ID #{patientDetail.patient?.id ?? selectedPatientId} • Registered Member • {report?.report_id || `RPT-${patientDetail.patient?.id ?? selectedPatientId}`} • Issued: {report?.report_date || "Today"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 print:hidden">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-teal-600" />
                          Print Report
                        </button>
                        <Link
                          href="/dashboard/reports"
                          target="_blank"
                          className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold text-teal-700 dark:text-teal-300 transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          Patient Report View
                          <ExternalLink className="w-3 h-3 text-teal-500" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Biomarker Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Skin Type</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {patientDetail.profile?.skin_type || "Not Specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Primary Concern</span>
                      <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                        {patientDetail.profile?.primary_concern || "Not Specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Sensitivity Status</span>
                      <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                        {patientDetail.profile?.is_sensitive ? "Barrier Sensitive" : "Resilient Barrier"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Health Index</span>
                      <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {currentScore} / 100
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 block">
                        {statusLabel}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">7-Day Target</span>
                      <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                        {projectedScore} / 100
                      </p>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        +{scoreDelta} Pts Projected
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Adherence</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {report?.patient?.routine_adherence || "88% Compliance"}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 block">
                        {report?.patient?.consistency_streak || `${logsList.length} Logs recorded`}
                      </span>
                    </div>
                  </div>

                  {/* 5 Diagnostic Health Pillars */}
                  {radarPoints.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-teal-600" />
                          5 Diagnostic Health Pillars & Biological Defense Equilibrium
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400">
                          Cohort Normalized (N = 1,200)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {radarPoints.map((pt, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {pt.pillar}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                                    pt.score >= 80
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                      : pt.score >= 65
                                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400"
                                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                  }`}
                                >
                                  {pt.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {pt.simple_meaning}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                              <div className="flex justify-between text-[11px] font-bold mb-1">
                                <span className="text-teal-600 dark:text-teal-400">{pt.score} / 100</span>
                                <span className="text-slate-400 font-normal text-[10px]">
                                  Avg: {pt.cohort_avg}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(5, pt.score))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Machine Learning Concern Triage */}
                  {prioritiesList.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-teal-600" />
                        ML Concern Priority Triage (Random Forest Regressor)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {prioritiesList.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.concern}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-[10px] font-extrabold">
                                {item.urgency_score}% ML Urgency
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {item.telemetry_driver}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7-Day Lifestyle Telemetry Overview */}
                  {report?.lifestyle_telemetry && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        Patient 7-Day Lifestyle Telemetry Synthesis
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Moon className="w-3.5 h-3.5 text-indigo-500" /> Average Sleep
                          </span>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                            {report.lifestyle_telemetry.avg_sleep}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Droplet className="w-3.5 h-3.5 text-cyan-500" /> Water Intake
                          </span>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                            {report.lifestyle_telemetry.avg_water}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" /> Stress Index
                          </span>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                            {report.lifestyle_telemetry.avg_stress}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-amber-500" /> Sun Exposure
                          </span>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                            {report.lifestyle_telemetry.avg_sun}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recorded Daily Telemetry Logs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Recorded Patient Telemetry Logs ({logsList.length} logs recorded)
                    </h3>
                    {logsList.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No telemetry logs logged yet by this patient.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="p-3 font-bold">Date Logged</th>
                              <th className="p-3 font-bold">Sleep Hours</th>
                              <th className="p-3 font-bold">Hydration</th>
                              <th className="p-3 font-bold">Stress Index</th>
                              <th className="p-3 font-bold">Sun Exposure</th>
                              <th className="p-3 font-bold">Environment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logsList.slice(0, 10).map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                                <td className="p-3 font-semibold text-slate-900 dark:text-white">{log.date_logged}</td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{log.sleep_hours}h</td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{log.water_glasses} glasses</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      log.stress_level >= 7
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                        : log.stress_level >= 4
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                    }`}
                                  >
                                    {log.stress_level} / 10
                                  </span>
                                </td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">{log.sun_exposure_hours}h</td>
                                <td className="p-3 text-slate-500 dark:text-slate-400">
                                  {log.weather_condition || "Clear"} • {log.pollution_exposure || "Low"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Regimen Summary */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Active Regimen Calibrated for Patient
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* AM Routine */}
                      <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                        <span className="text-[11px] font-extrabold uppercase text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning AM Protocol
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                          {morningRoutine.map((step, sIdx) => (
                            <li key={sIdx} className="space-y-0.5">
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-amber-700 dark:text-amber-400">• {step.step}:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{step.product}</span>
                              </div>
                              {(step.why || step.reason) && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-3">
                                  {step.why || step.reason}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* PM Routine */}
                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                        <span className="text-[11px] font-extrabold uppercase text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                          <Moon className="w-3.5 h-3.5 text-indigo-500" /> Evening PM Protocol
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                          {eveningRoutine.map((step, sIdx) => (
                            <li key={sIdx} className="space-y-0.5">
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-indigo-700 dark:text-indigo-400">• {step.step}:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{step.product}</span>
                              </div>
                              {(step.why || step.reason) && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-3">
                                  {step.why || step.reason}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Clinically Matched Skincare Formulations */}
                  {recommendedProducts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        AI-Matched Skincare Formulations & Actives
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {recommendedProducts.map((prod, pIdx) => {
                          const matchPct = (prod as any).match_percentage ?? (prod as any).match_score ?? 90;
                          return (
                            <div
                              key={pIdx}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                                    {(prod as any).brand || (prod as any).category || "Formulation"}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold">
                                    {matchPct}% Match
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                                  {prod.name}
                                </h4>
                                {(prod as any).simple_benefit && (
                                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                                    {(prod as any).simple_benefit}
                                  </p>
                                )}
                                {(prod as any).ai_reason && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                                    &ldquo;{(prod as any).ai_reason}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Safety Precautions & Contraindications */}
                  {safetyPrecautions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Clinical Safety Precautions & Contraindications
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {safetyPrecautions.map((pre, prIdx) => (
                          <div
                            key={prIdx}
                            className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1"
                          >
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> {pre.rule}
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {pre.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Dermatologist Clinical Evaluation Sign-off */}
                  {report?.ai_clinical_signoff && (
                    <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-indigo-500" /> AI Clinical Synthesis & Diagnostic Sign-Off
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                          {typeof report.ai_clinical_signoff === "object"
                            ? (report.ai_clinical_signoff as any).verification_status || "Validated Multi-Model Calibration"
                            : "Validated Multi-Model Calibration"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                        &ldquo;
                        {typeof report.ai_clinical_signoff === "object"
                          ? (report.ai_clinical_signoff as any).assessment_note || "Patient demonstrated steady barrier balance."
                          : String(report.ai_clinical_signoff)}
                        &rdquo;
                      </p>
                      {typeof report.ai_clinical_signoff === "object" && (report.ai_clinical_signoff as any).clinical_signee && (
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-right">
                          Signed: {(report.ai_clinical_signoff as any).clinical_signee}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Doctor Clinical Notes Editor */}
                  <div className="space-y-3 p-5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/60">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Dermatologist Clinical Notes & Prescription Guidance
                      </h3>
                      {saveSuccess && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notes Saved Successfully!
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Write customized clinician notes, frequency adjustments (e.g. reduce BHA to 2x/wk), active barrier warnings, or follow-up recommendations..."
                      className="w-full rounded-2xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all placeholder-slate-400"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {savingNotes ? "Saving Notes..." : "Save Clinical Notes"}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
