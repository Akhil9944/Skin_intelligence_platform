"""
End-to-End REST API Endpoint Tests (Task 3: Testing & Validations)

Tests the full FastAPI web application using FastAPI TestClient with
an isolated in-memory SQLite database:
1. Authentication: /register, /login, JWT tokens, duplicate prevention, and invalid password protection.
2. Skin Profile: /profile (GET, POST).
3. Telemetry Tracking: /daily-log (GET, POST).
4. Advisory & Regimen: /assessment/routine, /assessment/recommendations.
5. Product Intelligence: /products/recommendations (TF-IDF vector ranking & category filtering).
6. Ingredient Intelligence: /ingredients/analyze (INCI chemical clash detection & safety regressor).
7. Analytics & Simulator: /analytics/simulate, /analytics/adherence, /analytics/detailed-progress.
8. Executive Dashboard: /analytics/executive-summary (KPIs, operational benchmarks).
9. Clinical Health Report: /analytics/clinical-report (5-point radar chart payload).
"""

import os
import sys
import unittest
from starlette.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import Base, get_db
import models
from main import app

# Create in-memory SQLite database specifically for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create all database tables in memory
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the database dependency in FastAPI
app.dependency_overrides[get_db] = override_get_db


class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.test_email = "testpatient@example.com"
        cls.test_password = "securePassword123"
        cls.auth_headers = {}

    # ----------------------------------------------------
    # 1. Authentication Endpoints
    # ----------------------------------------------------
    def test_01_register_new_user(self):
        """Verifies new user registration succeeds."""
        response = self.client.post("/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "role": "User"
        })
        self.assertEqual(response.status_code, 201, f"Registration failed: {response.text}")
        data = response.json()
        self.assertEqual(data["email"], self.test_email)
        self.assertIn("id", data)

    def test_02_register_duplicate_email_rejected(self):
        """Verifies duplicate registration attempt is rejected with 400 Bad Request."""
        response = self.client.post("/register", json={
            "email": self.test_email,
            "password": "anotherPassword123"
        })
        self.assertEqual(response.status_code, 400, "Duplicate email must return 400")

    def test_03_login_wrong_password_rejected(self):
        """Verifies login with wrong password returns 401 Unauthorized."""
        response = self.client.post("/login", data={
            "username": self.test_email,
            "password": "wrongPasswordHere"
        })
        self.assertEqual(response.status_code, 401, "Invalid password must return 401")

    def test_04_login_success_and_jwt_issuance(self):
        """Verifies login returns a valid Bearer JWT access token."""
        response = self.client.post("/login", data={
            "username": self.test_email,
            "password": self.test_password
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

        # Store token for authenticated route tests
        TestAPIEndpoints.auth_headers = {
            "Authorization": f"Bearer {data['access_token']}"
        }

    # ----------------------------------------------------
    # 2. Skin Profile Endpoints
    # ----------------------------------------------------
    def test_05_profile_unauthorized_without_token(self):
        """Verifies accessing protected profile route without token returns 401."""
        response = self.client.get("/profile")
        self.assertEqual(response.status_code, 401)

    def test_06_create_or_update_profile(self):
        """Verifies creating a skin profile returns 200 and matches patient attributes."""
        response = self.client.post(
            "/profile",
            json={
                "skin_type": "Combination",
                "primary_concern": "Acne & Clogged Pores",
                "is_sensitive": True
            },
            headers=self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["skin_type"], "Combination")
        self.assertEqual(data["primary_concern"], "Acne & Clogged Pores")
        self.assertTrue(data["is_sensitive"])

    def test_07_get_profile(self):
        """Verifies retrieving user's saved skin profile."""
        response = self.client.get("/profile", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["skin_type"], "Combination")

    # ----------------------------------------------------
    # 3. Daily Telemetry Log Endpoints
    # ----------------------------------------------------
    def test_08_post_daily_log(self):
        """Verifies submitting a daily lifestyle telemetry log via /tracker/daily."""
        response = self.client.post(
            "/tracker/daily",
            json={
                "date_logged": "2026-10-03",
                "sleep_hours": 8.0,
                "water_glasses": 8,
                "stress_level": 3,
                "sun_exposure_hours": 1.0,
                "weather_condition": "Normal",
                "pollution_exposure": "Low"
            },
            headers=self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["sleep_hours"], 8.0)
        self.assertEqual(data["water_glasses"], 8)

    def test_09_get_daily_logs(self):
        """Verifies retrieving historical daily logs list via /tracker/history."""
        response = self.client.get("/tracker/history", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        logs = response.json()
        self.assertIsInstance(logs, list)
        self.assertGreater(len(logs), 0)

    # ----------------------------------------------------
    # 4. Routine & Advisory Endpoints
    # ----------------------------------------------------
    def test_10_get_personalized_routine(self):
        """Verifies personalized AM/PM skincare routine generation via /routine/generate."""
        response = self.client.get("/routine/generate", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("morning_routine", data)
        self.assertIn("evening_routine", data)
        self.assertGreater(len(data["morning_routine"]), 0)

    def test_11_get_dermatologist_recommendations(self):
        """Verifies doctor advice and advisory notes generation via /assessment/recommendations."""
        response = self.client.get("/assessment/recommendations", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("clinical_summary", data)
        self.assertIn("lifestyle_prescription", data)

    # ----------------------------------------------------
    # 5. Product Recommendation Endpoints
    # ----------------------------------------------------
    def test_12_get_product_recommendations(self):
        """Verifies ML-matched product recommendations endpoint."""
        response = self.client.get("/products/recommendations", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("products", data)
        self.assertGreater(len(data["products"]), 0)
        top_product = data["products"][0]
        self.assertIn("match_percentage", top_product)

    def test_13_get_product_recommendations_with_filter(self):
        """Verifies category filtering in product recommendations."""
        response = self.client.get("/products/recommendations?category=Cleanser", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for p in data["products"]:
            self.assertEqual(p["category"].lower(), "cleanser")

    # ----------------------------------------------------
    # 6. Ingredient Intelligence Endpoints
    # ----------------------------------------------------
    def test_14_analyze_ingredients(self):
        """Verifies INCI cosmetic label chemical analysis endpoint."""
        response = self.client.post(
            "/ingredients/analyze",
            json={
                "ingredients_text": "Water, Glycerin, Niacinamide, Hyaluronic Acid, Ceramide NP",
                "product_name": "Hydrating Gentle Serum"
            },
            headers=self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("overall_safety_score", data)
        self.assertIn("conflicts_detected", data)
        self.assertIn("comedogenic_risk_pct", data)

    # ----------------------------------------------------
    # 7. Analytics & Simulator Endpoints
    # ----------------------------------------------------
    def test_15_simulate_skin_score(self):
        """Verifies What-If habit simulation endpoint."""
        response = self.client.post(
            "/analytics/simulate",
            json={
                "sleep_hours": 8.0,
                "water_glasses": 8,
                "stress_level": 3,
                "sun_exposure_hours": 1.0
            },
            headers=self.auth_headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predicted_score", data)
        self.assertIn("summary_text", data)

    def test_16_get_adherence_analytics(self):
        """Verifies routine adherence analytics endpoint."""
        response = self.client.get("/analytics/adherence", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("adherence_percentage", data)

    def test_17_get_detailed_progress(self):
        """Verifies detailed progress telemetry and ML forecast endpoint."""
        response = self.client.get("/analytics/detailed-progress", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("current_score", data)
        self.assertIn("projected_score_7d", data)

    # ----------------------------------------------------
    # 8. Executive Dashboard Endpoint (Milestone 4 Task 1)
    # ----------------------------------------------------
    def test_18_get_executive_summary(self):
        """Verifies executive summary KPIs and ML operational benchmarks endpoint."""
        response = self.client.get("/analytics/executive-summary", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("kpi_cards", data)
        self.assertIn("ml_models", data)
        self.assertEqual(len(data["ml_models"]), 4)

    # ----------------------------------------------------
    # 9. Clinical Health Report Endpoint (Milestone 4 Task 2)
    # ----------------------------------------------------
    def test_19_get_clinical_report(self):
        """Verifies clinical report endpoint returns 5-point radar visualization data."""
        response = self.client.get("/analytics/clinical-report", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("report_id", data)
        self.assertIn("radar_points", data)
        self.assertEqual(len(data["radar_points"]), 5)
        self.assertIn("morning_routine", data)
        self.assertIn("evening_routine", data)
        self.assertIn("ai_clinical_signoff", data)


if __name__ == "__main__":
    unittest.main()
