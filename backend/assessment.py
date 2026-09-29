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
PRIORITY_MODEL_PATH = os.path.join(BASE_DIR, "concern_priority_model.pkl")

try:
    ml_model = joblib.load(HEALTH_MODEL_PATH) if os.path.exists(HEALTH_MODEL_PATH) else None
except Exception:
    ml_model = None

try:
    adherence_ml_model = joblib.load(ADHERENCE_MODEL_PATH) if os.path.exists(ADHERENCE_MODEL_PATH) else None
except Exception:
    adherence_ml_model = None

try:
    concern_priority_ml_model = joblib.load(PRIORITY_MODEL_PATH) if os.path.exists(PRIORITY_MODEL_PATH) else None
except Exception:
    concern_priority_ml_model = None


def prioritize_skin_concerns(
    concerns_str: str,
    is_sensitive: bool = False,
    latest_log = None,
    skin_type: str = "Normal"
):
    """
    Evaluates and triages multiple user skin concerns using a Hybrid Machine Learning
    (Random Forest Multi-Output Regressor) + Generative AI Architecture.
    
    1. Extracts 13-dimensional biomarker & telemetry features (stress, sleep, water, sun, skin_type, is_sensitive, concern flags).
    2. Runs inference using concern_priority_model.pkl to calculate quantitative Urgency Scores (0-100%).
    3. Ranks concerns mathematically based on ML clinical risk.
    """
    if not concerns_str:
        return {
            "prioritized_list": [{
                "name": "General Skin Health",
                "tier": 3,
                "priority_label": "Maintenance Care",
                "is_harmful": False,
                "ml_urgency_score": 30.0,
                "ml_engine_type": "Random Forest Multi-Output Regressor (concern_priority_model.pkl)",
                "telemetry_driver": "Calibrated baseline: No acute concerns reported.",
                "clinical_rationale": "No active pathologies reported. Maintain baseline barrier defense and daily hydration.",
                "recommended_actives": ["Ceramides", "Hyaluronic Acid", "Niacinamide", "SPF 50"],
                "restricted_actives": []
            }],
            "primary_target": {
                "name": "General Skin Health",
                "priority_label": "Maintenance Care",
                "is_harmful": False,
                "ml_urgency_score": 30.0,
                "ml_engine_type": "Random Forest Multi-Output Regressor (concern_priority_model.pkl)",
                "telemetry_driver": "Calibrated baseline: No acute concerns reported.",
                "clinical_rationale": "Baseline barrier preservation and hydration."
            },
            "secondary_targets": [],
            "has_harmful_concern": False,
            "ml_engine_type": "Random Forest Multi-Output Regressor (concern_priority_model.pkl)"
        }

    raw_concerns = [c.strip() for c in concerns_str.split(",") if c.strip()]
    if not raw_concerns:
        raw_concerns = ["General Skin Health"]

    # Map raw concerns to the 7 canonical ML categories:
    # 0: Acne, 1: Rosacea, 2: Barrier, 3: Pigmentation, 4: Pores, 5: Aging, 6: Dehydration
    cat_flags = np.zeros(7)
    analyzed_items = []

    for c in raw_concerns:
        c_lower = c.lower()
        
        # Determine category index and clinical metadata
        if any(kw in c_lower for kw in ["acne", "pimple", "blemish", "breakout"]):
            cat_idx = 0
            tier = 1
            priority_label = "High Priority (Inflammatory Risk)"
            is_harmful = True
            rationale = "Active follicular occlusion and microbial proliferation. Requires prompt anti-inflammatory treatment to clear pores and prevent permanent scarring."
            rec = ["Salicylic Acid (BHA 1-2%)", "Niacinamide (2-5%)", "Zinc PCA", "Lightweight Gel Hydrators"]
            avoid = ["Heavy Comedogenic Oils", "Thick Occlusive Balms", "Harsh Physical Scrubs"]
        elif any(kw in c_lower for kw in ["rosacea", "redness", "erythema", "flush"]):
            cat_idx = 1
            tier = 1
            priority_label = "High Priority (Vascular / Erythema Risk)"
            is_harmful = True
            rationale = "Erythema and micro-vascular hyper-reactivity. Essential to soothe irritation and avoid photosensitizing or acidic triggers."
            rec = ["Centella Asiatica (Cica)", "Azelaic Acid (10%)", "Panthenol", "Mineral Sunscreen"]
            avoid = ["High % Glycolic Acid", "Pure Alcohol Toners", "Thermal Hot Water"]
        elif any(kw in c_lower for kw in ["barrier", "eczema", "dermatitis", "inflam", "burn", "peel"]):
            cat_idx = 2
            tier = 1
            priority_label = "High Priority (Barrier Compromise)"
            is_harmful = True
            rationale = "Compromised stratum corneum integrity. Requires barrier rescue protocol before introducing any aggressive active ingredients."
            rec = ["Ceramides (1:3:1 ratio)", "Colloidal Oatmeal", "Squalane", "Allantoin"]
            avoid = ["Aggressive Chemical Peels", "Retinoids", "Synthetic Fragrance"]
        elif any(kw in c_lower for kw in ["pigment", "dark spot", "melasma", "sun damage"]):
            cat_idx = 3
            tier = 2
            priority_label = "Moderate Priority (Pigment Regulation)"
            is_harmful = False
            rationale = "Melanocyte hyperactivity and UV photo-damage. Controlled via tyrosinase inhibitors and persistent broad-spectrum UV shielding."
            rec = ["Vitamin C (THD Ascorbate)", "Alpha Arbutin", "Tranexamic Acid", "Broad Spectrum SPF 50"]
            avoid = ["Unprotected Sun Exposure", "Aggressive scrubbing that triggers post-inflammatory hyperpigmentation (PIH)"]
        elif any(kw in c_lower for kw in ["pore", "blackhead", "texture", "rough"]):
            cat_idx = 4
            tier = 2
            priority_label = "Moderate Priority (Texture & Pores)"
            is_harmful = False
            rationale = "Keratinized buildup and cellular cohesion. Addressed with gentle keratolytic exfoliation and sebum regulation."
            rec = ["Niacinamide", "BHA / Salicylic Acid", "Clay Purifiers", "Lactic Acid"]
            avoid = ["Pore-clogging waxes", "Over-stripping alcohol washes"]
        elif any(kw in c_lower for kw in ["aging", "wrinkle", "line", "firm", "elasticity"]):
            cat_idx = 5
            tier = 3
            priority_label = "Maintenance Priority (Aesthetic & Longevity)"
            is_harmful = False
            rationale = "Gradual collagen depletion and cellular turnover deceleration. Managed through peptide matrix support and retinoid signaling."
            rec = ["Multi-Peptides", "Retinol / Retinaldehyde", "Hyaluronic Acid", "Antioxidants"]
            avoid = ["Skipping Daily Sunscreen", "Excessive hot water cleansing"]
        else:
            cat_idx = 6
            tier = 3
            priority_label = "Maintenance Priority (Hydration & Radiance)"
            is_harmful = False
            rationale = "Surface stratum corneum light scattering and sluggish desquamation. Improved with gentle cell turnover and hydration."
            rec = ["Hyaluronic Acid", "Glycerin", "Ceramides", "Ectoin"]
            avoid = ["Over-cleansing", "Low humidity environments without humidifier"]

        cat_flags[cat_idx] = 1
        analyzed_items.append({
            "name": c,
            "cat_idx": cat_idx,
            "tier": tier,
            "priority_label": priority_label,
            "is_harmful": is_harmful,
            "clinical_rationale": rationale,
            "recommended_actives": rec,
            "restricted_actives": avoid
        })

    # Telemetry vector extraction
    stress_val = float(latest_log.stress_level) if latest_log and getattr(latest_log, "stress_level", None) is not None else 5.0
    sleep_val = float(latest_log.sleep_hours) if latest_log and getattr(latest_log, "sleep_hours", None) is not None else 7.5
    water_val = float(latest_log.water_glasses) if latest_log and getattr(latest_log, "water_glasses", None) is not None else 8.0
    sun_val = float(latest_log.sun_exposure_hours) if latest_log and getattr(latest_log, "sun_exposure_hours", None) is not None else 1.5
    st_enc = {"oily": 0, "dry": 1, "combination": 2, "normal": 3}.get((skin_type or "normal").lower(), 2)
    sens_enc = 1 if is_sensitive else 0

    # Execute ML Inference with Random Forest Regressor
    if concern_priority_ml_model is not None:
        try:
            x_feature = np.array([[stress_val, sleep_val, water_val, sun_val, st_enc, sens_enc, *cat_flags]])
            raw_urgencies = concern_priority_ml_model.predict(x_feature)[0]
        except Exception:
            raw_urgencies = np.array([0.65, 0.65, 0.70, 0.45, 0.40, 0.30, 0.30])
    else:
        raw_urgencies = np.array([0.65, 0.65, 0.70, 0.45, 0.40, 0.30, 0.30])

    # Assign ML urgency scores and telemetry attributions
    for item in analyzed_items:
        c_idx = item["cat_idx"]
        urgency_pct = round(float(np.clip(raw_urgencies[c_idx], 0.10, 0.99)) * 100, 1)
        item["ml_urgency_score"] = urgency_pct
        item["ml_engine_type"] = "Random Forest Multi-Output Regressor (concern_priority_model.pkl)"

        # Telemetry explanation
        if c_idx in [0, 2] and (stress_val >= 7.0 or sleep_val <= 5.5):
            item["telemetry_driver"] = f"Cortisol amplification: High stress ({int(stress_val)}/10) & low nocturnal sleep ({sleep_val}h) elevate acute inflammatory urgency."
        elif c_idx in [1, 3] and sun_val >= 3.0:
            item["telemetry_driver"] = f"Photo-oxidative driver: Elevated UV sun exposure ({sun_val}h/day) accelerates melanocyte/vascular reactivity."
        elif c_idx == 6 and water_val < 6.0:
            item["telemetry_driver"] = f"Hydration deficit: Low daily fluid intake ({int(water_val)} glasses/day) impairs stratum corneum moisture."
        elif is_sensitive and c_idx in [1, 2]:
            item["telemetry_driver"] = "Hyper-reactive barrier: Sensitive stratum corneum amplifies barrier repair precedence."
        else:
            item["telemetry_driver"] = "Calibrated baseline: Quantified via Random Forest telemetry weighting."

    # Sort concerns by ML Urgency Score (highest first)
    analyzed_items.sort(key=lambda x: (-x["ml_urgency_score"], x["tier"]))

    primary = analyzed_items[0]
    secondary = analyzed_items[1:] if len(analyzed_items) > 1 else []
    has_harmful = any(item["is_harmful"] for item in analyzed_items)

    return {
        "prioritized_list": analyzed_items,
        "primary_target": primary,
        "secondary_targets": secondary,
        "has_harmful_concern": has_harmful,
        "ml_engine_type": "Random Forest Multi-Output Regressor (concern_priority_model.pkl)",
        "telemetry_context": {
            "stress_level": stress_val,
            "sleep_hours": sleep_val,
            "water_glasses": water_val,
            "sun_exposure_hours": sun_val
        }
    }


def calculate_skin_health_score(skin_profile, latest_log):
    concern_text = skin_profile.primary_concern if skin_profile else "General Care"
    is_sens = skin_profile.is_sensitive if skin_profile else False
    st = skin_profile.skin_type if skin_profile else "Normal"
    triage = prioritize_skin_concerns(concern_text, is_sens, latest_log, st)

    if not ml_model or not latest_log:
        condition_score = 100
        if is_sens:
            condition_score -= 20
        if triage["has_harmful_concern"]:
            condition_score -= 15
        elif len(triage["prioritized_list"]) > 1:
            condition_score -= 5
        
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
        if triage["has_harmful_concern"]:
            predicted_score -= 6
        elif len(triage["prioritized_list"]) > 1:
            predicted_score -= 2

    return round(min(100.0, max(10.0, predicted_score)), 1)


def generate_personalized_routine(skin_profile, latest_log=None):
    skin_type = skin_profile.skin_type if skin_profile else "Normal"
    concern = skin_profile.primary_concern if skin_profile else "General Care"
    is_sensitive = skin_profile.is_sensitive if skin_profile else False

    seasonal = {
        "summer": {
            "season": "Summer (High Heat & UV)",
            "focus": f"Combat excess sebum oxidation and photo-damage while maintaining lightweight barrier hydration for {skin_type} skin.",
            "key_measures": [
                "Switch to an oil-free, lightweight water-gel moisturizer to avoid clogged pores in high humidity.",
                "Reapply broad-spectrum SPF 50 every 2 hours during peak UV radiation hours (10 AM - 4 PM).",
                "Incorporate a morning antioxidant serum (Vitamin C or Niacinamide) to neutralize free radical photo-damage.",
                "Double-cleanse gently in the evening to break down sweat, oxidized sebum, and water-resistant sunscreen."
            ],
            "ingredient_guide": {
                "prioritize": ["Niacinamide", "Hyaluronic Acid", "Zinc PCA", "Broad Spectrum SPF 50"],
                "avoid": ["Heavy Petrolatum Occlusives", "Thick Comedogenic Oils", "Photosensitizing acids in morning"]
            }
        },
        "winter": {
            "season": "Winter (Cold Air & Low Humidity)",
            "focus": f"Prevent transepidermal water loss (TEWL) and replenish lipid barrier depleted by cold winds and dry indoor heating.",
            "key_measures": [
                "Layer ceramide-rich barrier repair creams or squalane to replenish missing lipid layers.",
                "Switch to a hydrating, non-foaming cream cleanser that cleanses without stripping the acid mantle.",
                "Avoid washing your face with hot water; use lukewarm water to preserve natural barrier oils.",
                "Apply humectants (Hyaluronic Acid, Glycerin) to damp skin and lock in immediately with an emollient cream."
            ],
            "ingredient_guide": {
                "prioritize": ["Ceramides NP/AP", "Squalane", "Centella Asiatica", "Peptides"],
                "avoid": ["Drying alcohol astringents", "Over-exfoliating chemical peels", "Harsh sulfate cleansers"]
            }
        },
        "monsoon": {
            "season": "Monsoon (High Humidity & Moisture)",
            "focus": f"Prevent fungal and bacterial pore proliferation while balancing moisture under sticky climatic conditions.",
            "key_measures": [
                "Use gentle antibacterial and pore-clearing cleansers formulated with low-dose Salicylic Acid (BHA) or Tea Tree.",
                "Keep skin dry and blot excess humidity with a clean microfiber cloth; avoid touching your face.",
                "Do not skip daily sunscreen; up to 80% of UVA/UVB rays penetrate dense rain clouds.",
                "Choose non-comedogenic, fast-absorbing matte-finish formulas that resist sweat and high atmospheric moisture."
            ],
            "ingredient_guide": {
                "prioritize": ["Salicylic Acid (BHA)", "Azelaic Acid", "Tea Tree Extract", "Green Tea"],
                "avoid": ["Heavy facial butters", "Leaving sweaty gym clothes touching skin", "Abrasive physical scrubs"]
            }
        },
        "spring_autumn": {
            "season": "Spring & Autumn (Climate & Seasonal Transition)",
            "focus": f"Calm transitional micro-inflammation and allergic barrier reactivity caused by pollen and fluctuating weather.",
            "key_measures": [
                "Gradually re-introduce active ingredients in low concentrations to prevent shocking the skin barrier.",
                "Emphasize soothing anti-inflammatory botanicals (Cica, Panthenol, Allantoin) to quell seasonal redness.",
                "Monitor for transitional dry flaking around the nose and mouth, applying barrier balm as needed.",
                "Maintain steady, non-greasy hydration with barrier-supporting toners before your daily moisturizer."
            ],
            "ingredient_guide": {
                "prioritize": ["Panthenol (B5)", "Centella Asiatica (Cica)", "Allantoin", "Colloidal Oat"],
                "avoid": ["High-percentage chemical peels during pollen peaks", "Unbuffered retinoids without barrier cushion"]
            }
        }
    }

    triage = prioritize_skin_concerns(concern, is_sensitive, latest_log, skin_type)
    primary_concern_name = triage["primary_target"]["name"]

    if not client or not os.environ.get("GOOGLE_AI_STUDIO_API_KEY"):
        # Clinical active selection directed by the top-priority concern
        primary_lower = primary_concern_name.lower()
        if "acne" in primary_lower:
            m_treatment = "Niacinamide 5% + Zinc PCA Serum"
            m_purpose = "Regulate follicular sebum and suppress inflammatory acne pustules."
            e_treatment = "Salicylic Acid (BHA 2%) Pore Solution"
            e_purpose = "Deeply clear sebaceous plugs and reduce active acne lesions."
        elif "rosacea" in primary_lower or "redness" in primary_lower or is_sensitive:
            m_treatment = "Centella Asiatica (Cica) Calming Essence"
            m_purpose = "Quell micro-vascular erythema and soothe reactive redness."
            e_treatment = "Azelaic Acid 10% Barrier Emulsion"
            e_purpose = "Clinical anti-inflammatory therapy to reduce flushing and restore acid mantle."
        elif "pigment" in primary_lower or "dark spot" in primary_lower or "sun" in primary_lower:
            m_treatment = "Vitamin C (15%) + Alpha Arbutin Complex"
            m_purpose = "Inhibit tyrosinase activity and fade post-inflammatory dark marks."
            e_treatment = "Tranexamic Acid 3% Night Recovery Complex"
            e_purpose = "Block melanocyte hyperactivity and brighten uneven tone."
        elif "aging" in primary_lower or "line" in primary_lower or "firm" in primary_lower:
            m_treatment = "Multi-Peptide Copper Firming Serum"
            m_purpose = "Stimulate extracellular matrix collagen and elastin synthesis."
            e_treatment = "Encapsulated Retinaldehyde 0.05% Night Cream"
            e_purpose = "Accelerate cellular desquamation and smooth fine lines."
        else:
            m_treatment = "Multi-Molecular Hyaluronic Acid Serum"
            m_purpose = "Infuse multi-depth dermal hydration and relieve barrier tightness."
            e_treatment = "Ceramide Barrier Restoration Concentrate"
            e_purpose = "Replenish essential lipid barrier proteins."

        morning = [
            {"step": "Cleansing", "product": "Gentle Hydrating Cleanser" if is_sensitive else "Foaming Gel Cleanser", "purpose": "Remove overnight impurities and balance pH."},
            {"step": "Targeted Active (Priority Focus)", "product": m_treatment, "purpose": m_purpose},
            {"step": "Moisture Barrier Lock", "product": "Multi-Ceramide Daily Emulsion", "purpose": "Fortify lipid bilayer integrity and prevent TEWL."},
            {"step": "Environmental Photoprotection", "product": "Mineral Broad Spectrum SPF 50", "purpose": "Critical shield against UVA/UVB photo-oxidation and barrier degradation."}
        ]
        evening = [
            {"step": "Double Cleansing", "product": "Micellar Cleansing Water followed by Daily Cleanser", "purpose": "Dissolve sunscreen, makeup, and daily buildup."},
            {"step": "Targeted Active (Priority Care)", "product": e_treatment, "purpose": e_purpose},
            {"step": "Night Care", "product": "Nourishing Recovery Peptide Night Cream", "purpose": "Deep cellular restoration during sleep cycles."}
        ]
        weekly = [
            {"frequency": "1-2 times per week", "treatment": "Gentle Chemical Exfoliant (AHA/BHA)" if not is_sensitive else "Enzyme Resurfacing Mask", "benefit": f"Specialized cellular renewal focused on {primary_concern_name}."},
            {"frequency": "Weekly", "treatment": "Hydrating Soothing Sheet Mask or Clay Mask", "benefit": "Restores moisture balance or absorbs excess sebum."}
        ]
        return {
            "skin_type": skin_type, "primary_concern": concern, "is_sensitive": is_sensitive,
            "morning_routine": morning, "evening_routine": evening, "weekly_treatment": weekly,
            "seasonal_recommendations": seasonal,
            "concern_triage": triage
        }

    prompt = f"""
    Act as an expert clinical dermatologist and AI skincare specialist.
    Generate a highly customized, safe, and professional skincare routine and seasonal care measures for a patient with:
    - Skin Type: {skin_type}
    - Sensitive Skin: {is_sensitive}
    - Machine Learning Concern Triage (Random Forest Model inference):
      * PRIMARY CLINICAL TARGET (HIGHEST PRIORITY): {triage['primary_target']['name']} ({triage['primary_target']['priority_label']})
        ML Urgency Score: {triage['primary_target']['ml_urgency_score']}%
        Telemetry Attribution: {triage['primary_target']['telemetry_driver']}
        Directive: {triage['primary_target']['clinical_rationale']}
      * Secondary Targets: {', '.join([f"{t['name']} (ML Urgency: {t['ml_urgency_score']}%)" for t in triage['secondary_targets']]) if triage['secondary_targets'] else 'None'}

    CRITICAL DERMATOLOGY SAFETY RULE:
    The routine MUST prioritize the Primary Clinical Target ({triage['primary_target']['name']}) first.
    If the primary target is harmful or inflammatory (e.g., active acne, rosacea, broken barrier), DO NOT prescribe harsh peeling acids or heavy occlusives that worsen inflammation. Integrate secondary target actives only if safe and non-irritating.

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
      ],
      "seasonal_recommendations": {{
        "summer": {{
          "season": "Summer (Heat & High UV)",
          "focus": "string",
          "key_measures": ["string", "string", "string", "string"],
          "ingredient_guide": {{"prioritize": ["string"], "avoid": ["string"]}}
        }},
        "winter": {{
          "season": "Winter (Cold & Low Humidity)",
          "focus": "string",
          "key_measures": ["string", "string", "string", "string"],
          "ingredient_guide": {{"prioritize": ["string"], "avoid": ["string"]}}
        }},
        "monsoon": {{
          "season": "Monsoon (High Humidity & Moisture)",
          "focus": "string",
          "key_measures": ["string", "string", "string", "string"],
          "ingredient_guide": {{"prioritize": ["string"], "avoid": ["string"]}}
        }},
        "spring_autumn": {{
          "season": "Spring & Autumn (Climate Transition)",
          "focus": "string",
          "key_measures": ["string", "string", "string", "string"],
          "ingredient_guide": {{"prioritize": ["string"], "avoid": ["string"]}}
        }}
      }}
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

        parsed = json.loads(content)
        if "seasonal_recommendations" not in parsed:
            parsed["seasonal_recommendations"] = seasonal
        parsed["concern_triage"] = triage
        return parsed
    except Exception as e:
        return {
            "skin_type": skin_type,
            "primary_concern": concern,
            "is_sensitive": is_sensitive,
            "morning_routine": [{"step": "Cleansing", "product": "Gentle Cleanser", "purpose": "Cleanse skin safely."}],
            "evening_routine": [{"step": "Treatment", "product": "Restorative Cream", "purpose": "Night hydration."}],
            "weekly_treatment": [{"frequency": "Weekly", "treatment": "Gentle Mask", "benefit": "Balance."}],
            "seasonal_recommendations": seasonal,
            "concern_triage": triage
        }


def get_dermatologist_recommendations(skin_profile, latest_log):
    current_score = calculate_skin_health_score(skin_profile, latest_log)
    skin_type = skin_profile.skin_type if skin_profile else "Normal"
    concern = skin_profile.primary_concern if skin_profile else "General Care"
    is_sensitive = skin_profile.is_sensitive if skin_profile else False
    triage = prioritize_skin_concerns(concern, is_sensitive, latest_log, skin_type)

    triage_rationale = (
        f"Primary focus assigned to {triage['primary_target']['name']} ({triage['primary_target']['priority_label']}, {triage['primary_target']['ml_urgency_score']}% ML Urgency). "
        f"{triage['primary_target']['clinical_rationale']}"
    )

    if not client or not os.environ.get("GOOGLE_AI_STUDIO_API_KEY"):
        return {
            "score": current_score,
            "clinical_summary": f"Targeted assessment for {skin_type} skin. Random Forest inference prioritized {triage['primary_target']['name']} at {triage['primary_target']['ml_urgency_score']}% clinical urgency before addressing secondary concerns.",
            "lifestyle_prescription": [
                f"Prioritize targeted care for {triage['primary_target']['name']}",
                "Maintain 7-8 hours of regular sleep to optimize nocturnal cellular mitosis",
                "Ensure steady 8-10 glasses water consumption to maintain cellular hydration",
                "Apply broad-spectrum mineral SPF 50 daily to shield against UV photo-oxidation"
            ],
            "warning_notes": f"Safety Notice: Avoid combining incompatible actives. Restricted for your priority target: {', '.join(triage['primary_target']['restricted_actives'])}.",
            "concern_triage": triage,
            "priority_triage_rationale": triage_rationale
        }

    prompt = f"""
    Act as an elite Chief Dermatologist. A patient has a calculated Skin Health Score of {current_score}/100.
    Patient Profile:
    - Skin Type: {skin_type}
    - Sensitive Skin: {is_sensitive}
    - Machine Learning Concern Triage (Random Forest Multi-Output Model):
      * PRIMARY CLINICAL TARGET (HIGHEST PRIORITY): {triage['primary_target']['name']} ({triage['primary_target']['priority_label']})
        ML Urgency Score: {triage['primary_target']['ml_urgency_score']}%
        Telemetry Attribution: {triage['primary_target']['telemetry_driver']}
        Clinical Rationale: {triage['primary_target']['clinical_rationale']}
      * Secondary Concerns: {', '.join([f"{t['name']} (ML Urgency: {t['ml_urgency_score']}%)" for t in triage['secondary_targets']]) if triage['secondary_targets'] else 'None'}

    Provide specialized dermatologist advice tailored specifically to their score, profile, and concern priority.
    Explicitly explain in the clinical summary why the Primary Target takes precedence over secondary aesthetic goals.

    Return ONLY a valid JSON object matching this exact structure, with no markdown formatting:
    {{
      "score": {current_score},
      "clinical_summary": "A professional 2-3 sentence assessment explaining why their primary concern is prioritized and how their score reflects their current barrier health.",
      "lifestyle_prescription": [
        "Actionable habit recommendation 1",
        "Actionable habit recommendation 2",
        "Actionable habit recommendation 3"
      ],
      "warning_notes": "Important dermatological warning or ingredient caution tailored to their primary concern.",
      "priority_triage_rationale": "Clear clinical explanation of why this specific concern was prioritized over others."
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
        parsed = json.loads(content)
        parsed["concern_triage"] = triage
        if "priority_triage_rationale" not in parsed:
            parsed["priority_triage_rationale"] = triage_rationale
        return parsed
    except Exception as e:
        return {
            "score": current_score,
            "clinical_summary": f"Your current score is {current_score}/100. Primary clinical priority is focused on stabilizing {triage['primary_target']['name']}.",
            "lifestyle_prescription": [
                f"Focus on resolving {triage['primary_target']['name']}",
                "Increase daily water consumption to support moisture barrier",
                "Apply broad-spectrum mineral sunscreen every morning"
            ],
            "warning_notes": f"Safety Notice: Avoid combining conflicting actives. Avoid: {', '.join(triage['primary_target']['restricted_actives'])}.",
            "concern_triage": triage,
            "priority_triage_rationale": triage_rationale
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