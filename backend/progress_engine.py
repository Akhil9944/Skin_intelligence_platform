"""
Simple AI & ML-Powered Progress Tracking Engine.

How it works:
1. Machine Learning:
   - Uses skin_score_model.pkl to calculate daily skin health scores over time.
   - Calculates a 7-day future ML forecast target.
   - Measures simple real-world habit impacts (sleep, water, stress).
2. Generative AI (Gemini 2.5 Flash):
   - Acts as an encouraging AI Skin Coach, summarizing progress in 2 friendly sentences.
"""

import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEALTH_MODEL_PATH = os.path.join(BASE_DIR, "skin_score_model.pkl")

try:
    ml_model = joblib.load(HEALTH_MODEL_PATH) if os.path.exists(HEALTH_MODEL_PATH) else None
except Exception:
    ml_model = None

# Optional Generative AI client
try:
    from openai import OpenAI
    _google_api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
    client = OpenAI(
        api_key=_google_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    ) if _google_api_key else None
except Exception:
    client = None


def compute_log_score(skin_profile, log) -> float:
    """Helper to calculate skin health score for a single daily log."""
    if not log:
        return 75.0

    sleep = float(getattr(log, "sleep_hours", 7.0) or 7.0)
    water = float(getattr(log, "water_glasses", 8) or 8)
    stress = float(getattr(log, "stress_level", 4) or 4)
    sun = float(getattr(log, "sun_exposure_hours", 1.0) or 1.0)

    if ml_model:
        try:
            features = np.array([[sleep, water, stress, sun]])
            score = float(ml_model.predict(features)[0])
            if skin_profile and getattr(skin_profile, "is_sensitive", False):
                score -= 4.0
            return round(float(np.clip(score, 10.0, 99.0)), 1)
        except Exception:
            pass

    # Simple mathematical fallback
    base = 50.0 + (sleep * 3.5) + (water * 2.0) - (stress * 2.5)
    return round(float(np.clip(base, 20.0, 95.0)), 1)


def generate_ai_coach_note(current_score: float, delta: float, avg_sleep: float, avg_water: float) -> str:
    """Generates a friendly 2-sentence encouraging progress note from the AI Coach."""
    if client:
        try:
            trend_text = f"increased by +{delta} points" if delta > 0 else f"changed by {delta} points"
            prompt = (
                f"Act as a friendly, supportive AI Skin Coach. "
                f"The user's skin health score is now {current_score}/100 ({trend_text}). "
                f"They average {avg_sleep:.1f} hours of sleep and {avg_water:.0f} glasses of water daily. "
                f"In 2 simple, encouraging sentences (under 30 words), explain how their habits are helping "
                f"their skin and motivate them to keep it up. Use everyday friendly English, no medical jargon."
            )
            resp = client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60
            )
            text = resp.choices[0].message.content.strip().replace('"', '')
            if len(text) > 15:
                return text
        except Exception:
            pass

    # Friendly instant fallback
    if delta >= 0:
        return f"Great job! Your skin score reached {current_score}/100 with a +{delta} point improvement. Your steady hydration and sleep are helping your skin barrier glow!"
    else:
        return f"Your skin score is at {current_score}/100. Adding just one extra glass of water and getting 30 more minutes of sleep will quickly bounce your score back up!"


def get_detailed_progress(skin_profile, logs: list):
    """
    Computes complete progress telemetry, habit impacts, ML 7-day forecast,
    and AI coach feedback.
    """
    if not logs:
        # Default baseline for brand new users
        return {
            "current_score": 75.0,
            "previous_score": 75.0,
            "score_change": 0.0,
            "trend_label": "Starting Baseline",
            "trend_status": "good",
            "projected_score_7d": 78.0,
            "logging_streak": 0,
            "total_logs": 0,
            "ai_coach_note": "Welcome to your skin progress journey! Log your daily habits in the Daily Tracker to see your skin score grow.",
            "habit_impacts": [
                {
                    "name": "Sleep Recovery",
                    "value": "7.5 hrs avg",
                    "impact": "+4 pts",
                    "status": "positive",
                    "simple_note": "Consistent sleep gives skin cells time to repair and rebuild barrier lipids."
                },
                {
                    "name": "Water Hydration",
                    "value": "8 glasses avg",
                    "impact": "+5 pts",
                    "status": "positive",
                    "simple_note": "Drinking enough water keeps epidermal cells plump and prevents tightness."
                },
                {
                    "name": "Stress Control",
                    "value": "Calm",
                    "impact": "+3 pts",
                    "status": "positive",
                    "simple_note": "Low stress stops cortisol from triggering excess oil and inflammatory redness."
                }
            ],
            "history_points": [],
            "milestones": [
                {"title": "Skin Journey Begun", "desc": "Account created and ready to track", "earned": True, "icon": "sparkles"},
                {"title": "3-Day Streak", "desc": "Log habits 3 days in a row", "earned": False, "icon": "flame"},
                {"title": "Hydration Champion", "desc": "Drink 8+ glasses of water", "earned": False, "icon": "droplet"},
                {"title": "Barrier Healer", "desc": "Reach a skin health score of 80+", "earned": False, "icon": "shield"}
            ]
        }

    # Logs are ordered newest first from query
    current_log = logs[0]
    current_score = compute_log_score(skin_profile, current_log)

    if len(logs) > 1:
        previous_log = logs[1]
        previous_score = compute_log_score(skin_profile, previous_log)
        score_change = round(current_score - previous_score, 1)
    else:
        previous_score = current_score
        score_change = 0.0

    # Trend status
    if score_change > 1.0:
        trend_label = "Improving Health"
        trend_status = "positive"
    elif score_change < -1.0:
        trend_label = "Slight Dip"
        trend_status = "caution"
    else:
        trend_label = "Stable & Balanced"
        trend_status = "good"

    # Compute averages across up to 7 most recent logs
    recent_logs = logs[:min(7, len(logs))]
    avg_sleep = float(np.mean([float(l.sleep_hours or 7.0) for l in recent_logs]))
    avg_water = float(np.mean([float(l.water_glasses or 8.0) for l in recent_logs]))
    avg_stress = float(np.mean([float(l.stress_level or 4.0) for l in recent_logs]))

    # 7-Day ML Forecast Target:
    # If user maintains healthy habits, ML forecasts next week's score
    if ml_model:
        sim_sleep = float(np.clip(avg_sleep + 0.3, 4.0, 9.5))
        sim_water = float(np.clip(avg_water + 0.5, 3.0, 12.0))
        sim_stress = float(np.clip(avg_stress - 0.5, 1.0, 10.0))
        sim_features = np.array([[sim_sleep, sim_water, sim_stress, 1.0]])
        projected_score_7d = round(float(np.clip(ml_model.predict(sim_features)[0], 15.0, 99.0)), 1)
    else:
        projected_score_7d = round(min(98.0, current_score + (1.5 if score_change >= 0 else 2.5)), 1)

    # Habit impacts in simple everyday terms
    habit_impacts = []

    # 1. Sleep Impact
    if avg_sleep >= 7.0:
        sleep_impact = "+5 pts"
        sleep_status = "positive"
        sleep_note = f"Averaging {avg_sleep:.1f} hours of sleep gave your skin deep overnight cell repair."
    elif avg_sleep >= 5.5:
        sleep_impact = "+2 pts"
        sleep_status = "neutral"
        sleep_note = f"Averaging {avg_sleep:.1f} hours is decent, but 7+ hours will boost your skin glow even more."
    else:
        sleep_impact = "-4 pts"
        sleep_status = "caution"
        sleep_note = f"Low sleep ({avg_sleep:.1f} hrs) increases cortisol and dulls skin brightness."

    habit_impacts.append({
        "name": "Sleep Recovery",
        "value": f"{avg_sleep:.1f} hrs avg",
        "impact": sleep_impact,
        "status": sleep_status,
        "simple_note": sleep_note
    })

    # 2. Water Hydration Impact
    if avg_water >= 8:
        water_impact = "+5 pts"
        water_status = "positive"
        water_note = f"Drinking {avg_water:.0f} glasses daily is keeping your skin cells hydrated and plump."
    elif avg_water >= 5:
        water_impact = "+2 pts"
        water_status = "neutral"
        water_note = f"{avg_water:.0f} glasses helps, but reaching 8 glasses will smooth out dryness."
    else:
        water_impact = "-3 pts"
        water_status = "caution"
        water_note = f"Under 5 glasses ({avg_water:.0f} avg) leads to skin dehydration and tight texture."

    habit_impacts.append({
        "name": "Water Hydration",
        "value": f"{avg_water:.0f} glasses avg",
        "impact": water_impact,
        "status": water_status,
        "simple_note": water_note
    })

    # 3. Stress Control Impact
    if avg_stress <= 4:
        stress_impact = "+4 pts"
        stress_status = "positive"
        stress_note = "Keeping stress low stopped excess oil and prevented inflammatory flare-ups."
    elif avg_stress <= 7:
        stress_impact = "0 pts"
        stress_status = "neutral"
        stress_note = "Moderate stress levels are well managed by your daily routine."
    else:
        stress_impact = "-5 pts"
        stress_status = "caution"
        stress_note = f"High stress ({avg_stress:.0f}/10) triggers oil glands and increases breakout risk."

    habit_impacts.append({
        "name": "Stress Balance",
        "value": f"{avg_stress:.0f} / 10 level",
        "impact": stress_impact,
        "status": stress_status,
        "simple_note": stress_note
    })

    # Chronological history points (oldest to newest, max 10 logs)
    history_slice = logs[:10]
    history_slice.reverse()
    history_points = []
    for l in history_slice:
        s = compute_log_score(skin_profile, l)
        date_str = l.date_logged if l.date_logged else "Day"
        history_points.append({
            "date": date_str,
            "score": s,
            "sleep": float(l.sleep_hours or 7.0),
            "water": int(l.water_glasses or 8),
            "stress": int(l.stress_level or 4)
        })

    # Milestones
    total_count = len(logs)
    milestones = [
        {
            "title": "First Step",
            "desc": "Logged your first day in the tracker",
            "earned": total_count >= 1,
            "icon": "sparkles"
        },
        {
            "title": "3-Day Consistency",
            "desc": "Logged at least 3 daily habits",
            "earned": total_count >= 3,
            "icon": "flame"
        },
        {
            "title": "Hydration Champion",
            "desc": "Averaging 8+ glasses of water",
            "earned": avg_water >= 8,
            "icon": "droplet"
        },
        {
            "title": "Healthy Barrier",
            "desc": "Achieved a skin score of 78+",
            "earned": current_score >= 78.0,
            "icon": "shield"
        }
    ]

    ai_coach_note = generate_ai_coach_note(current_score, score_change, avg_sleep, avg_water)

    return {
        "current_score": current_score,
        "previous_score": previous_score,
        "score_change": score_change,
        "trend_label": trend_label,
        "trend_status": trend_status,
        "projected_score_7d": projected_score_7d,
        "logging_streak": total_count,
        "total_logs": total_count,
        "ai_coach_note": ai_coach_note,
        "habit_impacts": habit_impacts,
        "history_points": history_points,
        "milestones": milestones
    }
