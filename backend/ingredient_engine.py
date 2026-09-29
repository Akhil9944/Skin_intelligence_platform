import os
import re
import json
import joblib
import numpy as np
from difflib import SequenceMatcher
from openai import OpenAI

_google_api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
client = OpenAI(
    api_key=_google_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
) if _google_api_key else None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ING_MODEL_PATH = os.path.join(BASE_DIR, "ingredient_safety_model.pkl")

try:
    ingredient_ml_model = joblib.load(ING_MODEL_PATH) if os.path.exists(ING_MODEL_PATH) else None
except Exception:
    ingredient_ml_model = None

# ====================================================================
# Pharmacological INCI Chemical Knowledge Base
# ====================================================================
INCI_DATABASE = {
    "niacinamide": {
        "canonical_name": "Niacinamide (Vitamin B3)",
        "aliases": ["nicotinamide", "3-pyridinecarboxamide", "vitamin b3"],
        "category": "Antioxidant / Sebum Regulator",
        "comedogenic_rating": 0,
        "irritancy_rating": 1,
        "is_active": True,
        "is_allergen": False,
        "role": "Strengthens barrier lipids, reduces sebum, fades post-inflammatory erythema."
    },
    "salicylic acid": {
        "canonical_name": "Salicylic Acid (BHA)",
        "aliases": ["bha", "beta hydroxy acid", "2-hydroxybenzoic acid", "salicylate"],
        "category": "Keratolytic Exfoliant (BHA)",
        "comedogenic_rating": 0,
        "irritancy_rating": 3,
        "is_active": True,
        "is_allergen": False,
        "role": "Lipid-soluble acid that penetrates follicular pores to dissolve sebum plugs."
    },
    "glycolic acid": {
        "canonical_name": "Glycolic Acid (AHA)",
        "aliases": ["aha", "alpha hydroxy acid", "hydroxyacetic acid"],
        "category": "Chemical Exfoliant (AHA)",
        "comedogenic_rating": 0,
        "irritancy_rating": 3,
        "is_active": True,
        "is_allergen": False,
        "role": "Accelerates superficial stratum corneum desquamation and brightens tone."
    },
    "lactic acid": {
        "canonical_name": "Lactic Acid (AHA)",
        "aliases": ["2-hydroxypropanoic acid"],
        "category": "Chemical Exfoliant (AHA)",
        "comedogenic_rating": 0,
        "irritancy_rating": 2,
        "is_active": True,
        "is_allergen": False,
        "role": "Gentle chemical exfoliator and natural humectant for dry skin."
    },
    "retinol": {
        "canonical_name": "Retinol (Vitamin A)",
        "aliases": ["retinyl", "retinal", "retinaldehyde", "retinoid", "tretinoin", "adapalene"],
        "category": "Cellular Turnover Signaler (Retinoid)",
        "comedogenic_rating": 0,
        "irritancy_rating": 4,
        "is_active": True,
        "is_allergen": False,
        "role": "Stimulates deep collagen synthesis and cellular mitosis."
    },
    "ascorbic acid": {
        "canonical_name": "L-Ascorbic Acid (Pure Vitamin C)",
        "aliases": ["vitamin c", "l-ascorbic acid", "thd ascorbate", "sodium ascorbyl phosphate", "ascorbyl glucoside"],
        "category": "Antioxidant / Tyrosinase Inhibitor",
        "comedogenic_rating": 0,
        "irritancy_rating": 3,
        "is_active": True,
        "is_allergen": False,
        "role": "Potent free radical scavenger that suppresses melanogenesis."
    },
    "benzoyl peroxide": {
        "canonical_name": "Benzoyl Peroxide",
        "aliases": ["bpo", "dibenzoyl peroxide"],
        "category": "Antimicrobial / Oxidizing Agent",
        "comedogenic_rating": 0,
        "irritancy_rating": 4,
        "is_active": True,
        "is_allergen": False,
        "role": "Releases reactive oxygen to destroy anaerobic Cutibacterium acnes bacteria."
    },
    "hyaluronic acid": {
        "canonical_name": "Hyaluronic Acid",
        "aliases": ["sodium hyaluronate", "hydrolyzed hyaluronic acid", "sodium acetylated hyaluronate"],
        "category": "Multi-Molecular Humectant",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Binds up to 1,000x its molecular weight in water to hydrate epidermis."
    },
    "glycerin": {
        "canonical_name": "Glycerin",
        "aliases": ["glycerol", "glycerine"],
        "category": "Epidermal Humectant",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Essential natural moisturizing factor (NMF) humectant."
    },
    "ceramide": {
        "canonical_name": "Ceramide Complex (NP / AP / EOP)",
        "aliases": ["ceramide np", "ceramide ap", "ceramide eop", "ceramide 3", "ceramide 1", "phytosphingosine"],
        "category": "Barrier Structural Lipid",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Replenishes essential 50% intercellular matrix lipid bilayer."
    },
    "centella asiatica": {
        "canonical_name": "Centella Asiatica (Cica)",
        "aliases": ["cica", "madecassoside", "asiaticoside", "asiatic acid", "gotu kola"],
        "category": "Anti-Inflammatory Botanical",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Suppresses inflammatory cytokines and soothes micro-vascular erythema."
    },
    "zinc pca": {
        "canonical_name": "Zinc PCA",
        "aliases": ["zinc pyrrolidone carboxylic acid"],
        "category": "Sebum Regulating Mineral",
        "comedogenic_rating": 0,
        "irritancy_rating": 1,
        "is_active": True,
        "is_allergen": False,
        "role": "Suppresses 5-alpha-reductase to diminish excessive facial oiliness."
    },
    "azelaic acid": {
        "canonical_name": "Azelaic Acid",
        "aliases": ["potassium azeloyl diglycinate"],
        "category": "Dicarboxylic Acid / Anti-Erythema",
        "comedogenic_rating": 0,
        "irritancy_rating": 2,
        "is_active": True,
        "is_allergen": False,
        "role": "Calms rosacea erythema and halts abnormal melanocyte hyperactivity."
    },
    "squalane": {
        "canonical_name": "Squalane (Plant-Derived)",
        "aliases": ["squalene", "olive squalane", "sugarcane squalane"],
        "category": "Biocompatible Emollient",
        "comedogenic_rating": 1,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Mimics skin's natural sebum without clogging pores."
    },
    "coconut oil": {
        "canonical_name": "Cocos Nucifera (Coconut) Oil",
        "aliases": ["cocos nucifera oil", "coconut butter"],
        "category": "Heavy Occlusive Lipid",
        "comedogenic_rating": 4,
        "irritancy_rating": 1,
        "is_active": False,
        "is_allergen": False,
        "role": "High lauric acid lipid; highly comedogenic for acne-prone skin."
    },
    "isopropyl myristate": {
        "canonical_name": "Isopropyl Myristate",
        "aliases": ["isopropyl palmitate", "myristic acid ester"],
        "category": "Penetration Enhancer / Ester",
        "comedogenic_rating": 5,
        "irritancy_rating": 2,
        "is_active": False,
        "is_allergen": False,
        "role": "Emollient ester notorious for triggering follicular pore clogging."
    },
    "fragrance": {
        "canonical_name": "Synthetic Fragrance / Parfum",
        "aliases": ["parfum", "aroma", "perfume", "linalool", "limonene", "geraniol", "citronellol", "eugenol"],
        "category": "Sensitizing Allergen / Aromatic",
        "comedogenic_rating": 0,
        "irritancy_rating": 4,
        "is_active": False,
        "is_allergen": True,
        "role": "Common trigger for contact dermatitis and barrier neuro-sensitization."
    },
    "alcohol denat": {
        "canonical_name": "Alcohol Denat (Denatured Alcohol)",
        "aliases": ["sd alcohol", "isopropyl alcohol", "ethanol", "ethyl alcohol"],
        "category": "Penetration Solvent / Astringent",
        "comedogenic_rating": 0,
        "irritancy_rating": 4,
        "is_active": False,
        "is_allergen": True,
        "role": "Rapid-evaporating solvent that strips the natural acid mantle lipid bilayer."
    },
    "phenoxyethanol": {
        "canonical_name": "Phenoxyethanol",
        "aliases": ["2-phenoxyethanol", "phenoxy ethanol"],
        "category": "Preservative / Antimicrobial",
        "comedogenic_rating": 0,
        "irritancy_rating": 1,
        "is_active": False,
        "is_allergen": False,
        "role": "Broad-spectrum cosmetic preservative safe for barrier preservation at <= 1.0%."
    },
    "panthenol": {
        "canonical_name": "Panthenol (Pro-Vitamin B5)",
        "aliases": ["d-panthenol", "provitamin b5", "dexpanthenol"],
        "category": "Epidermal Reparative Humectant",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Penetrates deeply to accelerate cellular repair and lipid barrier reconstitution."
    },
    "tocopherol": {
        "canonical_name": "Tocopherol (Vitamin E)",
        "aliases": ["tocopheryl acetate", "vitamin e", "alpha-tocopherol"],
        "category": "Lipid-Soluble Antioxidant",
        "comedogenic_rating": 1,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Protects cellular membrane polyunsaturated fatty acids from UV lipid peroxidation."
    },
    "allantoin": {
        "canonical_name": "Allantoin",
        "aliases": ["glyoxyldiureide", "5-ureidohydantoin"],
        "category": "Anti-Irritant / Soothing Agent",
        "comedogenic_rating": 0,
        "irritancy_rating": 0,
        "is_active": False,
        "is_allergen": False,
        "role": "Soothes dermal inflammation and stimulates stratum corneum epithelization."
    }
}

# ====================================================================
# Chemical Conflict / Clash Matrix
# ====================================================================
CONFLICT_MATRIX = [
    {
        "actives": ["retinol", "salicylic acid"],
        "severity": "High Hazard",
        "title": "Retinoid + BHA Acid Clash",
        "scientific_rationale": "Combining chemical keratolytics (BHA) with retinoid cellular accelerators induces severe stratum corneum peeling, acid mantle erosion, and transepidermal water loss (TEWL)."
    },
    {
        "actives": ["retinol", "glycolic acid"],
        "severity": "High Hazard",
        "title": "Retinoid + AHA Acid Clash",
        "scientific_rationale": "Simultaneous application of low-pH AHA with Retinol destabilizes retinoid enzymes and creates extreme barrier burning and hyper-reactivity."
    },
    {
        "actives": ["retinol", "benzoyl peroxide"],
        "severity": "High Hazard",
        "title": "Retinoid + Benzoyl Peroxide Inactivation",
        "scientific_rationale": "Benzoyl peroxide's oxidizing free radicals chemically oxidize and deactivate the retinol molecule while multiplying dermal flaking."
    },
    {
        "actives": ["ascorbic acid", "glycolic acid"],
        "severity": "Moderate Hazard",
        "title": "Dual Low-pH Acid Overload",
        "scientific_rationale": "Layering Pure Vitamin C (pH 2.5-3.0) with Glycolic Acid (pH 3.0-3.5) creates cumulative acid shock, triggering micro-inflammation."
    },
    {
        "actives": ["benzoyl peroxide", "ascorbic acid"],
        "severity": "High Hazard",
        "title": "Vitamin C Oxidation",
        "scientific_rationale": "Benzoyl peroxide instantly oxidizes active L-Ascorbic Acid into inactive dehydroascorbic acid."
    }
]

def clean_token(token: str) -> str:
    """Removes percentages, water/aqua prefixes, and parenthetical noise."""
    t = re.sub(r"\d+(\.\d+)?%", "", token)
    t = re.sub(r"\(.*?\)", "", t)
    t = t.replace("aqua", "").replace("eau", "").replace("extract", "").strip()
    return t.lower()

def match_inci_ingredient(raw_token: str):
    """NLP fuzzy token matcher against canonical INCI chemical database."""
    cleaned = clean_token(raw_token)
    if not cleaned or len(cleaned) < 2:
        return None

    # Step 1: Exact key or exact alias match
    for key, data in INCI_DATABASE.items():
        if key == cleaned:
            return data
        if cleaned in data["aliases"]:
            return data

    # Step 2: Word-boundary substring match (prevents "ethanol" from falsely matching "phenoxyethanol")
    for key, data in INCI_DATABASE.items():
        pattern = r"\b" + re.escape(key) + r"\b"
        if re.search(pattern, cleaned):
            return data
        for alias in data["aliases"]:
            alias_pattern = r"\b" + re.escape(alias) + r"\b"
            if re.search(alias_pattern, cleaned):
                return data

    # Step 3: Fuzzy string similarity for typos
    if len(cleaned) >= 4:
        best_match = None
        highest_ratio = 0.0
        for key, data in INCI_DATABASE.items():
            ratio_key = SequenceMatcher(None, cleaned, key).ratio()
            if ratio_key > highest_ratio:
                highest_ratio = ratio_key
                best_match = data
            for alias in data["aliases"]:
                ratio = SequenceMatcher(None, cleaned, alias).ratio()
                if ratio > highest_ratio:
                    highest_ratio = ratio
                    best_match = data
        if highest_ratio >= 0.82:
            return best_match

    return None

def analyze_ingredients_formula(ingredients_text: str, skin_profile=None):
    """
    Complete AI & ML pipeline:
    1. NLP tokenization and INCI standardization
    2. Random Forest Regressor inference (ingredient_safety_model.pkl)
    3. Active chemical conflict detection
    4. Gemini clinical synthesis
    """
    raw_tokens = [t.strip() for t in re.split(r"[,;\n\r]", ingredients_text) if t.strip()]
    if not raw_tokens:
        raw_tokens = ["Water", "Glycerin"]

    parsed_ingredients = []
    seen_keys = set()
    unmatched = []

    for tok in raw_tokens:
        matched = match_inci_ingredient(tok)
        if matched:
            c_name = matched["canonical_name"]
            if c_name not in seen_keys:
                seen_keys.add(c_name)
                parsed_ingredients.append(matched)
        else:
            if len(tok) > 2 and tok.lower() not in ["water", "aqua", "eau"]:
                unmatched.append(tok)

    comedo_ratings = [item["comedogenic_rating"] for item in parsed_ingredients] or [0]
    irrit_ratings = [item["irritancy_rating"] for item in parsed_ingredients] or [0]

    max_c = float(max(comedo_ratings))
    mean_c = float(np.mean(comedo_ratings))
    max_i = float(max(irrit_ratings))
    mean_i = float(np.mean(irrit_ratings))
    
    active_count = sum(1 for item in parsed_ingredients if item.get("is_active"))
    has_allergen = 1 if any(item.get("is_allergen") for item in parsed_ingredients) else 0

    is_sensitive = 1 if (skin_profile and getattr(skin_profile, "is_sensitive", False)) else 0
    patient_skin_type = getattr(skin_profile, "skin_type", "Normal") if skin_profile else "Normal"
    patient_concern = getattr(skin_profile, "primary_concern", "General Care") if skin_profile else "General Care"

    if ingredient_ml_model is not None:
        try:
            x_feature = np.array([[len(raw_tokens), max_c, mean_c, max_i, mean_i, active_count, has_allergen, is_sensitive]])
            preds = ingredient_ml_model.predict(x_feature)[0]
            safety_score = round(float(np.clip(preds[0], 5.0, 100.0)), 1)
            comedo_risk = round(float(np.clip(preds[1], 0.0, 100.0)), 1)
            irrit_risk = round(float(np.clip(preds[2], 0.0, 100.0)), 1)
        except Exception:
            safety_score = round(max(10.0, 100.0 - mean_i * 12.0 - max_c * 5.0), 1)
            comedo_risk = round(min(100.0, max_c * 20.0), 1)
            irrit_risk = round(min(100.0, max_i * 18.0 + active_count * 10.0), 1)
    else:
        safety_score = round(max(10.0, 100.0 - mean_i * 12.0 - max_c * 5.0), 1)
        comedo_risk = round(min(100.0, max_c * 20.0), 1)
        irrit_risk = round(min(100.0, max_i * 18.0 + active_count * 10.0), 1)

    conflicts_detected = []
    parsed_aliases = [p["aliases"] + [k] for k, p in INCI_DATABASE.items() if p in parsed_ingredients]
    flattened_aliases = [item for sublist in parsed_aliases for item in sublist]

    for clash in CONFLICT_MATRIX:
        act1, act2 = clash["actives"]
        has_act1 = any(act1 in a for a in flattened_aliases)
        has_act2 = any(act2 in a for a in flattened_aliases)
        if has_act1 and has_act2:
            conflicts_detected.append(clash)

    patient_warnings = []
    if is_sensitive and has_allergen:
        patient_warnings.append("Sensitive Skin Alert: Formula contains synthetic fragrance or drying alcohol, which triggers erythema in reactive barriers.")
    if "acne" in patient_concern.lower() and max_c >= 4:
        patient_warnings.append("Pore-Clogging Warning: High comedogenic rating detected (Rating 4-5). High risk of follicular occlusion for acne-prone skin.")

    clinical_summary = ""
    if client:
        try:
            prompt = f"""
            Act as a Senior Cosmetic Chemist & Clinical Dermatologist.
            Analyze this product formula:
            - Ingredients parsed: {', '.join(p['canonical_name'] for p in parsed_ingredients)}
            - ML Barrier Safety Score: {safety_score}/100
            - Comedogenic Risk Probability: {comedo_risk}%
            - Irritation Risk Probability: {irrit_risk}%
            - Chemical Conflicts Detected: {json.dumps([c['title'] for c in conflicts_detected])}
            - Patient: Skin Type: {patient_skin_type}, Sensitive: {bool(is_sensitive)}, Concern: {patient_concern}

            Write a 2-3 sentence expert summary: Explain whether this formula is safe, highlight any chemical or pore-clogging issues, and specify optimal application timing.
            """
            resp = client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150
            )
            clinical_summary = resp.choices[0].message.content.strip()
        except Exception:
            clinical_summary = f"Formula evaluated at {safety_score}/100 safety. Contains {active_count} active compounds. Recommended for {patient_skin_type} skin."
    else:
        clinical_summary = f"Formula evaluated at {safety_score}/100 safety. Contains {active_count} active compounds. Recommended for {patient_skin_type} skin."

    return {
        "overall_safety_score": safety_score,
        "comedogenic_risk_pct": comedo_risk,
        "irritation_risk_pct": irrit_risk,
        "ml_engine_type": "Random Forest Multi-Output Formula Regressor (ingredient_safety_model.pkl)",
        "total_parsed": len(parsed_ingredients),
        "parsed_ingredients": parsed_ingredients,
        "unmatched_tokens": unmatched[:6],
        "conflicts_detected": conflicts_detected,
        "patient_warnings": patient_warnings,
        "clinical_summary": clinical_summary
    }
