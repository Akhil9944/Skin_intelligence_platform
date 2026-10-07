"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Calendar, Moon, Droplets, Flame, Sun, CloudRain, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

export default function TrackerSetupPage() {
  const router = useRouter();
  const [dateLogged, setDateLogged] = useState(new Date().toISOString().split("T")[0]);
  const [sleepHours, setSleepHours] = useState(8);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [stressLevel, setStressLevel] = useState(4);
  const [sunExposure, setSunExposure] = useState(1.0);
  const [weather, setWeather] = useState("Normal");
  const [pollution, setPollution] = useState("Low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/tracker/daily`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date_logged: dateLogged,
          sleep_hours: Number(sleepHours),
          water_glasses: Number(waterGlasses),
          stress_level: Number(stressLevel),
          sun_exposure_hours: Number(sunExposure),
          weather_condition: weather,
          pollution_exposure: pollution,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to submit daily telemetry.");
      }
    } catch (err) {
      setError("Cannot connect to server. Ensure backend is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Daily Telemetry Log</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record lifestyle metrics for machine learning regression.</p>
            </div>
          </div>

          {success ? (
            <div className="my-10 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 p-10 rounded-3xl text-center flex flex-col items-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              <h3 className="text-lg font-bold">Telemetry Recorded Successfully</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Returning to clinical workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-7">
              {error && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date Logged
                </label>
                <input
                  type="date"
                  required
                  value={dateLogged}
                  onChange={(e) => setDateLogged(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Sleep & Water Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" /> Sleep Duration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      required
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">Hours</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" /> Water Intake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      required
                      value={waterGlasses}
                      onChange={(e) => setWaterGlasses(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">Glasses</span>
                  </div>
                </div>
              </div>

              {/* Stress Slider */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Stress Index
                  </label>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${stressLevel > 7 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                    Level {stressLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  required
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Environmental Telemetry Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" /> Environmental Telemetry
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Direct Sun Exposure (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    required
                    value={sunExposure}
                    onChange={(e) => setSunExposure(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5" /> Climate
                    </label>
                    <select
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="Normal">Normal / Mild</option>
                      <option value="Humid">Hot & Humid</option>
                      <option value="Dry">Hot & Dry</option>
                      <option value="Cold">Cold & Windy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Pollution Index
                    </label>
                    <select
                      value={pollution}
                      onChange={(e) => setPollution(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="Low">Low (Mostly Indoors)</option>
                      <option value="Moderate">Moderate (City commute)</option>
                      <option value="High">High (Industrial / High Traffic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-1/3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 text-xs font-bold shadow-lg shadow-indigo-600/25 hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Recording..." : "Save Today's Telemetry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
