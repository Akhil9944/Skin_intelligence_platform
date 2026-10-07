"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sliders, AlertCircle, CheckCircle2, Droplets, Sparkles, Shield, Wind, X, Plus, AlertTriangle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { getApiBase } from "@/app/apiConfig";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [skinType, setSkinType] = useState("Oily");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(["Acne"]);
  const [customConcern, setCustomConcern] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const skinTypes = [
    { id: "Oily", title: "Oily", desc: "Excess sebum, prone to shine & enlarged pores", icon: Droplets },
    { id: "Dry", title: "Dry", desc: "Tight feeling, flaking, dullness & fine texture", icon: Wind },
    { id: "Combination", title: "Combination", desc: "Oily T-zone (forehead, nose) with dry cheeks", icon: Sparkles },
    { id: "Normal", title: "Normal", desc: "Balanced moisture levels, minimal sensitivity", icon: Shield },
  ];

  const popularConcerns = [
    { name: "Acne", tier: 1, tag: "High Priority" },
    { name: "Redness / Rosacea", tier: 1, tag: "High Priority" },
    { name: "Hyperpigmentation", tier: 2, tag: "Moderate" },
    { name: "Enlarged Pores", tier: 2, tag: "Moderate" },
    { name: "Uneven Texture", tier: 2, tag: "Moderate" },
    { name: "Aging & Fine Lines", tier: 3, tag: "Maintenance" },
    { name: "Dehydration", tier: 3, tag: "Maintenance" },
    { name: "Dullness", tier: 3, tag: "Maintenance" },
  ];

  // Live Clinical Triage computation
  const getPrimaryTarget = () => {
    if (selectedConcerns.length === 0) return null;
    const tier1 = selectedConcerns.find(c => {
      const l = c.toLowerCase();
      return l.includes("acne") || l.includes("redness") || l.includes("rosacea") || l.includes("barrier") || l.includes("inflam");
    });
    if (tier1) return { name: tier1, tier: 1, label: "High Priority (Inflammatory / Barrier Risk)", isHarmful: true };

    const tier2 = selectedConcerns.find(c => {
      const l = c.toLowerCase();
      return l.includes("pigment") || l.includes("dark spot") || l.includes("pore") || l.includes("texture") || l.includes("sun");
    });
    if (tier2) return { name: tier2, tier: 2, label: "Moderate Priority (Tone & Texture)", isHarmful: false };

    return { name: selectedConcerns[0], tier: 3, label: "Maintenance Priority (Aesthetic & Longevity)", isHarmful: false };
  };

  // Pre-populate existing skin profile if previously configured
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${getApiBase()}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.skin_type) setSkinType(data.skin_type);
          if (data.is_sensitive !== undefined) setIsSensitive(data.is_sensitive);
          if (data.primary_concern) {
            const parts = data.primary_concern
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
            if (parts.length > 0) setSelectedConcerns(parts);
          }
        }
      })
      .catch((err) => console.error("Could not fetch existing skin profile", err));
  }, []);

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    );
  };

  const handleAddCustomConcern = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customConcern.trim();
    if (trimmed && !selectedConcerns.includes(trimmed)) {
      setSelectedConcerns((prev) => [...prev, trimmed]);
      setCustomConcern("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (selectedConcerns.length === 0) {
      setError("Please select at least one skin concern.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skin_type: skinType,
          primary_concern: selectedConcerns.join(", "),
          is_sensitive: isSensitive,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
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

            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Skin profile saved successfully! Redirecting to dashboard...</span>
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

            {/* Multiple Skin Concerns Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Skin Concerns (Select Multiple)
                </label>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedConcerns.length} selected
                </span>
              </div>

              {/* Active Selected Badges */}
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 min-h-[50px] items-center">
                {selectedConcerns.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No concerns selected yet. Click options below or type to add.</span>
                ) : (
                  selectedConcerns.map((concern) => (
                    <span
                      key={concern}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                    >
                      {concern}
                      <button
                        type="button"
                        onClick={() => toggleConcern(concern)}
                        className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-100 cursor-pointer rounded-full p-0.5"
                        title={`Remove ${concern}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Live Clinical Priority Triage Preview */}
              {(() => {
                const primary = getPrimaryTarget();
                if (!primary) return null;
                return (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${primary.isHarmful ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Clinical Triage Priority:
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          primary.isHarmful
                            ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700"
                            : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                        }`}>
                          {primary.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                        <strong className="text-slate-900 dark:text-white font-bold">{primary.name}</strong> will receive highest treatment priority in your AI routine. {primary.isHarmful ? "Acute inflammatory and barrier-threatening symptoms must be calmed first to prevent scarring and damage before introducing aggressive anti-aging or peeling actives." : "Since no acute barrier threats are present, routine focuses on cellular renewal and progressive tone correction."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Quick Toggle Chips with Priority Indicators */}
              <div className="flex flex-wrap gap-2 pt-1">
                {popularConcerns.map((item) => {
                  const isSelected = selectedConcerns.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleConcern(item.name)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-xs font-bold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span>{item.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : item.tier === 1
                          ? "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400"
                          : item.tier === 2
                          ? "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Concern Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customConcern}
                  onChange={(e) => setCustomConcern(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomConcern();
                    }
                  }}
                  placeholder="Add custom concern (e.g., Dark spots, Sun damage)..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomConcern()}
                  disabled={!customConcern.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
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
                onClick={(e) => handleSubmit(e)}
                disabled={loading || success}
                className="w-2/3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 text-xs font-bold shadow-lg shadow-indigo-600/25 hover:scale-101 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <span>Save Skin Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
