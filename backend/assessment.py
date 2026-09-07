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

MODEL_PATH = "skin_score_model.pkl"
try:
    if os.path.exists(MODEL_PATH):
        ml_model = joblib.load(MODEL_PATH)
    else:
        ml_model = None
except Exception:
    ml_model = None


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
    if not logs:
        return {"adherence_percentage": 0.0, "streak_days": 0, "hydration_avg": 0.0, "sleep_avg": 0.0, "status_message": "No logs recorded yet"}
    
    recent_logs = logs[:7]
    total_days = len(recent_logs)
    adherence_points = 0
    
    total_sleep = sum(log.sleep_hours for log in recent_logs)
    total_water = sum(log.water_glasses for log in recent_logs)
    
    for log in recent_logs:
        day_score = 0
        if log.sleep_hours >= 7.0:
            day_score += 1
        if log.water_glasses >= 8:
            day_score += 1
        if log.stress_level <= 5:
            day_score += 1
        if day_score >= 2:
            adherence_points += 1
            
    percentage = round((adherence_points / total_days) * 100.0, 1)
    return {
        "adherence_percentage": percentage,
        "streak_days": total_days,
        "hydration_avg": round(total_water / total_days, 1),
        "sleep_avg": round(total_sleep / total_days, 1),
        "status_message": "High consistency" if percentage >= 75 else "Room for consistency improvement"
    }


def calculate_progress_delta(skin_profile, logs):
    if not logs or len(logs) < 2:
        current = calculate_skin_health_score(skin_profile, logs[0] if logs else None)
        return {"current_score": current, "previous_score": current, "score_delta": 0.0, "trend_direction": "Stable"}
        
    current_log = logs[0]
    previous_log = logs[1]
    
    current_score = calculate_skin_health_score(skin_profile, current_log)
    previous_score = calculate_skin_health_score(skin_profile, previous_log)
    
    delta = round(current_score - previous_score, 1)
    direction = "Improving" if delta > 0 else ("Declining" if delta < 0 else "Stable")
    
    return {
        "current_score": current_score,
        "previous_score": previous_score,
        "score_delta": delta,
        "trend_direction": direction
    }