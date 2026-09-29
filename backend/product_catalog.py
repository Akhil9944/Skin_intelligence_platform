"""
Curated Clinical Skincare Product Catalog.
Covers the 4 fundamental routine steps:
1. Cleansers
2. Serums / Actives
3. Moisturizers
4. Sunscreens (SPF)
"""

PRODUCT_CATALOG = [
    # ========================================================
    # STEP 1: CLEANSERS
    # ========================================================
    {
        "id": "cl-01",
        "name": "Hydrating Gentle Facial Cleanser",
        "brand": "CeraVe",
        "category": "Cleanser",
        "step_label": "Step 1: Cleanser",
        "suitable_skin_types": ["Dry", "Normal", "Sensitive"],
        "target_concerns": ["Dehydration", "Redness", "General Care"],
        "key_ingredients": ["Ceramides", "Hyaluronic Acid", "Glycerin"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Gently washes away dirt without stripping away your skin's natural moisture barrier."
    },
    {
        "id": "cl-02",
        "name": "Foaming Cleanser for Normal to Oily Skin",
        "brand": "CeraVe",
        "category": "Cleanser",
        "step_label": "Step 1: Cleanser",
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "target_concerns": ["Acne", "Pores", "General Care"],
        "key_ingredients": ["Niacinamide", "Ceramides", "Hyaluronic Acid"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Removes excess facial oil and sebum while keeping the skin barrier calm and balanced."
    },
    {
        "id": "cl-03",
        "name": "Effaclar Purifying Salicylic Acid Gel",
        "brand": "La Roche-Posay",
        "category": "Cleanser",
        "step_label": "Step 1: Cleanser",
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Pores"],
        "key_ingredients": ["Salicylic Acid (BHA)", "Zinc PCA", "Thermal Spring Water"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$$",
        "simple_benefit": "Penetrates deep into pores to dissolve oil plugs and fight active acne breakouts."
    },
    {
        "id": "cl-04",
        "name": "Toleriane Dermo-Cleanser for Sensitive Skin",
        "brand": "La Roche-Posay",
        "category": "Cleanser",
        "step_label": "Step 1: Cleanser",
        "suitable_skin_types": ["Sensitive", "Dry", "Normal"],
        "target_concerns": ["Redness", "Rosacea", "General Care"],
        "key_ingredients": ["Thermal Spring Water", "Glycerin"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$$",
        "simple_benefit": "Ultra-calming milk cleanser designed specifically for red, reacting, or hyper-sensitive skin."
    },

    # ========================================================
    # STEP 2: SERUMS / ACTIVES
    # ========================================================
    {
        "id": "sr-01",
        "name": "Niacinamide 10% + Zinc 1% Sebum Control Serum",
        "brand": "The Ordinary",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "target_concerns": ["Acne", "Pores", "Redness"],
        "key_ingredients": ["Niacinamide (Vitamin B3)", "Zinc PCA"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Balances oily shine, shrinks the look of enlarged pores, and calms redness."
    },
    {
        "id": "sr-02",
        "name": "Hyaluronic Acid 2% + B5 Hydration Serum",
        "brand": "The Ordinary",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Dry", "Normal", "Sensitive", "Combination", "Oily"],
        "target_concerns": ["Dehydration", "Aging", "General Care"],
        "key_ingredients": ["Hyaluronic Acid", "Panthenol (Pro-Vitamin B5)"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Pumps intense moisture into skin layers to plump up fine dryness lines and relieve thirst."
    },
    {
        "id": "sr-03",
        "name": "Skin Perfecting 2% BHA Liquid Exfoliant",
        "brand": "Paula's Choice",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "target_concerns": ["Acne", "Pores", "Dullness"],
        "key_ingredients": ["Salicylic Acid (BHA)", "Green Tea Extract"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Night",
        "price_range": "$$$",
        "simple_benefit": "Unclogs stubborn blackheads and smooths rough skin texture overnight."
    },
    {
        "id": "sr-04",
        "name": "10% Azelaic Acid Booster Cream-Gel",
        "brand": "Paula's Choice",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Sensitive", "Oily", "Combination", "Normal", "Dry"],
        "target_concerns": ["Redness", "Rosacea", "Pigmentation", "Acne"],
        "key_ingredients": ["Azelaic Acid", "Salicylic Acid", "Licorice Root"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning or Night",
        "price_range": "$$$",
        "simple_benefit": "Visibly fades dark acne spots and soothes facial flushing and rosacea redness."
    },
    {
        "id": "sr-05",
        "name": "C E Ferulic 15% Vitamin C Antioxidant Serum",
        "brand": "SkinCeuticals",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Dry", "Normal", "Combination"],
        "target_concerns": ["Pigmentation", "Aging", "Dullness"],
        "key_ingredients": ["L-Ascorbic Acid (Vitamin C)", "Tocopherol (Vitamin E)", "Ferulic Acid"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Low (1/5)",
        "routine_time": "Morning",
        "price_range": "$$$",
        "simple_benefit": "Brightens dull skin, shields against sun damage, and boosts firm collagen production."
    },
    {
        "id": "sr-06",
        "name": "Centella Asiatica 100 Ampoule Soothing Serum",
        "brand": "SKIN1004",
        "category": "Serum",
        "step_label": "Step 2: Serum",
        "suitable_skin_types": ["Sensitive", "Dry", "Normal", "Oily", "Combination"],
        "target_concerns": ["Redness", "Rosacea", "General Care"],
        "key_ingredients": ["Centella Asiatica (Cica)"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$$",
        "simple_benefit": "Instant calming relief for irritated, stressed, or burning skin barriers."
    },

    # ========================================================
    # STEP 3: MOISTURIZERS
    # ========================================================
    {
        "id": "mo-01",
        "name": "Daily Moisturizing Barrier Lotion",
        "brand": "CeraVe",
        "category": "Moisturizer",
        "step_label": "Step 3: Moisturizer",
        "suitable_skin_types": ["Dry", "Normal", "Sensitive"],
        "target_concerns": ["Dehydration", "General Care", "Redness"],
        "key_ingredients": ["Ceramides", "Hyaluronic Acid", "Glycerin"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Locks in hydration all day while rebuilding your natural protective barrier."
    },
    {
        "id": "mo-02",
        "name": "Hydro Boost Oil-Free Water Gel",
        "brand": "Neutrogena",
        "category": "Moisturizer",
        "step_label": "Step 3: Moisturizer",
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Dehydration", "Pores"],
        "key_ingredients": ["Hyaluronic Acid", "Glycerin"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$$",
        "simple_benefit": "Ultra-lightweight refreshing water gel that absorbs in seconds without feeling greasy."
    },
    {
        "id": "mo-03",
        "name": "Cicaplast Baume B5+ Ultra-Repairing Balm",
        "brand": "La Roche-Posay",
        "category": "Moisturizer",
        "step_label": "Step 3: Moisturizer",
        "suitable_skin_types": ["Sensitive", "Dry"],
        "target_concerns": ["Redness", "Rosacea", "Dehydration"],
        "key_ingredients": ["Panthenol (Pro-Vitamin B5)", "Madecassoside (Centella)", "Shea Butter"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Low (1/5)",
        "routine_time": "Night",
        "price_range": "$$",
        "simple_benefit": "Intensive SOS recovery balm that heals raw, flaking, or compromised skin overnight."
    },
    {
        "id": "mo-04",
        "name": "Natural Moisturizing Factors + HA",
        "brand": "The Ordinary",
        "category": "Moisturizer",
        "step_label": "Step 3: Moisturizer",
        "suitable_skin_types": ["Normal", "Combination", "Dry", "Oily"],
        "target_concerns": ["General Care", "Dehydration"],
        "key_ingredients": ["Amino Acids", "Ceramides", "Hyaluronic Acid"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning & Night",
        "price_range": "$",
        "simple_benefit": "Non-greasy cream delivering the exact compounds naturally found in healthy skin."
    },

    # ========================================================
    # STEP 4: SUNSCREENS (SPF)
    # ========================================================
    {
        "id": "sp-01",
        "name": "UV Clear Broad-Spectrum SPF 46",
        "brand": "EltaMD",
        "category": "Sunscreen",
        "step_label": "Step 4: Sunscreen (SPF)",
        "suitable_skin_types": ["Oily", "Combination", "Sensitive", "Normal"],
        "target_concerns": ["Acne", "Redness", "Pigmentation"],
        "key_ingredients": ["Zinc Oxide", "Niacinamide", "Hyaluronic Acid"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning",
        "price_range": "$$$",
        "simple_benefit": "Dermatologist favorite for acne-prone skin — calms redness and leaves no white cast."
    },
    {
        "id": "sp-02",
        "name": "Relief Sun: Rice + Probiotics SPF 50+ PA++++",
        "brand": "Beauty of Joseon",
        "category": "Sunscreen",
        "step_label": "Step 4: Sunscreen (SPF)",
        "suitable_skin_types": ["Dry", "Normal", "Sensitive", "Combination"],
        "target_concerns": ["Dehydration", "Dullness", "Aging", "General Care"],
        "key_ingredients": ["Rice Extract", "Grain Ferment", "Niacinamide"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning",
        "price_range": "$$",
        "simple_benefit": "Lightweight lotion texture that feels like a gentle moisturizer with high UV defense."
    },
    {
        "id": "sp-03",
        "name": "Anthelios Melt-in Milk Sunscreen SPF 60",
        "brand": "La Roche-Posay",
        "category": "Sunscreen",
        "step_label": "Step 4: Sunscreen (SPF)",
        "suitable_skin_types": ["Sensitive", "Dry", "Normal"],
        "target_concerns": ["Aging", "Pigmentation", "General Care"],
        "key_ingredients": ["Cell-Ox Shield Antioxidants", "Thermal Spring Water"],
        "is_fragrance_free": True,
        "pore_clogging_level": "Zero (0/5)",
        "routine_time": "Morning",
        "price_range": "$$$",
        "simple_benefit": "Fast-absorbing, water-resistant formula providing strong multi-layer sun defense."
    },
    {
        "id": "sp-04",
        "name": "Aqua Rich Watery Essence SPF 50+ PA++++",
        "brand": "Bioré",
        "category": "Sunscreen",
        "step_label": "Step 4: Sunscreen (SPF)",
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "target_concerns": ["General Care", "Aging"],
        "key_ingredients": ["Hyaluronic Acid", "Royal Jelly"],
        "is_fragrance_free": False,
        "pore_clogging_level": "Low (1/5)",
        "routine_time": "Morning",
        "price_range": "$$",
        "simple_benefit": "Water-like gel texture that vanishes into skin with zero grease or residue."
    }
]
