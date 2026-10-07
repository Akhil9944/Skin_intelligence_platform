"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History as HistoryIcon, Calendar, Moon, Droplets, Flame, Sun, CloudRain, ShieldAlert, PlusCircle, RefreshCw } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

interface DailyLog {
  id: string;
  date_logged: string;
  sleep_hours: number;
  water_glasses: number;
  stress_level: number;
  sun_exposure_hours: number;
  weather_condition: string;
  pollution_exposure: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${getApiBase()}/tracker/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        } else {
          setError("Failed to load history.");
        }
      } catch (err) {
        setError("Cannot connect to server. Ensure backend is running on port 8001.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  // Aggregate averages for header statistics
  const avgSleep = logs.length ? (logs.reduce((acc, l) => acc + l.sleep_hours, 0) / logs.length).toFixed(1) : "0";
  const avgWater = logs.length ? (logs.reduce((acc, l) => acc + l.water_glasses, 0) / logs.length).toFixed(1) : "0";
  const avgStress = logs.length ? (logs.reduce((acc, l) => acc + l.stress_level, 0) / logs.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Log History
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Chronological log records tracking sleep, hydration, stress, and environmental exposure.
            </p>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => router.push("/dashboard/tracker")}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer w-fit"
            >
              <PlusCircle className="w-4 h-4" /> Log Today
            </button>
          )}
        </div>

        {/* Quick KPI Stat Cards */}
        {logs.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xs backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Sleep</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgSleep} <span className="text-xs font-semibold text-slate-400">hrs/night</span></div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xs backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Hydration</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgWater} <span className="text-xs font-semibold text-slate-400">glasses/day</span></div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-5 shadow-xs backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Stress Level</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgStress} <span className="text-xs font-semibold text-slate-400">/ 10</span></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-2xl shadow-slate-200/40 dark:shadow-none backdrop-blur-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-20 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Loading Telemetry Records...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center p-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <HistoryIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No telemetry recorded yet</h3>
              <p className="mt-1 mb-6 text-xs text-slate-500 dark:text-slate-400">Start logging your habits to build your chronological telemetry timeline.</p>
              <button
                onClick={() => router.push("/dashboard/tracker")}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Log First Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-200">
                <thead className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Sleep</div></th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Water</div></th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Stress</div></th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Sun (Hrs)</div></th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5" /> Climate</div></th>
                    <th className="px-6 py-4.5"><div className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Pollution</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{log.date_logged}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.sleep_hours} hrs</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.water_glasses} glasses</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold ${
                          log.stress_level > 7
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900"
                        }`}>
                          {log.stress_level} / 10
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.sun_exposure_hours ?? 0} hrs</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.weather_condition ?? "Not recorded"}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{log.pollution_exposure ?? "Not recorded"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
