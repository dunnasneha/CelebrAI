"""
CelebrAI Generative AI Service.
Integrates with Google Gemini API to generate personalized celebration plans,
creative themes, budget optimizations, invitations, timeline schedules,
and interactive event consultation.
"""

import os
import json
import re
from datetime import datetime, timedelta
import dotenv

dotenv.load_dotenv()


def get_api_key():
    """Retrieve Gemini API Key dynamically from environment or .env file."""
    dotenv.load_dotenv()
    return os.environ.get("GEMINI_API_KEY", "").strip()


def get_gemini_model():
    """Instantiate and return the Gemini GenerativeModel if configured."""
    key = get_api_key()
    if not key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        # Prefer fast & capable gemini-1.5-flash
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Notice: Failed to initialize Google Generative AI client: {e}")
        return None


def is_ai_available():
    """Returns True if live Gemini API is configured and accessible."""
    key = get_api_key()
    return bool(key and len(key) > 5)


def _clean_json_response(text):
    """Strip markdown code fences and safely extract the JSON payload."""
    if not text:
        return ""
    text = text.strip()
    
    # 1. Remove ```json ... ``` or ``` ... ```
    if "```" in text:
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

    # 2. If surrounded by extra commentary, extract { ... }
    if not (text.startswith("{") and text.endswith("}")):
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            text = match.group(1).strip()

    return text


def _calculate_date(event_date_str, offset_days):
    """Calculate due date string relative to event date."""
    try:
        dt = datetime.strptime(event_date_str, "%Y-%m-%d")
        target_date = dt + timedelta(days=offset_days)
        return target_date.strftime("%Y-%m-%d")
    except Exception:
        return event_date_str


def generate_event_plan(event_data):
    """
    Generate comprehensive event plan.
    Uses live Gemini API if configured, otherwise falls back to intelligent demo generator.
    """
    if is_ai_available():
        try:
            return _generate_event_plan_gemini(event_data)
        except Exception as err:
            print(f"Gemini live generation notice: {err}. Using structured fallback generator.")
            fallback = _generate_demo_event_plan(event_data)
            fallback["warning"] = f"Live AI call notice ({str(err)}). A structured demo plan was generated."
            return fallback
    else:
        return _generate_demo_event_plan(event_data)


def _generate_event_plan_gemini(event_data):
    """Calls live Google Gemini model with a structured JSON prompt."""
    model = get_gemini_model()
    if not model:
        raise RuntimeError("Gemini model client could not be initialized.")

    name = event_data.get("name", "Celebration")
    etype = event_data.get("event_type", "Celebration")
    date = event_data.get("event_date", datetime.now().strftime("%Y-%m-%d"))
    location = event_data.get("location", "City")
    guests = event_data.get("guests", 50)
    budget = event_data.get("total_budget", 100000)
    theme = event_data.get("theme", "Classic Elegant")
    venue_pref = event_data.get("venue_preference", "Flexible")
    food_pref = event_data.get("food_preference", "Mixed")
    duration = event_data.get("duration", "4 hours")
    special_reqs = event_data.get("special_requirements", "None")
    style = event_data.get("planning_style", "Balanced")

    prompt = f"""
You are CelebrAI, an elite event planner and celebrations director with deep expertise in Indian and international events.
Generate an extraordinary, highly personalized event plan for the following event in valid JSON:

EVENT DETAILS:
- Event Name: {name}
- Event Type: {etype}
- Event Date: {date}
- Location: {location}
- Number of Guests: {guests}
- Total Budget: INR ₹{budget:,.0f}
- Preferred Theme: {theme}
- Venue Preference: {venue_pref}
- Food Preference: {food_pref}
- Duration: {duration}
- Special Requirements: {special_reqs}
- Planning Style: {style}

INSTRUCTIONS:
1. The budget breakdown must sum up to approximately ₹{budget:,.0f}.
2. All category allocations must be in Indian Rupees (INR) as numeric integers.
3. Include a 'Contingency Reserve' category (typically 5-10% of total budget) marked with is_contingency: true.
4. Clearly state that costs are realistic market estimates.
5. In preparation_timeline, provide realistic relative offset_days (negative numbers for days before event, 0 for event day, positive for post-event).
6. Return ONLY a single raw JSON object without commentary, adhering to this exact schema:

{{
  "overview": {{
    "concept": "Unique creative concept summary",
    "theme": "{theme}",
    "atmosphere": "Vibrant, cozy, majestic, etc.",
    "target_audience": "Description of guest demographics",
    "personalized_description": "2-3 paragraphs describing the special celebration",
    "key_considerations": ["Consideration 1", "Consideration 2", "Consideration 3"]
  }},
  "budget_breakdown": [
    {{
      "category": "Venue",
      "allocated_amount": 30000,
      "notes": "Description of venue rental and setup",
      "is_contingency": false
    }},
    {{
      "category": "Catering",
      "allocated_amount": 35000,
      "notes": "Food and beverage per plate estimate",
      "is_contingency": false
    }},
    {{
      "category": "Decorations",
      "allocated_amount": 12000,
      "notes": "Floral, lighting and thematic elements",
      "is_contingency": false
    }},
    {{
      "category": "Photography & Videography",
      "allocated_amount": 8000,
      "notes": "Coverage and edited album",
      "is_contingency": false
    }},
    {{
      "category": "Entertainment",
      "allocated_amount": 5000,
      "notes": "DJ, emcee or live acoustic",
      "is_contingency": false
    }},
    {{
      "category": "Invitations & Favors",
      "allocated_amount": 2000,
      "notes": "Digital invites and guest return gifts",
      "is_contingency": false
    }},
    {{
      "category": "Miscellaneous",
      "allocated_amount": 3000,
      "notes": "Transportation, permits, extras",
      "is_contingency": false
    }},
    {{
      "category": "Contingency Reserve",
      "allocated_amount": 5000,
      "notes": "Emergency safety net for unexpected overruns",
      "is_contingency": true
    }}
  ],
  "preparation_timeline": [
    {{
      "title": "Book Core Venue & Catering",
      "description": "Lock in venue contracts and finalize tasting menu",
      "phase": "Weeks Before",
      "offset_days": -30,
      "priority": "High"
    }},
    {{
      "title": "Send Out Invitations & Track RSVPs",
      "description": "Distribute digital invitations and gather dietary preferences",
      "phase": "Weeks Before",
      "offset_days": -21,
      "priority": "High"
    }},
    {{
      "title": "Finalize Decor & Entertainment Playlist",
      "description": "Align on stage setup, entry moments, and background tracks",
      "phase": "Final Week",
      "offset_days": -7,
      "priority": "Medium"
    }},
    {{
      "title": "Final Vendor Briefing & Confirm Deliveries",
      "description": "Call all booked vendors to confirm arrival timings",
      "phase": "Day Before",
      "offset_days": -1,
      "priority": "Urgent"
    }},
    {{
      "title": "Morning Venue Setup & Sound Check",
      "description": "Oversee floral setup, lighting, and audio equipment test",
      "phase": "Event Day",
      "offset_days": 0,
      "priority": "Urgent"
    }},
    {{
      "title": "Welcome Guests & Opening Address",
      "description": "Start event schedule smoothly with welcome drinks and greetings",
      "phase": "Event Day",
      "offset_days": 0,
      "priority": "High"
    }},
    {{
      "title": "Main Celebration & Feasting",
      "description": "Ceremony/cake cutting/toasts followed by dinner",
      "phase": "Event Day",
      "offset_days": 0,
      "priority": "Medium"
    }},
    {{
      "title": "Vendor Settlements & Thank You Messages",
      "description": "Clear outstanding dues and send heartfelt appreciation notes to guests",
      "phase": "Post-Event",
      "offset_days": 2,
      "priority": "Low"
    }}
  ],
  "vendor_checklist": [
    {{
      "category": "Venue",
      "criteria": "Capacity for {guests} guests, AC/ventilation, parking availability",
      "questions_to_ask": "What is the curfew time? Are outside caterers and decorators allowed?",
      "estimated_cost": 30000,
      "deadline_offset_days": -25
    }},
    {{
      "category": "Catering",
      "criteria": "High hygiene rating, fresh ingredients, customizable menu ({food_pref})",
      "questions_to_ask": "Do you provide live counter service and staff? What is the tasting policy?",
      "estimated_cost": 35000,
      "deadline_offset_days": -20
    }},
    {{
      "category": "Decorations",
      "criteria": "Portfolio matching {theme} aesthetic, fairy lights, floral freshness",
      "questions_to_ask": "How early will setup begin? Is cleanup included in the quote?",
      "estimated_cost": 12000,
      "deadline_offset_days": -14
    }},
    {{
      "category": "Photography",
      "criteria": "Candid storytelling, fast turnaround time, high-res digital gallery",
      "questions_to_ask": "How many photographers will attend? What is the delivery timeframe for reels and albums?",
      "estimated_cost": 8000,
      "deadline_offset_days": -14
    }}
  ],
  "creative_recommendations": {{
    "theme_ideas": ["Idea 1", "Idea 2", "Idea 3"],
    "color_palette": [
      {{"name": "Deep Royal Purple", "hex": "#3B185F"}},
      {{"name": "Warm Cream", "hex": "#FAF7F2"}},
      {{"name": "Soft Rose", "hex": "#F472B6"}},
      {{"name": "Champagne Gold", "hex": "#F59E0B"}}
    ],
    "decorations": [
      "Fairy-lit backdrop with personalized monogram",
      "Floral table centerpieces with warm votive candles",
      "Photo booth station with customized celebration props"
    ],
    "menu_suggestions": {{
      "welcome_drinks": ["Sparkling Spiced Mojito", "Fresh Mango Cardamom Cooler"],
      "appetizers": ["Crispy Paneer/Chicken Tikka Skewers", "Stuffed Mushroom Caps"],
      "mains": ["Rich Dum Biryani / Pulao", "Signature Dal Makhani", "Paneer Lababdar / Butter Chicken", "Artisanal Breads"],
      "desserts": ["Warm Gulab Jamun with Kulfi", "Mini Belgian Chocolate Tarts"]
    }},
    "entertainment_ideas": [
      "Curated playlist transitioning from ambient jazz to energetic dance hits",
      "Interactive memory trivia game or anniversary/birthday quiz",
      "Photo polaroid guestbook station where guests write heartfelt messages"
    ],
    "invitation_draft": "Together with our families, we warmly invite you to celebrate {name} on {date} at {location}. Your presence will make our celebration complete!",
    "guest_engagement": [
      "Live digital photo sharing via QR code",
      "A wishing tree / message jar for warm blessings",
      "Custom favors/treat bags for departing guests"
    ]
  }},
  "risk_management": {{
    "weather_contingency": "For outdoor or terrace segments, secure high-quality canopy tents or reserve an indoor banquet hall backup.",
    "backup_venue": "Keep a list of two nearby banquet halls on standby with flexible deposit policies.",
    "emergency_supplies": "First-aid kit, power bank station, spare safety pins, extension cords, stain remover pens, umbrella sets.",
    "schedule_delays": "Build 20-minute buffer windows between guest arrival, ceremony/toasts, and food service.",
    "budget_overruns": "Maintain a strict 7-10% contingency reserve and request written quotes with no hidden service charges."
  }}
}}
"""

    response = model.generate_content(prompt)
    cleaned = _clean_json_response(response.text)
    data = json.loads(cleaned)

    # Attach calculated real dates
    for task in data.get("preparation_timeline", []):
        offset = task.get("offset_days", 0)
        task["due_date"] = _calculate_date(date, offset)

    for v in data.get("vendor_checklist", []):
        offset = v.get("deadline_offset_days", -14)
        v["deadline"] = _calculate_date(date, offset)

    data["is_ai_generated"] = True
    data["model"] = "Google Gemini 1.5 Flash"
    return data


def _generate_demo_event_plan(event_data):
    """
    Intelligent demo generator tailored dynamically to the user's input.
    Provides realistic estimates, calculated dates, and rich creative content
    so that tests and offline mode produce stellar, fully structured results.
    """
    name = event_data.get("name", "Celebration")
    etype = event_data.get("event_type", "Celebration")
    date = event_data.get("event_date", (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"))
    location = event_data.get("location", "Mumbai, India")
    guests = int(event_data.get("guests", 75))
    budget = float(event_data.get("total_budget", 150000))
    theme = event_data.get("theme", "Regal Elegance")
    venue_pref = event_data.get("venue_preference", "Flexible")
    food_pref = event_data.get("food_preference", "Mixed")
    duration = event_data.get("duration", "4-5 hours")
    special_reqs = event_data.get("special_requirements", "None specified")
    style = event_data.get("planning_style", "Balanced")

    # Allocate realistic proportions based on event type
    if "wedding" in etype.lower():
        v_pct, c_pct, d_pct, p_pct, e_pct, i_pct, m_pct, cont_pct = 0.30, 0.28, 0.14, 0.10, 0.06, 0.03, 0.03, 0.06
    elif "birthday" in etype.lower():
        v_pct, c_pct, d_pct, p_pct, e_pct, i_pct, m_pct, cont_pct = 0.22, 0.35, 0.16, 0.08, 0.08, 0.02, 0.03, 0.06
    elif "college" in etype.lower():
        v_pct, c_pct, d_pct, p_pct, e_pct, i_pct, m_pct, cont_pct = 0.20, 0.25, 0.15, 0.08, 0.15, 0.04, 0.05, 0.08
    else:
        v_pct, c_pct, d_pct, p_pct, e_pct, i_pct, m_pct, cont_pct = 0.28, 0.30, 0.14, 0.09, 0.06, 0.03, 0.03, 0.07

    venue_amt = round(budget * v_pct)
    cater_amt = round(budget * c_pct)
    decor_amt = round(budget * d_pct)
    photo_amt = round(budget * p_pct)
    ent_amt = round(budget * e_pct)
    inv_amt = round(budget * i_pct)
    misc_amt = round(budget * m_pct)
    cont_amt = round(budget * cont_pct)

    # Ensure total matches
    diff = budget - (venue_amt + cater_amt + decor_amt + photo_amt + ent_amt + inv_amt + misc_amt + cont_amt)
    misc_amt += diff

    return {
        "is_ai_generated": False,
        "mode": "demo",
        "notice": "Demo Mode: Pre-structured Template (Configure GEMINI_API_KEY in .env for live GenAI generation).",
        "overview": {
            "concept": f"A breathtaking {style.lower()} celebration centered on '{theme}', seamlessly blending warmth, style, and hospitality.",
            "theme": theme,
            "atmosphere": f"Warm, celebratory, and intimately vibrant, designed to delight {guests} cherished guests in {location}.",
            "target_audience": f"Friends, family, and colleagues coming together for a memorable {etype.lower()}.",
            "personalized_description": (
                f"{name} is crafted to be an unforgettable milestone celebration. "
                f"Held in {location} with {guests} attendees, every element from the {venue_pref.lower()} ambiance to the "
                f"{food_pref.lower()} banquet is curated to ensure effortless enjoyment and timeless memories."
            ),
            "key_considerations": [
                f"Optimal per-guest budget allocation of approximately ₹{int(budget / max(1, guests)):,.0f}",
                f"Comfortable arrangement for {venue_pref} venue with adequate seasonal ventilation",
                f"Specially curated {food_pref} food menu with live serving stations"
            ]
        },
        "budget_breakdown": [
            {"category": "Venue", "allocated_amount": venue_amt, "notes": f"Space rental for {duration} with basic facilities", "is_contingency": False},
            {"category": "Catering", "allocated_amount": cater_amt, "notes": f"Full {food_pref} buffet for {guests} guests with welcome drinks", "is_contingency": False},
            {"category": "Decorations", "allocated_amount": decor_amt, "notes": f"Themed entrance arch, stage backdrop, and table florals in {theme} style", "is_contingency": False},
            {"category": "Photography & Videography", "allocated_amount": photo_amt, "notes": "Candid photographer, edited highlight reel, and digital album", "is_contingency": False},
            {"category": "Entertainment", "allocated_amount": ent_amt, "notes": "DJ sound console, dynamic lighting, and celebration emcee", "is_contingency": False},
            {"category": "Invitations & Favors", "allocated_amount": inv_amt, "notes": "Custom digital motion invitations and themed return gift boxes", "is_contingency": False},
            {"category": "Miscellaneous", "allocated_amount": misc_amt, "notes": "Local transport, cake/treats, service gratuities, and emergency extras", "is_contingency": False},
            {"category": "Contingency Reserve", "allocated_amount": cont_amt, "notes": "Dedicated 6-8% safety buffer for unplanned expenses", "is_contingency": True}
        ],
        "preparation_timeline": [
            {
                "title": f"Select and Book {venue_pref} Venue",
                "description": f"Inspect venues in {location} capable of seating {guests} guests with adequate parking.",
                "phase": "Weeks Before",
                "due_date": _calculate_date(date, -30),
                "priority": "High"
            },
            {
                "title": f"Finalize {food_pref} Catering Menu",
                "description": "Lock in plate counts, starter selections, live counters, and dietary alternatives.",
                "phase": "Weeks Before",
                "due_date": _calculate_date(date, -20),
                "priority": "High"
            },
            {
                "title": "Send Digital Invitations & Collect RSVPs",
                "description": "Dispatch WhatsApp motion invites and keep an updated attendee head-count.",
                "phase": "Weeks Before",
                "due_date": _calculate_date(date, -14),
                "priority": "Medium"
            },
            {
                "title": f"Approve '{theme}' Decor & Floral Layout",
                "description": "Sign off on photobooth design, welcome board, and stage lighting with decorator.",
                "phase": "Final Week",
                "due_date": _calculate_date(date, -7),
                "priority": "Medium"
            },
            {
                "title": "Vendor Reconfirmation Call",
                "description": "Confirm setup timings with venue manager, caterer, photographer, and sound technician.",
                "phase": "Day Before",
                "due_date": _calculate_date(date, -1),
                "priority": "Urgent"
            },
            {
                "title": "Morning Venue Setup & Sound Check",
                "description": "Inspect stage setup, test microphones, inspect floral freshness, and verify power backup.",
                "phase": "Event Day",
                "due_date": _calculate_date(date, 0),
                "priority": "Urgent"
            },
            {
                "title": "Welcome Guests & Opening Ceremony",
                "description": "Serve welcome mocktails, inaugurate celebration, and kick off scheduled activities.",
                "phase": "Event Day",
                "due_date": _calculate_date(date, 0),
                "priority": "High"
            },
            {
                "title": "Dinner Buffet & Celebration Moments",
                "description": "Open buffet dinner, capture group photographs, and run entertainment segments.",
                "phase": "Event Day",
                "due_date": _calculate_date(date, 0),
                "priority": "Medium"
            },
            {
                "title": "Vendor Settlements & Return Gifts",
                "description": "Hand over return gifts to departing guests and settle vendor balances.",
                "phase": "Post-Event",
                "due_date": _calculate_date(date, 1),
                "priority": "Low"
            }
        ],
        "vendor_checklist": [
            {
                "category": "Venue",
                "criteria": f"Clean aesthetic, capacity for {guests} guests, {venue_pref} preference, generator backup",
                "questions_to_ask": "What are the sound limit curfews? Are outside decor vendors permitted with no extra surcharge?",
                "estimated_cost": venue_amt,
                "deadline": _calculate_date(date, -25)
            },
            {
                "category": "Catering",
                "criteria": f"Verified reviews, fresh {food_pref} specialties, uniformed serving staff",
                "questions_to_ask": "Can you provide live tasting sessions? What is the cut-off date for final headcount adjustment?",
                "estimated_cost": cater_amt,
                "deadline": _calculate_date(date, -20)
            },
            {
                "category": "Decorations",
                "criteria": f"Specialized in '{theme}' visual themes, fairy-lighting, fresh floral styling",
                "questions_to_ask": "How many hours before the event does your team begin installation?",
                "estimated_cost": decor_amt,
                "deadline": _calculate_date(date, -15)
            },
            {
                "category": "Photography",
                "criteria": "Artistic candid captures, dynamic reels, rapid 7-day highlight turnaround",
                "questions_to_ask": "Will you provide uncompressed high-resolution digital copies of all photos?",
                "estimated_cost": photo_amt,
                "deadline": _calculate_date(date, -14)
            },
            {
                "category": "Entertainment",
                "criteria": "High-energy playlist curation, reliable sound equipment, versatile emcee",
                "questions_to_ask": "Do you accept custom guest song requests and interactive party games?",
                "estimated_cost": ent_amt,
                "deadline": _calculate_date(date, -10)
            }
        ],
        "creative_recommendations": {
            "theme_ideas": [
                f"{theme} — Subtle luxury with velvet textures, gold metallic accents, and warm ambient lighting",
                "Royal Twilight — Deep jewel tones of amethyst and champagne with whimsical fairy light curtains",
                "Botanical Serenity — Fresh eucalyptus leaves, blush florals, and natural wood accents"
            ],
            "color_palette": [
                {"name": "Deep Royal Purple", "hex": "#2E1065"},
                {"name": "Soft Rose", "hex": "#FB7185"},
                {"name": "Warm Cream", "hex": "#FAF7F2"},
                {"name": "Champagne Gold", "hex": "#F59E0B"}
            ],
            "decorations": [
                "Custom geometric welcome arch draped in sheer organza and warm fairy lights",
                f"Personalized '{name}' photo-wall with gold neon script and cascading floral garlands",
                "Tables styled with warm cream runners, brass candelabras, and handwritten name cards"
            ],
            "menu_suggestions": {
                "welcome_drinks": ["Sparkling Hibiscus Mojito", "Chilled Saffron Almond Thandai", "Fresh Mint Lime Cooler"],
                "appetizers": ["Crispy Amritsari Paneer Bites / Chicken Kebabs", "Truffle Cheese Poppers", "Lotus Stem Crisps"],
                "mains": ["Signature Dal Makhani slow-cooked 18 hours", "Paneer Pasanda / Butter Chicken", "Fragrant Awadhi Dum Biryani with Burani Raita", "Assorted Butter Naan & Kulchas"],
                "desserts": ["Saffron Phirni in earthen pots", "Sizzling Walnut Brownie with Vanilla Bean Gelato", "Fresh Fruit Skewers"]
            },
            "entertainment_ideas": [
                "Curated Spotify DJ set transitioning from lounge acoustic vibes to upbeat dance anthems",
                f"Personalized {etype} Trivia Challenge with customized prizes for the winning table",
                "Instant Polaroid Guestbook station where guests snap photos and tape them with handwritten notes"
            ],
            "invitation_draft": f"You make our world brighter! Please join us as we celebrate {name} on {date} at {location}. An evening of laughter, exquisite feasting, and cherished moments awaits your arrival.",
            "guest_engagement": [
                "QR code on every table linking to a shared live Google Photos album",
                "Signature drink named after the host/guest of honor",
                "Heartfelt memory box where guests drop handwritten wishes"
            ]
        },
        "risk_management": {
            "weather_contingency": f"Ensure {venue_pref} venue has an immediate covered banquet section or weatherproof canopy in case of rain or high heat.",
            "backup_venue": "Maintain confirmed contacts for two alternative nearby spaces with refundable advance policies.",
            "emergency_supplies": "Equip the host lounge with a celebration emergency kit: lint rollers, safety pins, phone chargers, pain relievers, and umbrellas.",
            "schedule_delays": "Add a 25-minute grace period between the scheduled invitation arrival time and main cake-cutting/ceremony.",
            "budget_overruns": f"Keep the ₹{cont_amt:,.0f} contingency intact; do not commit extra custom add-ons within 72 hours of the event."
        }
    }


def improve_theme(event_data, current_theme=""):
    """Suggest 3 creative alternative themes with color palettes and styling."""
    etype = event_data.get("event_type", "Celebration")
    style = event_data.get("planning_style", "Balanced")

    if is_ai_available():
        model = get_gemini_model()
        if model:
            try:
                prompt = f"""
Suggest 3 fresh, creative, and distinct theme concepts for a {etype} ({style} style, current theme: '{current_theme}').
Return ONLY a valid JSON object matching this structure:
{{
  "themes": [
    {{
      "name": "Theme Name",
      "tagline": "Catchy one-sentence vibe",
      "description": "2-sentence concept description",
      "colors": [
        {{"name": "Color 1", "hex": "#123456"}},
        {{"name": "Color 2", "hex": "#abcdef"}},
        {{"name": "Color 3", "hex": "#fedcba"}}
      ],
      "decor_highlights": ["Decor point 1", "Decor point 2"],
      "music_vibe": "Ambient jazz transitioning to acoustic indie pop"
    }}
  ]
}}
"""
                res = model.generate_content(prompt)
                return json.loads(_clean_json_response(res.text))
            except Exception as e:
                print(f"Gemini improve_theme notice: {e}")

    # Fallback themes
    return {
        "themes": [
            {
                "name": "Enchanted Starlit Soirée",
                "tagline": "Whimsical twilight elegance bathed in soft glowing amber",
                "description": "Transform the space into an ethereal evening glade with cascading fairy lights, midnight blue drapery, and brass lanterns.",
                "colors": [
                    {"name": "Midnight Indigo", "hex": "#1E1B4B"},
                    {"name": "Champagne Gold", "hex": "#F59E0B"},
                    {"name": "Warm Cream", "hex": "#FAF7F2"}
                ],
                "decor_highlights": ["Ceiling of fairy light canopies", "Low floral centerpieces with scented pillar candles"],
                "music_vibe": "Chilled acoustic covers and soulful saxophone lounge"
            },
            {
                "name": "Royal Moroccan Sunset",
                "tagline": "Warm terracotta warmth, bohemian lanterns, and rich spice tones",
                "description": "An intimate, vibrant celebration featuring patterned floor cushions, low brass tables, and fragrant botanical flourishes.",
                "colors": [
                    {"name": "Terracotta Rose", "hex": "#BE185D"},
                    {"name": "Saffron Spice", "hex": "#D97706"},
                    {"name": "Deep Plum", "hex": "#4C1D95"}
                ],
                "decor_highlights": ["Intricate brass cut lanterns casting shadow art", "Plush velvet lounge seating area"],
                "music_vibe": "Upbeat Mediterranean chillhop and lively world beats"
            },
            {
                "name": "Minimalist Garden Chic",
                "tagline": "Clean modern lines, lush eucalyptus, and fresh organic elegance",
                "description": "An understated luxury aesthetic prioritizing natural greenery, warm wood elements, and crystal glass accents.",
                "colors": [
                    {"name": "Forest Green", "hex": "#065F46"},
                    {"name": "Blush Petal", "hex": "#FBCFE8"},
                    {"name": "Ivory Alabaster", "hex": "#FFFBEB"}
                ],
                "decor_highlights": ["Suspended eucalyptus foliage chandeliers", "Personalized wooden calligraphy placecards"],
                "music_vibe": "Bossa nova, lo-fi beats, and modern acoustic pop"
            }
        ]
    }


def optimize_budget(event_data, budget_items):
    """Analyze current budget and suggest actionable savings and reallocations."""
    total_budget = float(event_data.get("total_budget", 100000))

    if is_ai_available():
        model = get_gemini_model()
        if model:
            try:
                items_str = json.dumps([{"category": i.get("category"), "amount": i.get("allocated_amount")} for i in budget_items])
                prompt = f"""
You are a senior event financial strategist. Analyze this event budget of INR ₹{total_budget:,.0f} with current items:
{items_str}

Provide 4 practical, specific cost-saving opportunities without compromising guest experience.
Return ONLY valid JSON:
{{
  "analysis": "Summary of budget distribution health",
  "tips": [
    {{
      "title": "Strategy title",
      "category": "Category impacted",
      "potential_saving": "Estimated ₹ saving range",
      "action": "Concrete action to take"
    }}
  ]
}}
"""
                res = model.generate_content(prompt)
                return json.loads(_clean_json_response(res.text))
            except Exception as e:
                print(f"Gemini optimize_budget notice: {e}")

    # Fallback optimization response
    return {
        "analysis": f"Your current budget of ₹{total_budget:,.0f} has strong foundational allocations. By optimizing catering formats and decor sourcing, you can unlock 12-18% in strategic savings.",
        "tips": [
            {
                "title": "Adopt Hybrid Grazing & Live Counters",
                "category": "Catering",
                "potential_saving": f"₹{int(total_budget * 0.05):,.0f}",
                "action": "Instead of an oversized 24-item static buffet, feature 3 premium live counters and a curated 8-dish seasonal menu to eliminate food waste."
            },
            {
                "title": "Reusable & Statement Decor Focus",
                "category": "Decorations",
                "potential_saving": f"₹{int(total_budget * 0.04):,.0f}",
                "action": "Invest heavily in one 'showstopper' photo backdrop and use warm ambient uplighting rather than spreading flowers thinly across all walls."
            },
            {
                "title": "Digital First & Motion Invites",
                "category": "Invitations",
                "potential_saving": f"₹{int(total_budget * 0.02):,.0f}",
                "action": "Replace expensive physical boxed stationery with interactive WhatsApp web invitations and digital RSVP forms."
            },
            {
                "title": "Package Photography with Videography",
                "category": "Photography",
                "potential_saving": f"₹{int(total_budget * 0.03):,.0f}",
                "action": "Negotiate a combined dual-shooter package with a single studio instead of booking solo photographers and videographers separately."
            }
        ]
    }


def generate_invitation(event_data):
    """Generate invitation drafts in multiple tones (Formal, Warm & Casual, Poetic, WhatsApp)."""
    name = event_data.get("name", "Special Celebration")
    etype = event_data.get("event_type", "Celebration")
    date = event_data.get("event_date", "Upcoming Date")
    loc = event_data.get("location", "Venue")
    theme = event_data.get("theme", "Celebration")

    if is_ai_available():
        model = get_gemini_model()
        if model:
            try:
                prompt = f"""
Write 4 distinct invitation copy versions for this event:
- Event: {name} ({etype})
- Date: {date}
- Location: {loc}
- Theme: {theme}

Generate:
1. Formal (Traditional, dignified)
2. Casual (Warm, friendly)
3. Poetic (Emotional, elegant)
4. WhatsApp (Emoji-rich, bullet points, RSVP format)

Return ONLY valid JSON:
{{
  "formal": "text",
  "casual": "text",
  "poetic": "text",
  "whatsapp": "text"
}}
"""
                res = model.generate_content(prompt)
                return json.loads(_clean_json_response(res.text))
            except Exception as e:
                print(f"Gemini generate_invitation notice: {e}")

    # Fallback invitations
    return {
        "formal": (
            f"We request the pleasure of your company at the celebration of {name}.\n\n"
            f"Date: {date}\n"
            f"Venue: {loc}\n"
            f"Theme: {theme}\n\n"
            f"Your gracious presence will add warmth and joy to this auspicious occasion. Kindly RSVP at your earliest convenience."
        ),
        "casual": (
            f"Good times are better when shared with friends! 🎉\n\n"
            f"Come celebrate {name} with us on {date} at {loc}.\n"
            f"Expect great food, fabulous drinks, wonderful music, and unforgettable memories.\n\n"
            f"We can't wait to see you there!"
        ),
        "poetic": (
            f"Moments pass, but beautiful memories linger forever.\n\n"
            f"As we celebrate the joy of {name}, we invite you to be part of our story on {date} at {loc}.\n"
            f"Under a canopy of laughter and starlight, your presence will be our greatest gift."
        ),
        "whatsapp": (
            f"✨ *YOU ARE CORDIALLY INVITED!* ✨\n\n"
            f"🎈 *Event:* {name} ({etype})\n"
            f"📅 *Date:* {date}\n"
            f"📍 *Venue:* {loc}\n"
            f"🎨 *Dress Code / Theme:* {theme}\n\n"
            f"🥂 *Highlights:* Exquisite dinner, live entertainment & joyous moments!\n\n"
            f"📲 *Please RSVP by clicking here:* [RSVP Link]\n"
            f"Looking forward to celebrating with you! ❤️"
        )
    }


def suggest_activities(event_data):
    """Generate curated activities/games tailored to the guest count and event type."""
    etype = event_data.get("event_type", "Celebration")
    guests = event_data.get("guests", 50)

    if is_ai_available():
        model = get_gemini_model()
        if model:
            try:
                prompt = f"""
Suggest 5 engaging, modern party activities and games for a {etype} with approximately {guests} guests.
Ensure they break the ice, are respectful and fun, and do not feel childish or awkward.
Return ONLY valid JSON:
{{
  "activities": [
    {{
      "title": "Activity Name",
      "duration": "15-20 mins",
      "best_time": "Cocktail hour / After dessert",
      "how_it_works": "Step-by-step description",
      "supplies_needed": ["Item 1", "Item 2"]
    }}
  ]
}}
"""
                res = model.generate_content(prompt)
                return json.loads(_clean_json_response(res.text))
            except Exception as e:
                print(f"Gemini suggest_activities notice: {e}")

    # Fallback activities
    return {
        "activities": [
            {
                "title": "The Memory Capsule & Polaroid Wall",
                "duration": "Ongoing throughout event",
                "best_time": "Guest Arrival / Welcome Drinks",
                "how_it_works": "Guests snap instant photos with customized props, write their warmest memory or blessing on the photo border, and peg it onto a fairy-lit twine board.",
                "supplies_needed": ["2 Fuji Instax or Polaroid cameras", "Extra film packs", "Metallic Sharpies", "Twine board with mini wooden clips"]
            },
            {
                "title": "Personalized Trivia Showdown",
                "duration": "20-25 mins",
                "best_time": "Mid-celebration right before dinner",
                "how_it_works": "An interactive 8-question game hosted by the emcee or a friend using smartphone buzzers (Kahoot) or card paddles, centered on fun facts about the hosts or event honoree.",
                "supplies_needed": ["Projector or audio microphone", "Kahoot PIN or printed voting paddle cards", "Small gift hamper for the winner"]
            },
            {
                "title": "Musical 'Through the Decades' Groove",
                "duration": "30 mins",
                "best_time": "Post-dinner dance transition",
                "how_it_works": "The DJ drops iconic anthems starting from the 80s/90s up through current chart-toppers, challenging each table to take over the dance floor during their era.",
                "supplies_needed": ["Sound system / DJ", "Glow sticks or party sunglasses"]
            },
            {
                "title": "Cocktail / Mocktail Signature Toast Challenge",
                "duration": "15 mins",
                "best_time": "Dinner kickoff",
                "how_it_works": "Guests are served the signature celebration drink. Selected close friends and family deliver 60-second rapid-fire toasts celebrating love, friendship, or milestone achievements.",
                "supplies_needed": ["Signature welcome beverages", "Wireless microphone"]
            },
            {
                "title": "The Golden Envelope Surprise",
                "duration": "10 mins",
                "best_time": "Cake cutting / Finale",
                "how_it_works": "One secret envelope is taped beneath one chair at each dining table. At a designated cue, guests check under their seats. The lucky holders win a special curated takeaway favor.",
                "supplies_needed": ["Golden envelopes with congratulations vouchers", "Curated artisanal favor boxes"]
            }
        ]
    }


def ask_celebr_ai(event_data, user_message, conversation_history=None):
    """
    Conversational AI assistant providing specialized advice tailored directly
    to the active event plan.
    """
    if conversation_history is None:
        conversation_history = []

    name = event_data.get("name", "Celebration")
    etype = event_data.get("event_type", "Celebration")
    date = event_data.get("event_date", "")
    loc = event_data.get("location", "")
    budget = event_data.get("total_budget", 0)
    guests = event_data.get("guests", 0)

    if is_ai_available():
        model = get_gemini_model()
        if model:
            try:
                history_text = ""
                for item in conversation_history[-6:]:
                    role = item.get("role", "user")
                    content = item.get("content", "")
                    history_text += f"{role.upper()}: {content}\n"

                prompt = f"""
You are CelebrAI, an expert, enthusiastic, and sophisticated AI event concierge.
You are helping the user plan their event with these details:
- Event: {name} ({etype})
- Date: {date}
- Location: {loc}
- Budget: INR ₹{budget:,.0f}
- Guests: {guests}

CONVERSATION HISTORY:
{history_text}

USER'S CURRENT QUESTION:
{user_message}

Provide a thoughtful, practical, and highly creative response in clear markdown format.
Keep recommendations realistic for their budget and location.
Offer proactive follow-up suggestions where helpful.
"""
                res = model.generate_content(prompt)
                return {"reply": res.text.strip(), "is_ai": True}
            except Exception as e:
                print(f"Gemini ask_celebr_ai notice: {e}")

    # Fallback smart reply
    reply = (
        f"Thank you for asking about **{name}**! "
        f"For a {etype.lower()} with {guests} guests in {loc} on a budget of ₹{budget:,.0f}, "
        f"here is my expert recommendation:\n\n"
        f"1. **Timing & Logistics:** Ensure vendors arrive at least 3 hours prior to guest arrival. "
        f"Stagger arrivals to prevent parking congestion in {loc}.\n"
        f"2. **Budget Safety:** Remember to reserve at least ₹{int(budget * 0.06):,.0f} as your contingency buffer "
        f"to absorb last-minute plate count additions or extra service hours.\n"
        f"3. **Guest Experience:** Focus 70% of guest attention on outstanding food freshness and smooth acoustics. "
        f"Guests remember heartfelt hospitality far longer than extravagant table linens!\n\n"
        f"*(Note: Configure your GEMINI_API_KEY in .env to unlock real-time streaming conversational GenAI!)*"
    )
    return {"reply": reply, "is_ai": False}
