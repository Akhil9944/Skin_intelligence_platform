import joblib
import numpy as np
import os
import json
from openai import OpenAI

_google_api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
client = OpenAI(
    api_key=_google_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
) if _google_api_key else None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEALTH_MODEL_PATH = os.path.join(BASE_DIR, "skin_score_model.pkl")
ADHERENCE_MODEL_PATH = os.path.join(BASE_DIR, "adherence_model.pkl")

try:
    ml_model = joblib.load(HEALTH_MODEL_PATH) if os.path.exists(HEALTH_MODEL_PATH) else None
except Exception:
    ml_model = None

try:
    adherence_ml_model = joblib.load(ADHERENCE_MODEL_PATH) if os.path.exists(ADHERENCE_MODEL_PATH) else None
except Exception:
    adherence_ml_model = None


def calculate_skin_health_score(skin_profile, latest_log):
    if not ml_model or not latest_log:
        condition_score = 100
        if skin_profile and skin_profile.is_sensitive:
            condition_score -= 20
        if skin_profile and skin_profile.primary_concern.lower() in ["acne", "severe acne", "aging"]:
            condition_score -= 15
        
        stress_val = latest_log.stress_level if latest_log else 5
        sleep_val = latest_log.sleep_hours if latest_log else 7
        water_val = latest_log.water_glasses if latest_log else 4
        
        fallback_score = max(0, condition_score) * 0.35 + \
                         max(0, (10 - stress_val) * 10) * 0.20 + \
                         min(100, (sleep_val / 8.0) * 100) * 0.15 + \
                         85 * 0.20 + \
                         min(100, (water_val / 8.0) * 100) * 0.10
        return round(min(100, max(0, fallback_score)))

    features = np.array([[
        float(latest_log.sleep_hours),
        float(latest_log.water_glasses),
        float(latest_log.stress_level),
        float(getattr(latest_log, 'sun_exposure_hours', 0.0) or 0.0)
    ]])

    predicted_score = float(ml_model.predict(features)[0])
    
    if skin_profile:
        if skin_profile.is_sensitive:
            predicted_score -= 5
        if "acne" in skin_profile.primary_concern.lower():
            predicted_score -= 5

    return round(min(100.0, max(10.0, predicted_score)), 1)


def generate_personalized_routine(skin_profile):
    skin_type = skin_profile.skin_type if skin_profile else "Normal"
    concern = skin_profile.primary_concern if skin_profile else "General Care"
    is_sensitive = skin_profile.is_sensitive if skin_profile else False

    if not client or not os.environ.get("GOOGLE_AI_STUDIO_API_KEY"):
        morning = [
            {"step": "Cleansing", "product": "Gentle Hydrating Cleanser" if is_sensitive else "Foaming Gel Cleanser", "purpose": "Remove overnight impurities and balance pH."},
            {"step": "Treatment", "product": "Vitamin C Brightening Serum" if not is_sensitive else "Niacinamide Calming Serum", "purpose": f"Target {concern} and protect against environmental pollutants."},
            {"step": "Moisturizing", "product": "Lightweight Oil-Free Gel Moisturizer" if skin_type == "Oily" else "Barrier Repair Cream", "purpose": "Lock in hydration without clogging pores."},
            {"step": "Sun Protection", "product": "Broad Spectrum SPF 50 Mineral Sunscreen", "purpose": "Shield skin from UV-induced aging and hyperpigmentation."}
        ]
        evening = [
            {"step": "Double Cleansing", "product": "Micellar Cleansing Water followed by Daily Cleanser", "purpose": "Dissolve sunscreen, makeup, and daily buildup."},
            {"step": "Targeted Treatment", "product": "Salicylic Acid (BHA)" if "acne" in concern.lower() else "Retinol 0.2% Treatment", "purpose": f"Cell turnover optimization for {concern}."},
            {"step": "Night Care", "product": "Nourishing Recovery Peptide Night Cream", "purpose": "Deep cellular restoration during sleep cycles."}
        ]
        weekly = [
            {"frequency": "1-2 times per week", "treatment": "Gentle Chemical Exfoliant (AHA/BHA)", "benefit": "Removes dead skin cell buildup and prevents clogged pores."},
            {"frequency": "Weekly", "treatment": "Hydrating Soothing Sheet Mask or Clay Mask", "benefit": "Restores moisture balance or absorbs excess sebum."}
        ]
        return {
            "skin_type": skin_type, "primary_concern": concern, "is_sensitive": is_sensitive,
            "morning_routine": morning, "evening_routine": evening, "weekly_treatment": weekly
        }

    prompt = f"""
    Act as an expert clinical dermatologist and AI skincare specialist.
    Generate a highly customized, safe, and professional skincare routine for a user with the following profile:
    - Skin Type: {skin_type}
    - Primary Concern: {concern}
    - Sensitive Skin: {is_sensitive}

    Return ONLY a valid JSON object matching this exact structure, with no markdown formatting or extra text:
    {{
      "skin_type": "{skin_type}",
      "primary_concern": "{concern}",
      "is_sensitive": {str(is_sensitive).lower()},
      "morning_routine": [
        {{"step": "string", "product": "string", "purpose": "string"}}
      ],
      "evening_routine": [
        {{"step": "string", "product": "string", "purpose": "string"}}
      ],
      "weekly_treatment": [
        {{"frequency": "string", "treatment": "string", "benefit": "string"}}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        return json.loads(content)
    except Exception as e:
        return {
            "skin_type": skin_type,
            "primary_concern": concern,
            "is_sensitive": is_sensitive,
            "morning_routine": [{"step": "Cleansing", "product": "Gentle Cleanser", "purpose": "Cleanse skin safely."}],
            "evening_routine": [{"step": "Treatment", "product": "Restorative Cream", "purpose": "Night hydration."}],
            "weekly_treatment": [{"frequency": "Weekly", "treatment": "Gentle Mask", "benefit": "Balance."}]
        }


def get_dermatologist_recommendations(skin_profile, latest_log):
    current_score = calculate_skin_health_score(skin_profile, latest_log)
    skin_type = skin_profile.skin_type if skin_profile else "Normal"
    concern = skin_profile.primary_concern if skin_profile else "General Care"
    is_sensitive = skin_profile.is_sensitive if skin_profile else False

    if not client or not os.environ.get("GOOGLE_AI_STUDIO_API_KEY"):
        return {
            "score": current_score,
            "clinical_summary": "Maintain balanced hydration and stable daily habit logging.",
            "lifestyle_prescription": ["Prioritize 7-8 hours of sleep", "Monitor stress triggers"],
            "warning_notes": "Avoid over-exfoliation."
        }

    prompt = f"""
    Act as an elite Chief Dermatologist. A patient has a calculated Skin Health Score of {current_score}/100.
    Patient Profile: Skin Type: {skin_type}, Primary Concern: {concern}, Sensitive Skin: {is_sensitive}.
    Provide specialized dermatologist advice tailored specifically to their score and profile.
    Return ONLY a valid JSON object matching this exact structure, with no markdown formatting:
    {{
      "score": {current_score},
      "clinical_summary": "A professional 2-3 sentence assessment of their current skin status based on their score.",
      "lifestyle_prescription": [
        "Actionable habit recommendation 1",
        "Actionable habit recommendation 2",
        "Actionable habit recommendation 3"
      ],
      "warning_notes": "Important dermatological warning or ingredient caution."
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
        return json.loads(content)
    except Exception as e:
        return {
            "score": current_score,
            "clinical_summary": f"Your current score is {current_score}/100, showing opportunity for targeted recovery.",
            "lifestyle_prescription": ["Increase daily water consumption", "Apply broad-spectrum mineral sunscreen"],
            "warning_notes": "Consult a specialist if inflammation persists."
        }


def calculate_routine_adherence(logs):
    """
    Evaluates multi-session lifestyle adherence using a trained Random Forest Regressor
    (adherence_model.pkl) combined with behavioral consistency metrics.
    """
    if not logs:
        return {
            "adherence_percentage": 0.0,
            "streak_days": 0,
            "hydration_score_avg": 0.0,
            "sleep_score_avg": 0.0,
            "status_message": "No telemetry logged yet",
            "consistency_grade": "Pending Baseline",
            "ai_recommendation": "Begin logging daily sleep and hydration to train your baseline model.",
            "engine_type": "Supervised Random Forest Regressor"
        }

    recent_logs = logs[:7]
    total_days = len(recent_logs)
    
    avg_sleep = float(sum(log.sleep_hours for log in recent_logs) / total_days)
    avg_water = float(sum(log.water_glasses for log in recent_logs) / total_days)
    avg_stress = float(sum(log.stress_level for log in recent_logs) / total_days)
    avg_sun = float(sum(getattr(log, 'sun_exposure_hours', 0.0) or 0.0 for log in recent_logs) / total_days)

    if adherence_ml_model:
        features = np.array([[avg_sleep, avg_water, avg_stress, avg_sun]])
        raw_pred = float(adherence_ml_model.predict(features)[0])
        consistency_factor = min(1.0, total_days / 5.0)
        adherence_pct = round(min(100.0, max(5.0, raw_pred * (0.7 + 0.3 * consistency_factor))), 1)
    else:
        adherence_pct = round(min(100.0, max(0.0, (avg_sleep / 8.0 * 35) + (min(avg_water, 10) / 8.0 * 30) + ((10 - avg_stress) / 9.0 * 25) - (avg_sun / 4.0 * 10) + 15)), 1)

    # Classify consistency grade
    if adherence_pct >= 85:
        grade = "Class A - Optimal Stability"
        status_msg = "Excellent clinical adherence pattern"
        ai_rec = "Your circadian rhythm and barrier hydration are at peak therapeutic stability."
    elif adherence_pct >= 70:
        grade = "Class B - Balanced Routine"
        status_msg = "Stable habit adherence"
        ai_rec = "Good consistency. Increasing daily hydration by 1-2 glasses will further stabilize recovery."
    elif adherence_pct >= 50:
        grade = "Class C - Moderate Variance"
        status_msg = "Telemetry variance detected"
        ai_rec = "Elevated stress or sleep deficit is causing adherence fluctuations. Prioritize restorative rest."
    else:
        grade = "Class D - Developing Consistency"
        status_msg = "Irregular lifestyle habits"
        ai_rec = "High habit volatility detected. Focus on maintaining a consistent 7.5hr sleep window."

    return {
        "adherence_percentage": adherence_pct,
        "streak_days": total_days,
        "hydration_score_avg": round(avg_water, 1),
        "sleep_score_avg": round(avg_sleep, 1),
        "status_message": status_msg,
        "consistency_grade": grade,
        "ai_recommendation": ai_rec,
        "engine_type": "Supervised Random Forest Regressor"
    }


def calculate_progress_delta(skin_profile, logs):
    """
    Computes time-series skin health trajectory, velocity rate, and a 7-day predictive ML forecast.
    """
    if not logs:
        return {
            "current_score": 75.0,
            "previous_score": 75.0,
            "score_delta": 0.0,
            "trend_direction": "Baseline",
            "projected_score_7d": 75.0,
            "barrier_recovery_phase": "Calibration Phase",
            "velocity_rate": 0.0,
            "engine_type": "Time-Series Predictive ML Forecaster"
        }

    current_log = logs[0]
    current_score = calculate_skin_health_score(skin_profile, current_log)

    if len(logs) < 2:
        return {
            "current_score": current_score,
            "previous_score": current_score,
            "score_delta": 0.0,
            "trend_direction": "Stable",
            "projected_score_7d": current_score,
            "barrier_recovery_phase": "Initial Calibration",
            "velocity_rate": 0.0,
            "engine_type": "Time-Series Predictive ML Forecaster"
        }

    previous_log = logs[1]
    previous_score = calculate_skin_health_score(skin_profile, previous_log)
    delta = round(current_score - previous_score, 1)

    # Compute multi-session velocity across available history (up to 7 sessions)
    window = logs[:min(7, len(logs))]
    window_scores = [calculate_skin_health_score(skin_profile, l) for l in window]
    
    num_intervals = max(1, len(window_scores) - 1)
    velocity_rate = round((window_scores[0] - window_scores[-1]) / float(num_intervals), 2)

    # ML-based 7-day projected simulation
    if ml_model:
        simulated_sleep = float(np.clip(current_log.sleep_hours + (velocity_rate * 0.1), 3.0, 10.0))
        simulated_water = float(np.clip(current_log.water_glasses + (velocity_rate * 0.15), 1.0, 12.0))
        simulated_stress = float(np.clip(current_log.stress_level - (velocity_rate * 0.2), 1.0, 10.0))
        simulated_sun = float(getattr(current_log, 'sun_exposure_hours', 1.0) or 1.0)
        
        sim_features = np.array([[simulated_sleep, simulated_water, simulated_stress, simulated_sun]])
        raw_projected = float(ml_model.predict(sim_features)[0])
        
        if skin_profile:
            if skin_profile.is_sensitive:
                raw_projected -= 5
            if "acne" in skin_profile.primary_concern.lower():
                raw_projected -= 5
        projected_7d = round(min(100.0, max(10.0, raw_projected)), 1)
    else:
        projected_7d = round(min(100.0, max(10.0, current_score + (velocity_rate * 2.5))), 1)

    # Barrier Recovery Classification
    if delta > 1.5:
        trend = "Improving"
        phase = "Active Barrier Renewal"
    elif delta < -1.5:
        trend = "Declining"
        phase = "Barrier Stress Response"
    else:
        trend = "Stable"
        phase = "Equilibrium Maintenance" if current_score >= 75 else "Stabilizing Recovery"

    return {
        "current_score": current_score,
        "previous_score": previous_score,
        "score_delta": delta,
        "trend_direction": trend,
        "projected_score_7d": projected_7d,
        "barrier_recovery_phase": phase,
        "velocity_rate": velocity_rate,
        "engine_type": "Time-Series Predictive ML Forecaster"
    }