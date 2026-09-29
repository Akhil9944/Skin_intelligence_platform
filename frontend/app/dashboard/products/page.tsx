"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, Sun, Moon, Check, Filter, Search, ArrowRight, RefreshCw, ShoppingBag, Droplets, Heart } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  step_label: string;
  suitable_skin_types: string[];
  target_concerns: string[];
  key_ingredients: string[];
  is_fragrance_free: boolean;
  pore_clogging_level: string;
  routine_time: string;
  price_range: string;
  simple_benefit: string;
  match_percentage: number;
  ai_reason: string;
}

interface RecommendationsData {
  user_profile_summary: {
    skin_type: string;
    primary_concern: string;
    is_sensitive: boolean;
  };
  ml_engine_type: string;
  total_recommended: number;
  products: Product[];
}

const CATEGORY_TABS = [
  { id: "all", label: "All Steps" },
  { id: "Cleanser", label: "Step 1: Cleansers" },
  { id: "Serum", label: "Step 2: Serums" },
  { id: "Moisturizer", label: "Step 3: Moisturizers" },
  { id: "Sunscreen", label: "Step 4: Sunscreens" }
];

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecommendations = async (category: string = "all") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = category === "all" 
        ? "http://localhost:8001/products/recommendations" 
        : `http://localhost:8001/products/recommendations?category=${category}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not load product recommendations.");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load products. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedCategory);
  }, [selectedCategory]);

  const filteredProducts = (data?.products || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.key_ingredients.some((ing) => ing.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-xs mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple AI & ML Product Matcher</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Recommended Products for You
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Everyday skincare products matched to your skin type and concerns using simple Machine Learning.
            </p>
          </div>

          {/* User Skin Profile Summary Card */}
          {data?.user_profile_summary && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col gap-1 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Matching for Your Skin:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/60">
                  {data.user_profile_summary.skin_type} Skin
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800/60">
                  {data.user_profile_summary.primary_concern}
                </span>
                {data.user_profile_summary.is_sensitive && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800/60">
                    Sensitive Skin
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Step Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product or ingredient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Calculating simple ML matches for your skin profile...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-sm">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchRecommendations(selectedCategory)}
              className="mt-3 px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No products found</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different step.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all backdrop-blur-xl relative overflow-hidden"
                  >
                    {/* Top Row: Category Step & Match Score Badge */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {p.step_label}
                        </span>

                        {/* Match Percentage Badge */}
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>{p.match_percentage}% Match</span>
                        </div>
                      </div>

                      {/* Brand & Name */}
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {p.brand}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                        {p.name}
                      </h3>

                      {/* Simple Benefit */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {p.simple_benefit}
                      </p>

                      {/* Key Ingredients */}
                      <div className="mt-4">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                          Key Ingredients:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.key_ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Area: AI Simple Reason & Details */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                      {/* Why it fits you box */}
                      <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 mb-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Why this fits you:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {p.ai_reason}
                        </p>
                      </div>

                      {/* Badges footer: Routine time, pore clogging, fragrance */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          {p.routine_time.includes("Morning") ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                          {p.routine_time}
                        </span>

                        <span>
                          {p.is_fragrance_free ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Fragrance-Free</span>
                          ) : (
                            <span className="text-slate-400">Lightly Scented</span>
                          )}
                        </span>

                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {p.price_range}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
