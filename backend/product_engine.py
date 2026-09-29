"""
Simple AI & ML-Powered Product Recommendation Engine.

How it works:
1. Machine Learning (scikit-learn):
   - Uses TF-IDF and Cosine Similarity to compare the user's skin profile
     against each product's active ingredients and targeted benefits.
   - Computes a mathematical Compatibility Match Score (e.g. 95% Match).
2. Generative AI (Gemini 2.5 Flash):
   - Adds a friendly, 1-sentence explanation in plain English
     stating exactly why this product fits the user's skin.
"""

import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from product_catalog import PRODUCT_CATALOG

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


def generate_simple_ai_reason(product: dict, skin_type: str, primary_concern: str) -> str:
    """
    Generates a simple, plain-English 1-sentence note on why this product fits the user.
    """
    if client:
        try:
            prompt = (
                f"In 1 simple, friendly sentence (under 16 words), explain why {product['brand']} {product['name']} "
                f"is great for someone with {skin_type} skin and {primary_concern} concern. "
                f"Use plain everyday words, no medical jargon."
            )
            resp = client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50
            )
            text = resp.choices[0].message.content.strip().replace('"', '')
            if len(text) > 10:
                return text
        except Exception:
            pass

    # Instant fallback if AI API is unreachable
    ingredients_hint = " & ".join(product["key_ingredients"][:2])
    return f"Great for your {skin_type.lower()} skin because it uses {ingredients_hint} to target {primary_concern.lower()}."


def get_product_recommendations(
    skin_type: str = "Normal",
    primary_concern: str = "General Care",
    is_sensitive: bool = False,
    category_filter: str = None
):
    """
    Ranks products using scikit-learn Content-Based Vector Matching.
    """
    skin_type = skin_type or "Normal"
    primary_concern = primary_concern or "General Care"

    # 1. Build text representations for each product in the catalog
    product_corpus = []
    for p in PRODUCT_CATALOG:
        text = (
            f"{p['category']} "
            f"{' '.join(p['suitable_skin_types'])} "
            f"{' '.join(p['target_concerns'])} "
            f"{' '.join(p['key_ingredients'])} "
            f"{p['simple_benefit']}"
        )
        product_corpus.append(text)

    # 2. Build user profile query text
    user_query = f"{skin_type} {primary_concern} {'Sensitive Skin Gentle' if is_sensitive else 'Normal'}"

    # 3. Vectorize using TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(product_corpus)
    user_vec = vectorizer.transform([user_query])

    # 4. Calculate mathematical Cosine Similarity scores
    cosine_sims = cosine_similarity(user_vec, tfidf_matrix).flatten()

    # 5. Score calibration and safety adjustments
    matched_products = []
    for idx, p in enumerate(PRODUCT_CATALOG):
        sim = float(cosine_sims[idx])

        # Base match score scaled to an intuitive 65% - 98% percentage
        # Extra boost if the product explicitly lists the user's exact skin type or concern
        type_boost = 0.08 if skin_type.lower() in [s.lower() for s in p["suitable_skin_types"]] else 0.0
        concern_boost = 0.10 if any(c.lower() in primary_concern.lower() for c in p["target_concerns"]) else 0.0

        total_sim = sim + type_boost + concern_boost
        match_percentage = int(np.clip(62.0 + total_sim * 36.0, 60.0, 98.0))

        # Safety adjustment for sensitive skin:
        # Penalize products that contain artificial fragrance
        if is_sensitive and not p.get("is_fragrance_free", True):
            match_percentage = max(50, match_percentage - 15)

        # Oily skin safety check
        if skin_type.lower() == "oily" and "medium" in p.get("pore_clogging_level", "").lower():
            match_percentage = max(50, match_percentage - 8)

        ai_reason = generate_simple_ai_reason(p, skin_type, primary_concern)

        product_entry = {
            **p,
            "match_percentage": match_percentage,
            "ai_reason": ai_reason
        }
        matched_products.append(product_entry)

    # 6. Sort all products by highest match percentage first
    matched_products.sort(key=lambda x: x["match_percentage"], reverse=True)

    # 7. Apply optional category filter (e.g. "Cleanser", "Serum", etc.)
    if category_filter and category_filter.lower() != "all":
        filtered_products = [
            p for p in matched_products 
            if p["category"].lower() == category_filter.lower()
        ]
    else:
        filtered_products = matched_products

    return {
        "user_profile_summary": {
            "skin_type": skin_type,
            "primary_concern": primary_concern,
            "is_sensitive": is_sensitive
        },
        "ml_engine_type": "TF-IDF Vector Space & Cosine Similarity Matcher (scikit-learn)",
        "total_recommended": len(filtered_products),
        "products": filtered_products
    }
