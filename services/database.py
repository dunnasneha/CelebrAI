"""
SQLite Database Layer for CelebrAI.
Handles persistence for events, budget allocations, timeline tasks, and vendors.
Thread-safe, parameterized queries, cascade deletions, and guaranteed connection cleanup.
"""

import sqlite3
import json
import os
from contextlib import contextmanager
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database.db")


@contextmanager
def get_db():
    """
    Context manager that yields a configured SQLite connection and guarantees
    proper commit, rollback on error, and connection closure on exit.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize database tables and seed an initial sample event if empty."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                event_type TEXT NOT NULL,
                event_date TEXT NOT NULL,
                location TEXT NOT NULL,
                guests INTEGER NOT NULL DEFAULT 50,
                total_budget REAL NOT NULL DEFAULT 100000,
                theme TEXT,
                venue_preference TEXT DEFAULT 'Flexible',
                food_preference TEXT DEFAULT 'Mixed',
                duration TEXT DEFAULT '4-5 hours',
                special_requirements TEXT,
                planning_style TEXT DEFAULT 'Balanced',
                overview_json TEXT,
                creative_json TEXT,
                risk_json TEXT,
                status TEXT DEFAULT 'Planning',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Budget Items table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS budget_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                category TEXT NOT NULL,
                allocated_amount REAL NOT NULL DEFAULT 0,
                actual_spent REAL NOT NULL DEFAULT 0,
                notes TEXT,
                is_contingency BOOLEAN DEFAULT 0,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """)

        # Timeline Tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS timeline_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                phase TEXT NOT NULL DEFAULT 'Weeks Before',
                due_date TEXT,
                priority TEXT DEFAULT 'Medium',
                is_completed BOOLEAN DEFAULT 0,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """)

        # Vendors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vendors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id INTEGER NOT NULL,
                category TEXT NOT NULL,
                criteria TEXT,
                questions_to_ask TEXT,
                estimated_cost REAL DEFAULT 0,
                status TEXT DEFAULT 'Not Started',
                notes TEXT,
                contact_info TEXT,
                deadline TEXT,
                FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
            )
        """)

    # Seed sample if empty
    _seed_sample_event_if_empty()


def _seed_sample_event_if_empty():
    """Seed a sample celebration plan so first-time users can immediately explore."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM events")
        count = cursor.fetchone()[0]
        if count == 0:
            sample_date = (datetime.now() + timedelta(days=45)).strftime("%Y-%m-%d")
            sample_event = {
                "name": "Aarav & Diya's Royal Sangeet",
                "event_type": "Wedding",
                "event_date": sample_date,
                "location": "Udaipur, Rajasthan",
                "guests": 120,
                "total_budget": 500000,
                "theme": "Regal Marigold & Twilight Amethyst",
                "venue_preference": "Outdoor",
                "food_preference": "Mixed",
                "duration": "6 hours",
                "special_requirements": "Outdoor lakeside courtyard with acoustic stage setup and live dessert counter",
                "planning_style": "Premium"
            }
            overview = {
                "concept": "A grand heritage Sangeet celebration fusing classic Rajasthani elegance with contemporary celebration music.",
                "theme": "Regal Marigold & Twilight Amethyst",
                "atmosphere": "Opulent, festive, and warm with lakeside reflections and candlelit pathways.",
                "target_audience": "Families, friends, and wedding guests enjoying musical performances.",
                "personalized_description": "An unforgettable evening overlooking Lake Pichola, featuring dynamic dance performances, live acoustic folk singers, and an indulgent royal Rajasthani banquet.",
                "key_considerations": [
                    "Outdoor acoustic permit until 10:00 PM; late-night transition to indoor heritage lounge",
                    "Dedicated weather-safe sheer canopies along the lakeside courtyard",
                    "Live artisanal chaat counter and traditional Ghewar dessert display"
                ]
            }
            creative = {
                "theme_ideas": ["Regal Marigold & Twilight Amethyst", "Emerald Oasis & Brass Antiques"],
                "color_palette": [
                    {"name": "Deep Amethyst Purple", "hex": "#2E1065"},
                    {"name": "Warm Marigold Gold", "hex": "#F59E0B"},
                    {"name": "Soft Rose", "hex": "#FB7185"},
                    {"name": "Ivory Cream", "hex": "#FAF7F2"}
                ],
                "decorations": [
                    "Brass urlis filled with fresh marigold petals and floating diya candles",
                    "Fairy-lit velvet drapes framing the elevated wooden dance stage",
                    "Lakeside illuminated photo wall with custom couple monogram"
                ],
                "menu_suggestions": {
                    "welcome_drinks": ["Saffron Almond Thandai", "Fresh Pomegranate Cardamom Spritzer"],
                    "appetizers": ["Dahi Kebab with Mint Chutney", "Murgh Malai Tikka Skewers", "Crispy Lotus Root Bites"],
                    "mains": ["Dal Baati Churma Royal Thali", "Slow-cooked Mutton Laal Maas", "Paneer Kundan Kalia", "Garlic Butter Naan"],
                    "desserts": ["Warm Malpua with Rabdi", "Smoked Jalebi Caviar with Pistachio Kulfi"]
                },
                "entertainment_ideas": [
                    "Choreographed family dance face-off",
                    "Live traditional Manganiyar folk ensemble to welcome guests",
                    "Retro Bollywood DJ session with customized dhol players"
                ],
                "invitation_draft": "Together with our families, we invite you to an evening of music, dance, and celebration as Aarav & Diya celebrate their Sangeet on the shores of Lake Pichola.",
                "guest_engagement": [
                    "Bangles and customized potli favor giveaway station for ladies",
                    "Turban-tying and safa stylist booth for gentleman guests",
                    "Polaroid memories corner with vintage brass photo frames"
                ]
            }
            risk = {
                "weather_contingency": "Reserved adjacent indoor Durbar Hall in case of unexpected evening rain or high lakeside winds.",
                "backup_venue": "Indoor banquet on same property reserved with no extra transfer fee.",
                "emergency_supplies": "First-aid box, safety pins, wireless mics, emergency generator, shawl baskets for chilly breeze.",
                "schedule_delays": "Planned 30-minute buffer for guest arrivals before formal dance performances commence.",
                "budget_overruns": "Strict ₹35,000 contingency reserve retained for extra food plates."
            }

            cursor.execute("""
                INSERT INTO events (
                    name, event_type, event_date, location, guests, total_budget,
                    theme, venue_preference, food_preference, duration,
                    special_requirements, planning_style, overview_json,
                    creative_json, risk_json, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sample_event["name"], sample_event["event_type"], sample_event["event_date"],
                sample_event["location"], sample_event["guests"], sample_event["total_budget"],
                sample_event["theme"], sample_event["venue_preference"], sample_event["food_preference"],
                sample_event["duration"], sample_event["special_requirements"], sample_event["planning_style"],
                json.dumps(overview), json.dumps(creative), json.dumps(risk), "Planning"
            ))
            event_id = cursor.lastrowid

            # Budget items
            b_items = [
                ("Venue & Courtyard Rental", 140000, 50000, "Heritage courtyard with lawn lighting and power generator", 0),
                ("Royal Catering & Banquet", 150000, 30000, "Full multi-course Rajasthani dinner + live chaat & dessert counters", 0),
                ("Decor, Florals & Stage", 70000, 20000, "Marigold draping, floral photo-arch, candlelit walkway", 0),
                ("Photography & Cinematic Reel", 45000, 15000, "2 candid photographers + 1 drone videographer + 60-sec teaser", 0),
                ("Sound, Stage, DJ & Dhol", 35000, 10000, "High-end sound system, wireless mics, moving head lights, DJ & Dholak", 0),
                ("Invitations & Digital Motion Cards", 10000, 10000, "Bespoke digital watercolor invites + printed table menus", 0),
                ("Guest Favors & Welcome Props", 15000, 5000, "Handmade potlis, bangles, floral jewelry, and embroidered safas", 0),
                ("Contingency Reserve", 35000, 0, "Safety buffer for unexpected plate additions or overtime hours", 1)
            ]
            for cat, alloc, spent, notes, is_c in b_items:
                cursor.execute("""
                    INSERT INTO budget_items (event_id, category, allocated_amount, actual_spent, notes, is_contingency)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (event_id, cat, alloc, spent, notes, is_c))

            # Timeline tasks
            tasks = [
                ("Book Lakeside Courtyard Venue", "Inspect sound curfews, power generator, and rain backup hall", "Weeks Before", (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"), "High", 1),
                ("Finalize Royal Banquet Tasting", "Sample dal baati, laal maas, and live chaat recipes", "Weeks Before", (datetime.now() + timedelta(days=22)).strftime("%Y-%m-%d"), "High", 1),
                ("Choreography & Music Tracks", "Conduct dance rehearsals with family members and send playlist to DJ", "Weeks Before", (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"), "Medium", 0),
                ("Dispatch Motion Invites & Collect RSVPs", "Confirm headcounts for catering and guest room reservations", "Final Week", (datetime.now() + timedelta(days=38)).strftime("%Y-%m-%d"), "High", 0),
                ("Stage & Lighting Sound Check", "Test microphones, wireless lapels, and moving head lights", "Day Before", (datetime.now() + timedelta(days=44)).strftime("%Y-%m-%d"), "Urgent", 0),
                ("Welcome Guests & Sangeet Performance", "Kick off evening with welcome thandai, folk welcome, and dances", "Event Day", sample_date, "Urgent", 0),
                ("Vendor Settlements & Thank You Cards", "Clear final vendor invoices and send photo gallery link to guests", "Post-Event", (datetime.now() + timedelta(days=47)).strftime("%Y-%m-%d"), "Low", 0)
            ]
            for title, desc, phase, due, prio, done in tasks:
                cursor.execute("""
                    INSERT INTO timeline_tasks (event_id, title, description, phase, due_date, priority, is_completed)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (event_id, title, desc, phase, due, prio, done))

            # Vendors
            vendors_seed = [
                ("Venue", "Heritage lake-view property, outdoor acoustic permission, valet parking", "What is the deposit policy for rain backup?", 140000, "Booked", "Confirmed with manager Mr. Sharma", "+91 98290 12345", (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")),
                ("Catering", "Authentic Rajasthani culinary team with live preparation stalls", "Will you supply uniformed service staff and chinaware?", 150000, "Booked", "Tasting completed and menu signed", "+91 98290 67890", (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d")),
                ("Decorations", "Specialist in marigold installations, fairy lights, and brass props", "How early will the stage backdrop be ready for sound check?", 70000, "Contacted", "Awaiting revised quotation for floral arch", "RoyalDecor Udaipur", (datetime.now() + timedelta(days=25)).strftime("%Y-%m-%d")),
                ("Photography", "Storytelling candid photography + same-day reel editor", "When will the teaser video and unedited photos be delivered?", 45000, "Contacted", "Shortlisted 2 photographers", "contact@candidmoments.in", (datetime.now() + timedelta(days=28)).strftime("%Y-%m-%d")),
                ("Entertainment", "Renowned DJ with high-energy Bollywood/Sangeet mixes + dhol players", "Do you carry backup mixers and laptop systems?", 35000, "Not Started", "Interviewing 2 local DJs", "DJ Rajat", (datetime.now() + timedelta(days=32)).strftime("%Y-%m-%d"))
            ]
            for cat, crit, q, cost, st, n, c_info, dl in vendors_seed:
                cursor.execute("""
                    INSERT INTO vendors (event_id, category, criteria, questions_to_ask, estimated_cost, status, notes, contact_info, deadline)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (event_id, cat, crit, q, cost, st, n, c_info, dl))


# Database CRUD Operations

def save_generated_plan(event_data, plan_result):
    """
    Saves an AI-generated or demo plan to the database.
    Creates event record, budget items, timeline tasks, and vendor items.
    """
    with get_db() as conn:
        cursor = conn.cursor()

        overview = plan_result.get("overview", {})
        creative = plan_result.get("creative_recommendations", {})
        risk = plan_result.get("risk_management", {})

        cursor.execute("""
            INSERT INTO events (
                name, event_type, event_date, location, guests, total_budget,
                theme, venue_preference, food_preference, duration,
                special_requirements, planning_style, overview_json,
                creative_json, risk_json, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event_data.get("name"),
            event_data.get("event_type"),
            event_data.get("event_date"),
            event_data.get("location"),
            int(event_data.get("guests", 50)),
            float(event_data.get("total_budget", 100000)),
            event_data.get("theme", ""),
            event_data.get("venue_preference", "Flexible"),
            event_data.get("food_preference", "Mixed"),
            event_data.get("duration", "4 hours"),
            event_data.get("special_requirements", ""),
            event_data.get("planning_style", "Balanced"),
            json.dumps(overview),
            json.dumps(creative),
            json.dumps(risk),
            "Planning"
        ))
        event_id = cursor.lastrowid

        # Insert budget items
        budget_list = plan_result.get("budget_breakdown", [])
        for item in budget_list:
            is_cont = 1 if item.get("is_contingency") else 0
            cursor.execute("""
                INSERT INTO budget_items (event_id, category, allocated_amount, actual_spent, notes, is_contingency)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                event_id,
                item.get("category", "General"),
                float(item.get("allocated_amount", 0)),
                0.0,
                item.get("notes", ""),
                is_cont
            ))

        # Insert timeline tasks
        tasks = plan_result.get("preparation_timeline", [])
        for idx, task in enumerate(tasks):
            cursor.execute("""
                INSERT INTO timeline_tasks (event_id, title, description, phase, due_date, priority, is_completed, order_index)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            """, (
                event_id,
                task.get("title", "Task"),
                task.get("description", ""),
                task.get("phase", "Weeks Before"),
                task.get("due_date", event_data.get("event_date")),
                task.get("priority", "Medium"),
                idx
            ))

        # Insert vendors
        vendors = plan_result.get("vendor_checklist", [])
        for v in vendors:
            cursor.execute("""
                INSERT INTO vendors (event_id, category, criteria, questions_to_ask, estimated_cost, status, notes, contact_info, deadline)
                VALUES (?, ?, ?, ?, ?, 'Not Started', ?, '', ?)
            """, (
                event_id,
                v.get("category", "Vendor"),
                v.get("criteria", ""),
                v.get("questions_to_ask", ""),
                float(v.get("estimated_cost", 0)),
                "",
                v.get("deadline", "")
            ))

        return event_id


def get_all_events():
    """Retrieve all saved events with summary stats."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.*,
                (SELECT COUNT(*) FROM timeline_tasks t WHERE t.event_id = e.id) as total_tasks,
                (SELECT COUNT(*) FROM timeline_tasks t WHERE t.event_id = e.id AND t.is_completed = 1) as completed_tasks,
                (SELECT SUM(allocated_amount) FROM budget_items b WHERE b.event_id = e.id) as total_allocated
            FROM events e
            ORDER BY e.event_date ASC
        """)
        rows = cursor.fetchall()
        events = []
        for r in rows:
            events.append(dict(r))
        return events


def get_event_by_id(event_id):
    """Retrieve single event record with parsed JSON fields."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        row = cursor.fetchone()
        if not row:
            return None
        event = dict(row)
        try:
            event["overview"] = json.loads(event.get("overview_json") or "{}")
        except Exception:
            event["overview"] = {}
        try:
            event["creative"] = json.loads(event.get("creative_json") or "{}")
        except Exception:
            event["creative"] = {}
        try:
            event["risk"] = json.loads(event.get("risk_json") or "{}")
        except Exception:
            event["risk"] = {}
        return event


def update_event(event_id, data):
    """Update event primary fields with parameterized safety."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE events SET
                name = COALESCE(?, name),
                event_type = COALESCE(?, event_type),
                event_date = COALESCE(?, event_date),
                location = COALESCE(?, location),
                guests = COALESCE(?, guests),
                total_budget = COALESCE(?, total_budget),
                theme = COALESCE(?, theme),
                venue_preference = COALESCE(?, venue_preference),
                food_preference = COALESCE(?, food_preference),
                duration = COALESCE(?, duration),
                special_requirements = COALESCE(?, special_requirements),
                planning_style = COALESCE(?, planning_style),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            data.get("name"),
            data.get("event_type"),
            data.get("event_date"),
            data.get("location"),
            data.get("guests"),
            data.get("total_budget"),
            data.get("theme"),
            data.get("venue_preference"),
            data.get("food_preference"),
            data.get("duration"),
            data.get("special_requirements"),
            data.get("planning_style"),
            data.get("status"),
            event_id
        ))
        return cursor.rowcount > 0


def delete_event(event_id):
    """Delete an event and its cascading child records."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
        return cursor.rowcount > 0


def duplicate_event(event_id):
    """Clone an event along with all its budget items, tasks, and vendors."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        orig = cursor.fetchone()
        if not orig:
            return None
        
        orig_dict = dict(orig)
        new_name = f"Copy of {orig_dict['name']}"
        
        cursor.execute("""
            INSERT INTO events (
                name, event_type, event_date, location, guests, total_budget,
                theme, venue_preference, food_preference, duration,
                special_requirements, planning_style, overview_json,
                creative_json, risk_json, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Planning')
        """, (
            new_name, orig_dict["event_type"], orig_dict["event_date"],
            orig_dict["location"], orig_dict["guests"], orig_dict["total_budget"],
            orig_dict["theme"], orig_dict["venue_preference"], orig_dict["food_preference"],
            orig_dict["duration"], orig_dict["special_requirements"], orig_dict["planning_style"],
            orig_dict["overview_json"], orig_dict["creative_json"], orig_dict["risk_json"]
        ))
        new_event_id = cursor.lastrowid

        # Duplicate budget items
        cursor.execute("SELECT * FROM budget_items WHERE event_id = ?", (event_id,))
        for b in cursor.fetchall():
            cursor.execute("""
                INSERT INTO budget_items (event_id, category, allocated_amount, actual_spent, notes, is_contingency)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (new_event_id, b["category"], b["allocated_amount"], 0, b["notes"], b["is_contingency"]))

        # Duplicate timeline tasks
        cursor.execute("SELECT * FROM timeline_tasks WHERE event_id = ?", (event_id,))
        for t in cursor.fetchall():
            cursor.execute("""
                INSERT INTO timeline_tasks (event_id, title, description, phase, due_date, priority, is_completed, order_index)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
            """, (new_event_id, t["title"], t["description"], t["phase"], t["due_date"], t["priority"], t["order_index"]))

        # Duplicate vendors
        cursor.execute("SELECT * FROM vendors WHERE event_id = ?", (event_id,))
        for v in cursor.fetchall():
            cursor.execute("""
                INSERT INTO vendors (event_id, category, criteria, questions_to_ask, estimated_cost, status, notes, contact_info, deadline)
                VALUES (?, ?, ?, ?, ?, 'Not Started', ?, ?, ?)
            """, (new_event_id, v["category"], v["criteria"], v["questions_to_ask"], v["estimated_cost"], v["notes"], v["contact_info"], v["deadline"]))

        return new_event_id


# Budget Operations
def get_budget_items(event_id):
    """Retrieve all budget items for an event."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM budget_items WHERE event_id = ? ORDER BY is_contingency ASC, id ASC", (event_id,))
        return [dict(r) for r in cursor.fetchall()]


def update_budget_items(event_id, items):
    """Replaces or updates the budget items for an event."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM budget_items WHERE event_id = ?", (event_id,))
        for item in items:
            cat = item.get("category", "General")
            allocated = float(item.get("allocated_amount", 0))
            spent = float(item.get("actual_spent", 0))
            notes = item.get("notes", "")
            is_cont = 1 if bool(item.get("is_contingency")) or "contingency" in cat.lower() else 0
            cursor.execute("""
                INSERT INTO budget_items (event_id, category, allocated_amount, actual_spent, notes, is_contingency)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (event_id, cat, allocated, spent, notes, is_cont))
        return True


# Timeline Operations
def get_timeline_tasks(event_id):
    """Retrieve all tasks for an event ordered chronologically."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM timeline_tasks
            WHERE event_id = ?
            ORDER BY
                CASE phase
                    WHEN 'Weeks Before' THEN 1
                    WHEN 'Final Week' THEN 2
                    WHEN 'Day Before' THEN 3
                    WHEN 'Event Day' THEN 4
                    WHEN 'Post-Event' THEN 5
                    ELSE 6
                END,
                due_date ASC, id ASC
        """, (event_id,))
        return [dict(r) for r in cursor.fetchall()]


def add_timeline_task(event_id, data):
    """Add a new task."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO timeline_tasks (event_id, title, description, phase, due_date, priority, is_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            event_id,
            data.get("title", "New Task"),
            data.get("description", ""),
            data.get("phase", "Weeks Before"),
            data.get("due_date", ""),
            data.get("priority", "Medium"),
            1 if data.get("is_completed") else 0
        ))
        return cursor.lastrowid


def update_timeline_task(task_id, data):
    """Update task details or toggle completion."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE timeline_tasks SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                phase = COALESCE(?, phase),
                due_date = COALESCE(?, due_date),
                priority = COALESCE(?, priority),
                is_completed = COALESCE(?, is_completed)
            WHERE id = ?
        """, (
            data.get("title"),
            data.get("description"),
            data.get("phase"),
            data.get("due_date"),
            data.get("priority"),
            1 if data.get("is_completed") is True else (0 if data.get("is_completed") is False else None),
            task_id
        ))
        return cursor.rowcount > 0


def delete_timeline_task(task_id):
    """Delete a task."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM timeline_tasks WHERE id = ?", (task_id,))
        return cursor.rowcount > 0


# Vendor Operations
def get_vendors(event_id):
    """Retrieve all vendors for an event."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vendors WHERE event_id = ? ORDER BY id ASC", (event_id,))
        return [dict(r) for r in cursor.fetchall()]


def add_vendor(event_id, data):
    """Add a new vendor record."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO vendors (event_id, category, criteria, questions_to_ask, estimated_cost, status, notes, contact_info, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event_id,
            data.get("category", "Vendor"),
            data.get("criteria", ""),
            data.get("questions_to_ask", ""),
            float(data.get("estimated_cost", 0)),
            data.get("status", "Not Started"),
            data.get("notes", ""),
            data.get("contact_info", ""),
            data.get("deadline", "")
        ))
        return cursor.lastrowid


def update_vendor(vendor_id, data):
    """Update vendor details, status, contact info, notes."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE vendors SET
                category = COALESCE(?, category),
                criteria = COALESCE(?, criteria),
                questions_to_ask = COALESCE(?, questions_to_ask),
                estimated_cost = COALESCE(?, estimated_cost),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes),
                contact_info = COALESCE(?, contact_info),
                deadline = COALESCE(?, deadline)
            WHERE id = ?
        """, (
            data.get("category"),
            data.get("criteria"),
            data.get("questions_to_ask"),
            data.get("estimated_cost"),
            data.get("status"),
            data.get("notes"),
            data.get("contact_info"),
            data.get("deadline"),
            vendor_id
        ))
        return cursor.rowcount > 0


def delete_vendor(vendor_id):
    """Delete a vendor."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vendors WHERE id = ?", (vendor_id,))
        return cursor.rowcount > 0


# Dashboard Metrics
def get_dashboard_metrics():
    """Calculates overall metrics across all saved events."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM events")
        total_events = cursor.fetchone()[0]

        today_str = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("SELECT COUNT(*) FROM events WHERE event_date >= ?", (today_str,))
        upcoming_events = cursor.fetchone()[0]

        cursor.execute("SELECT SUM(total_budget) FROM events")
        total_budget_sum = cursor.fetchone()[0] or 0.0

        cursor.execute("SELECT COUNT(*) FROM timeline_tasks WHERE is_completed = 1")
        completed_tasks = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM timeline_tasks")
        total_tasks = cursor.fetchone()[0]

        return {
            "total_events": total_events,
            "upcoming_events": upcoming_events,
            "total_budget_sum": total_budget_sum,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks
        }
