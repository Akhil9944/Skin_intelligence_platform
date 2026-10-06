"""
Tests for Machine Learning Models (Task 3: Testing & Validations)

Validates all 4 serialized machine learning models:
1. skin_score_model.pkl: Predicts 0-100 skin health score from lifestyle telemetry.
2. adherence_model.pkl: Predicts routine adherence score from habits.
3. concern_priority_model.pkl: Multi-output priority triage for 7 clinical concerns.
4. ingredient_safety_model.pkl: Multi-output safety evaluation (barrier, pore-clogging, irritation).
"""

import os
import unittest
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestMachineLearningModels(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.skin_score_path = os.path.join(BASE_DIR, "skin_score_model.pkl")
        cls.adherence_path = os.path.join(BASE_DIR, "adherence_model.pkl")
        cls.concern_priority_path = os.path.join(BASE_DIR, "concern_priority_model.pkl")
        cls.ingredient_safety_path = os.path.join(BASE_DIR, "ingredient_safety_model.pkl")

    def test_01_skin_score_model_file_exists(self):
        """Verifies skin_score_model.pkl file exists and is loadable."""
        self.assertTrue(os.path.exists(self.skin_score_path), "skin_score_model.pkl must exist")
        model = joblib.load(self.skin_score_path)
        self.assertIsNotNone(model, "Model should successfully deserialize")

    def test_02_skin_score_model_inference_and_bounds(self):
        """Verifies healthy habits yield higher skin score than poor habits."""
        model = joblib.load(self.skin_score_path)

        # Optimal habits: 8h sleep, 8 glasses water, 2/10 stress, 1h sun
        optimal_features = np.array([[8.0, 8.0, 2.0, 1.0]])
        optimal_score = float(model.predict(optimal_features)[0])

        # Sub-optimal habits: 4.5h sleep, 2 glasses water, 9/10 stress, 4h sun
        poor_features = np.array([[4.5, 2.0, 9.0, 4.0]])
        poor_score = float(model.predict(poor_features)[0])

        self.assertGreater(optimal_score, poor_score, "Optimal lifestyle must score higher than poor habits")
        self.assertGreaterEqual(optimal_score, 50.0, "Optimal habits should score comfortably above average")
        self.assertLessEqual(optimal_score, 100.0, "Score cannot exceed 100")
        self.assertGreaterEqual(poor_score, 10.0, "Score cannot fall below 10")

    def test_03_skin_score_edge_cases(self):
        """Verifies edge case inputs (zero water, extreme stress, etc.) don't crash."""
        model = joblib.load(self.skin_score_path)
        extreme_cases = [
            np.array([[0.0, 0.0, 10.0, 10.0]]),  # Extreme bad
            np.array([[12.0, 15.0, 1.0, 0.0]]),   # Extreme good
            np.array([[24.0, 20.0, 5.0, 1.0]]),   # Max bounds
        ]
        for features in extreme_cases:
            pred = float(model.predict(features)[0])
            self.assertFalse(np.isnan(pred), "Prediction should not be NaN")
            self.assertFalse(np.isinf(pred), "Prediction should not be Infinite")

    def test_04_adherence_model_inference(self):
        """Verifies routine adherence model evaluates habit consistency accurately."""
        self.assertTrue(os.path.exists(self.adherence_path), "adherence_model.pkl must exist")
        model = joblib.load(self.adherence_path)

        # High consistency: 8.5h sleep, 9 glasses water, 2 stress, 0.5h sun
        high_adh = np.array([[8.5, 9.0, 2.0, 0.5]])
        pred_high = float(model.predict(high_adh)[0])

        # Low consistency: 4h sleep, 1 glass water, 9 stress, 5h sun
        low_adh = np.array([[4.0, 1.0, 9.0, 5.0]])
        pred_low = float(model.predict(low_adh)[0])

        self.assertGreater(pred_high, pred_low, "Consistent habits must produce higher adherence score")
        self.assertGreaterEqual(pred_high, 70.0, "Consistent habits should produce high adherence")

    def test_05_concern_priority_model_inference(self):
        """Verifies multi-output concern priority model triages clinical urgency."""
        self.assertTrue(os.path.exists(self.concern_priority_path), "concern_priority_model.pkl must exist")
        model = joblib.load(self.concern_priority_path)

        # 13 features: stress, sleep, water, sun, skin_type, is_sens, has_acne, rosacea, barrier, pigment, pores, aging, dehy
        # Patient with high stress (9/10), low sleep (4h), oily skin, active acne flag
        sample_acne = np.array([[9.0, 4.0, 6.0, 1.0, 0, 0, 1, 0, 0, 0, 0, 0, 0]])
        preds = model.predict(sample_acne)[0]

        self.assertEqual(len(preds), 7, "Model must output 7 concern urgency scores")
        # Acne is index 0
        acne_urgency = preds[0]
        self.assertGreater(acne_urgency, 0.5, "Acne urgency should be amplified under high stress and sleep deficit")

    def test_06_ingredient_safety_model_inference(self):
        """Verifies multi-output formula safety model predicts barrier safety and risks."""
        self.assertTrue(os.path.exists(self.ingredient_safety_path), "ingredient_safety_model.pkl must exist")
        model = joblib.load(self.ingredient_safety_path)

        # 8 features: [ing_count, max_comedo, mean_comedo, max_irrit, mean_irrit, active_count, allergen_flag, is_sens]
        # Clean gentle formula
        clean_formula = np.array([[8, 0.0, 0.0, 0.0, 0.0, 1, 0, 0]])
        clean_preds = model.predict(clean_formula)[0]

        self.assertEqual(len(clean_preds), 3, "Model must output 3 values: barrier, comedogenic, irritation")
        barrier_safety, comedogenic_risk, irritation_risk = clean_preds

        self.assertGreater(barrier_safety, 75.0, "Clean formula should have high barrier safety score")
        self.assertLess(irritation_risk, 30.0, "Clean formula should have low irritation risk")

        # Harsh comedogenic formula
        harsh_formula = np.array([[22, 4.5, 3.2, 4.0, 2.5, 3, 1, 1]])
        harsh_preds = model.predict(harsh_formula)[0]
        h_barrier, h_comedo, h_irrit = harsh_preds

        self.assertLess(h_barrier, barrier_safety, "Harsh formula must have lower barrier safety than clean formula")
        self.assertGreater(h_irrit, irritation_risk, "Harsh formula must have higher irritation risk than clean formula")


if __name__ == "__main__":
    unittest.main()
