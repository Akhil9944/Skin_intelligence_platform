"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sliders, AlertCircle, CheckCircle2, Droplets, Sparkles, Shield, Wind } from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [skinType, setSkinType] = useState("Oily");
  const [primaryConcern, setPrimaryConcern] = useState("Acne");
  const [isSensitive, setIsSensitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const skinTypes = [
    { id: "Oily", title: "Oily", desc: "Excess sebum, prone to shine & enlarged pores", icon: Droplets },
    { id: "Dry", title: "Dry", desc: "Tight feeling, flaking, dullness & fine texture", icon: Wind },
    { id: "Combination", title: "Combination", desc: "Oily T-zone (forehead, nose) with dry cheeks", icon: Sparkles },
    { id: "Normal", title: "Normal", desc: "Balanced moisture levels, minimal sensitivity", icon: Shield },
  ];

  const popularConcerns = ["Acne", "Aging & Fine Lines", "Hyperpigmentation", "Redness / Rosacea", "Dehydration", "Dullness"];

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
      const response = await fetch("http://localhost:8001/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skin_type: skinType,
          primary_concern: primaryConcern,
          is_sensitive: isSensitive,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to save skin profile.");
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Skin Baseline Calibration</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configures the clinical ML model baseline parameters.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Skin Type Selection Tiles */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Select Skin Classification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {skinTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = skinType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setSkinType(type.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className={`mt-0.5 p-2 rounded-xl ${isSelected ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-bold ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-white"}`}>
                            {type.title}
                          </h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{type.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Concern Input + Quick Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Primary Skin Concern
              </label>
              <input
                type="text"
                required
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                placeholder="e.g., Acne, Aging, Redness, Hyperpigmentation"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {popularConcerns.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => setPrimaryConcern(concern)}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    + {concern}
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitive Skin Toggle Card */}
            <div
              onClick={() => setIsSensitive(!isSensitive)}
              className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                isSensitive
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isSensitive ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 text-slate-400"}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reactive / Sensitive Barrier</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Restricts harsh chemical actives & prioritizes barrier restoration.</p>
                </div>
              </div>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${isSensitive ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isSensitive ? "translate-x-5" : "translate-x-0"}`} />
              </div>
            </div>

            {/* Submit Actions */}
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
                {loading ? "Saving Profile..." : "Save Skin Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
