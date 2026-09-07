import os
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# ----------------------------------------------------
# 1. Train Skin Health Score Regressor (Random Forest)
# ----------------------------------------------------
# Features: [sleep_hours, water_glasses, stress_level, sun_exposure_hours]
np.random.seed(42)
X_health = np.random.rand(1200, 4) * [10, 12, 9, 8] + [2, 0, 1, 0] 

# Calculate target skin health score (10-100) with clinical heuristics + noise
y_health = (X_health[:, 0] * 3.5) + (X_health[:, 1] * 2.5) - (X_health[:, 2] * 4.5) - (X_health[:, 3] * 2.0) + 45
y_health += np.random.normal(0, 1.5, size=y_health.shape)
y_health = np.clip(y_health, 10, 100)

health_model = RandomForestRegressor(n_estimators=150, random_state=42)
health_model.fit(X_health, y_health)

health_path = os.path.join(CURRENT_DIR, "skin_score_model.pkl")
joblib.dump(health_model, health_path)
print(f"ML Skin Score Regressor successfully trained and saved as {health_path}")

# ----------------------------------------------------
# 2. Train Routine Adherence ML Model (Random Forest)
# ----------------------------------------------------
# Features: [avg_sleep_hours, avg_water_glasses, avg_stress_level, avg_sun_exposure]
# Target: Clinical Routine Adherence Score (0-100%)
np.random.seed(101)
X_adh = np.random.rand(1200, 4) * [10, 12, 9, 8] + [2, 0, 1, 0]

sleep_score = np.clip(X_adh[:, 0] / 8.0, 0, 1.25) * 35.0
water_score = np.clip(X_adh[:, 1] / 8.0, 0, 1.25) * 30.0
stress_score = np.clip((10.0 - X_adh[:, 2]) / 9.0, 0, 1.0) * 25.0
sun_penalty = np.clip(X_adh[:, 3] / 6.0, 0, 1.0) * 10.0

y_adh = sleep_score + water_score + stress_score - sun_penalty + 10.0
y_adh += np.random.normal(0, 2.0, size=y_adh.shape)
y_adh = np.clip(y_adh, 5, 100)

adh_model = RandomForestRegressor(n_estimators=120, random_state=42)
adh_model.fit(X_adh, y_adh)

adh_path = os.path.join(CURRENT_DIR, "adherence_model.pkl")
joblib.dump(adh_model, adh_path)
print(f"ML Routine Adherence Regressor successfully trained and saved as {adh_path}")