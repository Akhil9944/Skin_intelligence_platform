"""
Tests for Data & Schema Validations (Task 3: Testing & Validations)

Validates Pydantic schema validation rules:
1. DailyTrackerCreate: Validates bounds on sleep (0-24), water (>=0), stress (1-10), and sun (0-24).
2. UserCreate: Validates email presence and password minimum length (>=6).
3. SkinProfileCreate: Validates non-empty skin type and primary concern.
4. SimulationRequest: Validates boundary values for habit simulator sliders.
5. IngredientAnalysisRequest: Validates non-empty cosmetic label text.
"""

import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pydantic import ValidationError

import schemas
from main import SimulationRequest, IngredientAnalysisRequest


class TestSchemaValidations(unittest.TestCase):
    # ----------------------------------------------------
    # 1. Daily Tracker Telemetry Validations
    # ----------------------------------------------------
    def test_01_daily_tracker_valid_payload(self):
        """Verifies valid daily telemetry passes validation cleanly."""
        payload = schemas.DailyTrackerCreate(
            date_logged="2026-10-03",
            sleep_hours=7.5,
            water_glasses=8,
            stress_level=4,
            sun_exposure_hours=1.5,
            weather_condition="Sunny",
            pollution_exposure="Moderate"
        )
        self.assertEqual(payload.sleep_hours, 7.5)
        self.assertEqual(payload.water_glasses, 8)
        self.assertEqual(payload.stress_level, 4)

    def test_02_daily_tracker_rejects_negative_sleep(self):
        """Verifies negative sleep hours are rejected by validation."""
        with self.assertRaises(ValidationError):
            schemas.DailyTrackerCreate(
                date_logged="2026-10-03",
                sleep_hours=-1.0,
                water_glasses=8,
                stress_level=4
            )

    def test_03_daily_tracker_rejects_impossible_sleep(self):
        """Verifies sleep hours > 24 are rejected by validation."""
        with self.assertRaises(ValidationError):
            schemas.DailyTrackerCreate(
                date_logged="2026-10-03",
                sleep_hours=25.0,
                water_glasses=8,
                stress_level=4
            )

    def test_04_daily_tracker_rejects_negative_water(self):
        """Verifies negative glasses of water are rejected by validation."""
        with self.assertRaises(ValidationError):
            schemas.DailyTrackerCreate(
                date_logged="2026-10-03",
                sleep_hours=7.0,
                water_glasses=-3,
                stress_level=4
            )

    def test_05_daily_tracker_rejects_stress_out_of_bounds(self):
        """Verifies stress level outside 1-10 is rejected by validation."""
        # Below minimum (0)
        with self.assertRaises(ValidationError):
            schemas.DailyTrackerCreate(
                date_logged="2026-10-03",
                sleep_hours=7.0,
                water_glasses=8,
                stress_level=0
            )

        # Above maximum (11)
        with self.assertRaises(ValidationError):
            schemas.DailyTrackerCreate(
                date_logged="2026-10-03",
                sleep_hours=7.0,
                water_glasses=8,
                stress_level=11
            )

    # ----------------------------------------------------
    # 2. User & Authentication Validations
    # ----------------------------------------------------
    def test_06_user_create_valid_credentials(self):
        """Verifies valid email and password format pass validation."""
        user = schemas.UserCreate(email="member@clinic.com", password="securePass123")
        self.assertEqual(user.email, "member@clinic.com")
        self.assertEqual(user.role, "User")

    def test_07_user_create_rejects_short_password(self):
        """Verifies password shorter than 6 characters is rejected for security."""
        with self.assertRaises(ValidationError):
            schemas.UserCreate(email="member@clinic.com", password="123")

    # ----------------------------------------------------
    # 3. Skin Profile Validations
    # ----------------------------------------------------
    def test_08_skin_profile_valid(self):
        """Verifies valid skin profile attributes pass validation."""
        profile = schemas.SkinProfileCreate(
            skin_type="Combination",
            primary_concern="Acne & Pores",
            is_sensitive=True
        )
        self.assertEqual(profile.skin_type, "Combination")
        self.assertTrue(profile.is_sensitive)

    def test_09_skin_profile_rejects_empty_fields(self):
        """Verifies empty strings for skin type or concern are rejected."""
        with self.assertRaises(ValidationError):
            schemas.SkinProfileCreate(skin_type="", primary_concern="Acne")

        with self.assertRaises(ValidationError):
            schemas.SkinProfileCreate(skin_type="Oily", primary_concern="")

    # ----------------------------------------------------
    # 4. Simulation & Ingredient Request Validations
    # ----------------------------------------------------
    def test_10_simulation_request_valid_and_bounds(self):
        """Verifies simulator slider boundaries (sleep 0-24, stress 1-10)."""
        valid_sim = SimulationRequest(sleep_hours=8.0, water_glasses=8, stress_level=3)
        self.assertEqual(valid_sim.sleep_hours, 8.0)

        # Rejects negative sleep
        with self.assertRaises(ValidationError):
            SimulationRequest(sleep_hours=-2.0, water_glasses=8, stress_level=3)

        # Rejects stress > 10
        with self.assertRaises(ValidationError):
            SimulationRequest(sleep_hours=8.0, water_glasses=8, stress_level=15)

    def test_11_ingredient_analysis_request_validation(self):
        """Verifies ingredient request requires non-empty text."""
        valid_req = IngredientAnalysisRequest(ingredients_text="Water, Glycerin, Ceramide NP")
        self.assertIn("Water", valid_req.ingredients_text)

        with self.assertRaises(ValidationError):
            IngredientAnalysisRequest(ingredients_text="")


if __name__ == "__main__":
    unittest.main()
