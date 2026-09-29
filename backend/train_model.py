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

# ----------------------------------------------------
# 3. Train Clinical Concern Priority ML Model (Random Forest MultiOutputRegressor)
# ----------------------------------------------------
# Features (13 dims):
# [stress_level (1-10), sleep_hours (0-12), water_glasses (0-15), sun_exposure_hours (0-10),
#  skin_type_enc (0=Oily, 1=Dry, 2=Combo, 3=Normal), is_sensitive (0/1),
#  has_acne, has_rosacea, has_barrier, has_pigmentation, has_pores, has_aging, has_dehydration]
#
# Targets (7 dims): Urgency Scores [0.0 to 1.0] for:
# [acne, rosacea, barrier, pigmentation, pores, aging, dehydration]
np.random.seed(2026)
N_SAMPLES = 2000

stress = np.random.uniform(1.0, 10.0, N_SAMPLES)
sleep = np.random.uniform(3.0, 11.0, N_SAMPLES)
water = np.random.uniform(1.0, 14.0, N_SAMPLES)
sun = np.random.uniform(0.0, 9.0, N_SAMPLES)
skin_type = np.random.choice([0, 1, 2, 3], size=N_SAMPLES)
is_sens = np.random.choice([0, 1], size=N_SAMPLES, p=[0.65, 0.35])

# Random selection of 1 to 4 active concerns per patient
concern_flags = np.random.choice([0, 1], size=(N_SAMPLES, 7), p=[0.6, 0.4])
# Ensure each sample has at least one active concern
no_concern_idx = np.where(concern_flags.sum(axis=1) == 0)[0]
for idx in no_concern_idx:
    concern_flags[idx, np.random.randint(0, 7)] = 1

X_priority = np.column_stack([
    stress, sleep, water, sun, skin_type, is_sens, concern_flags
])

# Base clinical urgencies:
# Tier 1 (Acute/Barrier): Acne=0.65, Rosacea=0.65, Barrier=0.70
# Tier 2 (Tone/Pores): Pigmentation=0.45, Pores=0.40
# Tier 3 (Maintenance): Aging=0.30, Dehydration=0.30
base_urgency = np.array([0.65, 0.65, 0.70, 0.45, 0.40, 0.30, 0.30])
Y_priority = np.zeros((N_SAMPLES, 7))

for i in range(N_SAMPLES):
    for j in range(7):
        if concern_flags[i, j] == 1:
            u = base_urgency[j]
            # Cortisol / Stress & Sleep deprivation impacts on acute inflammatory conditions
            if j in [0, 2]:  # Acne, Barrier
                u += (stress[i] / 10.0) * 0.22 - (sleep[i] / 10.0) * 0.15
            # UV exposure impacts on pigmentation and erythema
            if j in [1, 3]:  # Rosacea, Pigmentation
                u += (sun[i] / 8.0) * 0.25
            # Hydration deficit impacts dehydration
            if j == 6:  # Dehydration
                u += max(0, (8.0 - water[i]) / 8.0) * 0.35
            # Sensitivity impacts barrier & rosacea
            if is_sens[i] == 1 and j in [1, 2]:
                u += 0.20
            # Skin type modulation
            if skin_type[i] == 0 and j in [0, 4]:  # Oily -> Acne, Pores
                u += 0.12
            if skin_type[i] == 1 and j in [5, 6]:  # Dry -> Aging, Dehydration
                u += 0.12
            Y_priority[i, j] = u
        else:
            Y_priority[i, j] = 0.0

Y_priority += np.random.normal(0, 0.02, size=Y_priority.shape)
Y_priority = np.clip(Y_priority, 0.0, 1.0)
# Mask inactive concerns strictly to 0
Y_priority = Y_priority * concern_flags

priority_model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42)
priority_model.fit(X_priority, Y_priority)

priority_path = os.path.join(CURRENT_DIR, "concern_priority_model.pkl")
joblib.dump(priority_model, priority_path)
print(f"ML Clinical Concern Priority Regressor successfully trained and saved as {priority_path}")

# ----------------------------------------------------
# 4. Train Formula Safety & Irritancy ML Regressor (Random Forest MultiOutput)
# ----------------------------------------------------
# Features (8 dims):
# [ingredient_count, max_comedogenic (0-5), mean_comedogenic (0-5),
#  max_irritancy (0-5), mean_irritancy (0-5), high_potency_active_count,
#  allergen_flag (0/1), is_sensitive (0/1)]
#
# Targets (3 continuous dims):
# 1. barrier_safety_score (0-100)
# 2. comedogenic_risk_pct (0-100%)
# 3. irritation_risk_pct (0-100%)

np.random.seed(3030)
N_FORMULAS = 2500

ing_count = np.random.randint(3, 35, N_FORMULAS)
max_comedo = np.random.uniform(0.0, 5.0, N_FORMULAS)
mean_comedo = np.clip(max_comedo * np.random.uniform(0.2, 0.7, N_FORMULAS), 0.0, 5.0)

max_irrit = np.random.uniform(0.0, 5.0, N_FORMULAS)
mean_irrit = np.clip(max_irrit * np.random.uniform(0.2, 0.7, N_FORMULAS), 0.0, 5.0)

active_count = np.random.choice([0, 1, 2, 3, 4], size=N_FORMULAS, p=[0.25, 0.40, 0.20, 0.10, 0.05])
has_allergen = np.random.choice([0, 1], size=N_FORMULAS, p=[0.7, 0.3])
is_sens_patient = np.random.choice([0, 1], size=N_FORMULAS, p=[0.65, 0.35])

X_ingredient = np.column_stack([
    ing_count, max_comedo, mean_comedo, max_irrit, mean_irrit, active_count, has_allergen, is_sens_patient
])

# 1. Safety Score
safety = 100.0 - (mean_irrit * 8.0) - (max_irrit * 4.5) - (active_count * 5.0) - (has_allergen * 10.0)
safety -= (is_sens_patient * (has_allergen * 15.0 + max_irrit * 4.0))
safety += np.random.normal(0, 2.0, N_FORMULAS)
safety = np.clip(safety, 5.0, 100.0)

# 2. Comedogenic Risk %
comedo_risk = (mean_comedo * 12.0) + (max_comedo * 8.0)
comedo_risk += np.random.normal(0, 1.5, N_FORMULAS)
comedo_risk = np.clip(comedo_risk, 0.0, 100.0)

# 3. Irritation Risk %
irrit_risk = (mean_irrit * 12.0) + (max_irrit * 8.0) + (active_count * 7.0) + (has_allergen * 14.0)
irrit_risk += (is_sens_patient * 12.0)
irrit_risk += np.random.normal(0, 1.5, N_FORMULAS)
irrit_risk = np.clip(irrit_risk, 0.0, 100.0)

Y_ingredient = np.column_stack([safety, comedo_risk, irrit_risk])

ingredient_model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42)
ingredient_model.fit(X_ingredient, Y_ingredient)

ing_model_path = os.path.join(CURRENT_DIR, "ingredient_safety_model.pkl")
joblib.dump(ingredient_model, ing_model_path)
print(f"ML Ingredient Safety Regressor successfully trained and saved as {ing_model_path}")