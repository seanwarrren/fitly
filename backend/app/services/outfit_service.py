"""Outfit generation service — rule-based outfit selection from the user's wardrobe."""

import random
from app.services.garment_service import get_garments_for_user

# ---------------------------------------------------------------------------
# Keyword maps: prompt words -> internal cue values
# ---------------------------------------------------------------------------

WEATHER_KEYWORDS: dict[str, list[str]] = {
    "hot":       ["hot", "scorching", "heat wave", "sweltering", "really warm"],
    "warm":      ["warm", "sunny", "nice out", "pleasant"],
    "cool":      ["cool", "breezy", "chilly", "crisp", "brisk"],
    "cold":      ["cold", "freezing", "snow", "icy", "frigid", "winter"],
    "rainy":     ["rain", "rainy", "wet", "drizzle", "storm", "umbrella"],
}

FORMALITY_KEYWORDS: dict[str, list[str]] = {
    "casual":          ["class", "school", "errand", "chill", "hang out",
                        "casual", "relaxed", "lounge", "movie"],
    "smart casual":    ["dinner", "date", "brunch", "going out", "party",
                        "night out", "bar", "club", "concert"],
    "business casual": ["work", "office", "meeting", "presentation",
                        "interview", "conference", "business"],
    "formal":          ["formal", "wedding", "gala", "ceremony", "black tie",
                        "cocktail"],
    "athletic":        ["gym", "workout", "run", "exercise", "sport",
                        "training", "hike", "yoga", "athletic"],
}

# Which formalities are compatible (a "smart casual" garment works for casual too)
FORMALITY_COMPAT: dict[str, set[str]] = {
    "casual":          {"casual", "smart casual"},
    "smart casual":    {"casual", "smart casual", "business casual"},
    "business casual": {"smart casual", "business casual", "formal"},
    "formal":          {"business casual", "formal"},
    "athletic":        {"athletic", "casual"},
}

OUTFIT_SLOTS = ["top", "bottom", "outerwear", "shoes", "accessory"]

# Map category values to slot names
CATEGORY_TO_SLOT: dict[str, str] = {
    "top":       "top",
    "bottom":    "bottom",
    "outerwear": "outerwear",
    "shoes":     "shoes",
    "accessory": "accessory",
}


# ---------------------------------------------------------------------------
# Prompt analysis
# ---------------------------------------------------------------------------

def _detect_cues(prompt: str) -> tuple[list[str], list[str]]:
    """Scan the prompt for weather and formality cues.

    Returns (weather_cues, formality_cues) — lists of matched internal values.
    """
    lower = prompt.lower()

    weather: list[str] = []
    for cue, keywords in WEATHER_KEYWORDS.items():
        if any(kw in lower for kw in keywords) or cue in lower:
            weather.append(cue)

    formality: list[str] = []
    for cue, keywords in FORMALITY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            formality.append(cue)

    return weather, formality


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _score_garment(
    garment: dict,
    weather_cues: list[str],
    formality_cues: list[str],
) -> int:
    """Score a garment based on how well it matches the detected cues.

    Higher is better. A garment that matches nothing still gets a base score
    of 1, so we can still pick it when no better option exists.
    """
    score = 1

    # Weather match: +3 per overlapping weather tag
    garment_weather = set(garment.get("weatherSuitability", []))
    for w in weather_cues:
        if w in garment_weather:
            score += 3

    # Formality match
    garment_formality = garment.get("formality", "")
    if formality_cues:
        target = formality_cues[0]
        compatible = FORMALITY_COMPAT.get(target, {target})
        if garment_formality in compatible:
            score += 4
        elif garment_formality == target:
            score += 6
    else:
        # No formality cue detected — slight boost for casual (safe default)
        if garment_formality == "casual":
            score += 1

    return score


# ---------------------------------------------------------------------------
# Selection
# ---------------------------------------------------------------------------

def _pick_best(
    candidates: list[dict],
    weather_cues: list[str],
    formality_cues: list[str],
) -> dict | None:
    """Return the best-scoring garment from candidates, with random tiebreaking."""
    if not candidates:
        return None

    scored = [(g, _score_garment(g, weather_cues, formality_cues)) for g in candidates]
    max_score = max(s for _, s in scored)
    top_tier = [g for g, s in scored if s == max_score]
    return random.choice(top_tier)


# ---------------------------------------------------------------------------
# Reasoning builder
# ---------------------------------------------------------------------------

def _build_reasoning(
    weather_cues: list[str],
    formality_cues: list[str],
    outfit: dict[str, dict | None],
) -> str:
    parts: list[str] = []

    if weather_cues:
        parts.append(f"Detected weather: {', '.join(weather_cues)}.")
    else:
        parts.append("No specific weather cues detected — used general preferences.")

    if formality_cues:
        parts.append(f"Detected occasion: {', '.join(formality_cues)}.")
    else:
        parts.append("No specific occasion detected — defaulted to casual.")

    filled = [slot for slot in OUTFIT_SLOTS if outfit.get(slot)]
    missing = [slot for slot in OUTFIT_SLOTS if not outfit.get(slot)]

    if filled:
        parts.append(f"Selected: {', '.join(filled)}.")
    if missing:
        parts.append(
            f"No {', '.join(missing)} available in your wardrobe — "
            "upload more garments to fill these slots."
        )

    return " ".join(parts)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def generate_outfit(user_id: str, prompt: str) -> dict:
    """Generate a rule-based outfit for the given user from their wardrobe."""

    garments = await get_garments_for_user(user_id)
    weather_cues, formality_cues = _detect_cues(prompt)

    # Group garments by their outfit slot
    by_slot: dict[str, list[dict]] = {slot: [] for slot in OUTFIT_SLOTS}
    for g in garments:
        slot = CATEGORY_TO_SLOT.get(g.get("category", ""), None)
        if slot:
            by_slot[slot].append(g)

    # Pick one garment per slot
    outfit: dict[str, dict | None] = {}
    for slot in OUTFIT_SLOTS:
        outfit[slot] = _pick_best(by_slot[slot], weather_cues, formality_cues)

    # Outerwear is optional — skip if weather is hot/warm and nothing scores well
    if outfit.get("outerwear") and weather_cues:
        if all(w in ("hot", "warm") for w in weather_cues):
            outfit["outerwear"] = None

    reasoning = _build_reasoning(weather_cues, formality_cues, outfit)

    return {
        "success": True,
        "outfit": outfit,
        "reasoning": reasoning,
    }
