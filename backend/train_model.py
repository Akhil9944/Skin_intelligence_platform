import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

# Generate synthetic historical tracking data
# Features: [sleep_hours, water_glasses, stress_level, sun_exposure_hours]
np.random.seed(42)
X = np.random.rand(1000, 4) * [10, 12, 9, 8] + [2, 0, 1, 0] 

# Calculate target skin health score (0-100) with weighted heuristics + noise
y = (X[:, 0] * 3.5) + (X[:, 1] * 2.5) - (X[:, 2] * 4.5) - (X[:, 3] * 2.0) + 45
y = np.clip(y, 10, 100) # Ensure score stays within valid bounds

# Train Random Forest Regressor
model = RandomForestRegressor(n_estimators=150, random_state=42)
model.fit(X, y)

# Save the trained model artifact
joblib.dump(model, "skin_score_model.pkl")
print("ML Skin Score Regressor successfully trained and saved as skin_score_model.pkl")