"""
Tests for Core Intelligence Engines (Task 3: Testing & Validations)

Validates the 4 core AI & ML domain engines:
1. product_engine.py: Scikit-learn TF-IDF & Cosine Similarity product matcher.
2. ingredient_engine.py: INCI chemical parser, clash detector, and formula safety regressor.
3. progress_engine.py: Longitudinal progress tracker, ML 7-day forecast, and coach notes.
4. analytics_engine.py: Feature importance, habit simulator, executive summary, and 5-point clinical report.
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import product_engine
import ingredient_engine
import progress_engine
import analytics_engine


class MockSkinProfile:
    def __init__(self, skin_type="Combination", primary_concern="Acne", is_sensitive=False):
        self.skin_type = skin_type
        self.primary_concern = primary_concern
        self.is_sensitive = is_sensitive


class MockDailyLog:
    def __init__(self, sleep=7.5, water=8, stress=4, sun=1.0, date="2026-10-01"):
        self.sleep_hours = sleep
        self.water_glasses = water
        self.stress_level = stress
        self.sun_exposure_hours = sun
        self.date_logged = date


class TestIntelligenceEngines(unittest.TestCase):
    # ----------------------------------------------------
    # 1. Product Recommendation Engine
    # ----------------------------------------------------
    def test_01_product_recommendations_ranking(self):
        """Verifies TF-IDF matcher ranks products and computes valid compatibility percentages."""
        result = product_engine.get_product_recommendations(
            skin_type="Oily",
            primary_concern="Acne",
            is_sensitive=False
        )
        self.assertIn("products", result)
        products = result["products"]
        self.assertGreater(len(products), 0, "Product catalog must return recommendations")

        top_product = products[0]
        self.assertIn("match_percentage", top_product)
        self.assertGreaterEqual(top_product["match_percentage"], 65)
        self.assertLessEqual(top_product["match_percentage"], 99)
        self.assertIn("ai_reason", top_product)
        self.assertIn("simple_benefit", top_product)

    def test_02_product_category_filtering(self):
        """Verifies category filter returns only products belonging to that category."""
        res_cleanser = product_engine.get_product_recommendations(
            skin_type="Dry",
            primary_concern="Dehydration",
            category_filter="Cleanser"
        )
        for p in res_cleanser["products"]:
            self.assertEqual(p["category"].lower(), "cleanser")

    def test_03_sensitive_skin_fragrance_safety(self):
        """Verifies sensitive skin profiles receive fragrance-free products with high safety."""
        result_sensitive = product_engine.get_product_recommendations(
            skin_type="Dry",
            primary_concern="Redness",
            is_sensitive=True
        )
        products = result_sensitive["products"]
        self.assertGreater(len(products), 0)
        self.assertTrue(products[0].get("is_fragrance_free", True))

    # ----------------------------------------------------
    # 2. Ingredient Intelligence Engine
    # ----------------------------------------------------
    def test_04_ingredient_analysis_clean_formula(self):
        """Verifies safe ingredients yield high barrier safety and zero chemical clashes."""
        clean_inci = "Water, Glycerin, Niacinamide, Hyaluronic Acid, Ceramide NP, Panthenol, Allantoin"
        profile = MockSkinProfile(skin_type="Normal", primary_concern="General Care", is_sensitive=False)
        analysis = ingredient_engine.analyze_ingredients_formula(clean_inci, profile)

        self.assertIn("overall_safety_score", analysis)
        self.assertGreaterEqual(analysis["overall_safety_score"], 70.0)
        self.assertEqual(len(analysis["conflicts_detected"]), 0, "Safe formula should have 0 chemical clashes")
        self.assertGreater(len(analysis["parsed_ingredients"]), 0, "Should parse known ingredients")

    def test_05_ingredient_chemical_clash_detection(self):
        """Verifies the clash matrix detects risky combinations (e.g. Retinol and Salicylic Acid)."""
        clashing_inci = "Water, Retinol, Salicylic Acid, Alcohol Denat, Fragrance"
        profile = MockSkinProfile(skin_type="Dry", primary_concern="Anti-Aging", is_sensitive=True)
        analysis = ingredient_engine.analyze_ingredients_formula(clashing_inci, profile)

        self.assertGreater(len(analysis["conflicts_detected"]), 0, "Must detect clash between Retinol and Salicylic Acid")
        self.assertLess(analysis["overall_safety_score"], 75.0, "Clashing formula must have lower safety score")

    # ----------------------------------------------------
    # 3. Progress Tracking Engine
    # ----------------------------------------------------
    def test_06_progress_score_calculation(self):
        """Verifies skin score calculation handles both present logs and new users gracefully."""
        score_none = progress_engine.compute_log_score(None, None)
        self.assertEqual(score_none, 75.0, "Default baseline score should be 75.0")

        healthy_log = MockDailyLog(sleep=8.0, water=8, stress=3, sun=1.0)
        profile = MockSkinProfile()
        score_healthy = progress_engine.compute_log_score(profile, healthy_log)
        self.assertGreater(score_healthy, 70.0)

    def test_07_detailed_progress_payload(self):
        """Verifies 7-day ML forecast and habit impact telemetry generation."""
        logs = [
            MockDailyLog(sleep=8.0, water=8, stress=3, sun=1.0, date="2026-10-01"),
            MockDailyLog(sleep=7.5, water=7, stress=4, sun=1.5, date="2026-10-02"),
            MockDailyLog(sleep=7.0, water=8, stress=4, sun=1.0, date="2026-10-03"),
        ]
        profile = MockSkinProfile()
        progress_data = progress_engine.get_detailed_progress(profile, logs)

        self.assertIn("current_score", progress_data)
        self.assertIn("projected_score_7d", progress_data)
        self.assertIn("score_change", progress_data)
        self.assertIn("trend_label", progress_data)
        self.assertIn("ai_coach_note", progress_data)
        self.assertIn("habit_impacts", progress_data)

    # ----------------------------------------------------
    # 4. Skincare Analytics & Clinical Report Engine
    # ----------------------------------------------------
    def test_08_habit_influence_weights(self):
        """Verifies feature importance weights sum to 100% and have plain-English explanations."""
        weights = analytics_engine.get_habit_influence_weights()
        self.assertEqual(len(weights), 4, "Must return weights for Sleep, Water, Stress, Sun")
        total_pct = sum(w["influence_pct"] for w in weights)
        self.assertTrue(98 <= total_pct <= 102, f"Total percentage should sum to ~100%, got {total_pct}")
        for w in weights:
            self.assertIn("simple_explanation", w)
            self.assertIn("icon", w)

    def test_09_risk_gauges_calculation(self):
        """Verifies 3 plain-English risk gauges: Breakout, Dehydration, Barrier."""
        logs = [MockDailyLog(sleep=6.0, water=5, stress=8, sun=2.0)]
        profile = MockSkinProfile(skin_type="Oily", primary_concern="Acne", is_sensitive=False)
        gauges = analytics_engine.calculate_risk_gauges(logs, profile)

        self.assertEqual(len(gauges), 3, "Must return Breakout, Dehydration, and Barrier gauges")
        names = [g["risk_name"] for g in gauges]
        self.assertIn("Breakout Risk", names)
        self.assertIn("Dehydration Risk", names)
        self.assertIn("Barrier Defense", names)

    def test_10_habit_simulator(self):
        """Verifies simulator calculates impact of increasing sleep and water."""
        profile = MockSkinProfile()
        sim_low = analytics_engine.simulate_skin_score(sleep_hours=5.0, water_glasses=4, stress_level=8, sun_exposure_hours=2.0, skin_profile=profile)
        sim_high = analytics_engine.simulate_skin_score(sleep_hours=8.5, water_glasses=9, stress_level=2, sun_exposure_hours=1.0, skin_profile=profile)

        self.assertGreater(sim_high["predicted_score"], sim_low["predicted_score"], "Higher sleep and water must increase simulated score")
        self.assertIn("summary_text", sim_high)

    def test_11_executive_dashboard_payload(self):
        """Verifies executive summary payload structure and benchmark accuracy cards."""
        payload = analytics_engine.get_executive_dashboard_payload()
        self.assertIn("kpi_cards", payload)
        self.assertIn("ml_models", payload)
        self.assertIn("cohort_distributions", payload)
        self.assertIn("executive_ai_summary", payload)
        self.assertEqual(len(payload["ml_models"]), 4, "Must monitor all 4 ML models")

    def test_12_clinical_report_payload(self):
        """Verifies 5-point radar visualization, AM/PM regimen, and AI sign-off payload."""
        logs = [MockDailyLog(sleep=7.5, water=8, stress=4, sun=1.0)]
        profile = MockSkinProfile(skin_type="Combination", primary_concern="Redness", is_sensitive=True)
        report = analytics_engine.get_clinical_report_payload(profile, logs)

        self.assertIn("report_id", report)
        self.assertIn("radar_points", report)
        self.assertEqual(len(report["radar_points"]), 5, "Must return exactly 5 radar points")

        pillar_names = [p["pillar"] for p in report["radar_points"]]
        self.assertIn("Hydration Balance", pillar_names)
        self.assertIn("Barrier Shield", pillar_names)
        self.assertIn("Oil Balance", pillar_names)
        self.assertIn("Sun Defense", pillar_names)
        self.assertIn("Sensitivity Defense", pillar_names)

        self.assertIn("morning_routine", report)
        self.assertIn("evening_routine", report)
        self.assertIn("recommended_products", report)
        self.assertIn("safety_precautions", report)
        self.assertIn("ai_clinical_signoff", report)


if __name__ == "__main__":
    unittest.main()
