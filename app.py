"""
CelebrAI — AI-Powered Celebration & Event Planner
Flask Application & Server Routes
"""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, abort
from dotenv import load_dotenv

# Load environment configuration
load_dotenv()

from services.database import (
    init_db, get_all_events, get_event_by_id, update_event, delete_event,
    duplicate_event, save_generated_plan, get_budget_items, update_budget_items,
    get_timeline_tasks, add_timeline_task, update_timeline_task, delete_timeline_task,
    get_vendors, add_vendor, update_vendor, delete_vendor, get_dashboard_metrics
)
from services.budget_service import calculate_budget_summary, format_inr
from services.ai_service import (
    generate_event_plan, improve_theme, optimize_budget,
    generate_invitation, suggest_activities, ask_celebr_ai, is_ai_available
)
from services.pdf_service import generate_event_pdf

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "celebr-ai-secret-key-production-ready")
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024  # 4MB request size limit

# Initialize database on startup
init_db()


# Security Headers
@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Jinja Template Filters
@app.template_filter("inr")
def inr_filter(value):
    return format_inr(value)


@app.context_processor
def inject_global_vars():
    """Inject app metadata and AI status across all templates."""
    return {
        "app_name": "CelebrAI",
        "tagline": "Plan Beautiful Moments, Effortlessly.",
        "ai_active": is_ai_available(),
        "current_year": datetime.now().year
    }


# ==========================================
# PAGE ROUTES
# ==========================================

@app.route("/")
def index():
    """Landing page showcasing CelebrAI features and sample preview."""
    events = get_all_events()
    featured_event = events[0] if events else None
    return render_template("index.html", featured_event=featured_event)


@app.route("/dashboard")
def dashboard():
    """Main dashboard showing event metrics, statistics, and saved plans."""
    events = get_all_events()
    metrics = get_dashboard_metrics()
    return render_template("dashboard.html", events=events, metrics=metrics)


@app.route("/create-event")
def create_event():
    """Event creation wizard with live validation and AI prompt generator."""
    return render_template("create_event.html")


@app.route("/event/<int:event_id>")
def event_details(event_id):
    """Event details workspace showing overview, creative blueprint, and risk safeguards."""
    event = get_event_by_id(event_id)
    if not event:
        return render_template("404.html", message="Event not found"), 404
    budget_items = get_budget_items(event_id)
    budget_summary = calculate_budget_summary(event["total_budget"], budget_items)
    timeline = get_timeline_tasks(event_id)
    vendors = get_vendors(event_id)
    return render_template(
        "event_details.html",
        event=event,
        budget_summary=budget_summary,
        timeline=timeline,
        vendors=vendors
    )


@app.route("/event/<int:event_id>/budget")
def event_budget(event_id):
    """Smart budget dashboard with interactive Chart.js expense visualization."""
    event = get_event_by_id(event_id)
    if not event:
        return render_template("404.html", message="Event not found"), 404
    items = get_budget_items(event_id)
    summary = calculate_budget_summary(event["total_budget"], items)
    return render_template("budget.html", event=event, summary=summary)


@app.route("/event/<int:event_id>/timeline")
def event_timeline(event_id):
    """Dynamic, adaptive timeline based on actual event date."""
    event = get_event_by_id(event_id)
    if not event:
        return render_template("404.html", message="Event not found"), 404
    tasks = get_timeline_tasks(event_id)
    
    # Calculate progress
    total = len(tasks)
    completed = sum(1 for t in tasks if t["is_completed"])
    progress_pct = round((completed / total * 100), 1) if total > 0 else 0

    return render_template(
        "timeline.html",
        event=event,
        tasks=tasks,
        total_tasks=total,
        completed_tasks=completed,
        progress_pct=progress_pct
    )


@app.route("/event/<int:event_id>/vendors")
def event_vendors(event_id):
    """Interactive vendor checklist and question guide."""
    event = get_event_by_id(event_id)
    if not event:
        return render_template("404.html", message="Event not found"), 404
    vendors = get_vendors(event_id)
    return render_template("vendors.html", event=event, vendors=vendors)


# ==========================================
# API ROUTES
# ==========================================

@app.route("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        "status": "healthy",
        "app": "CelebrAI",
        "ai_active": is_ai_available(),
        "timestamp": datetime.now().isoformat()
    })


@app.route("/api/generate-plan", methods=["POST"])
def api_generate_plan():
    """
    Core AI Planning endpoint:
    Accepts validated event form, executes GenAI generation,
    and persists the complete event in SQLite.
    """
    try:
        data = request.get_json() or {}
        
        # Validation
        name = data.get("name", "").strip()
        etype = data.get("event_type", "").strip()
        date_str = data.get("event_date", "").strip()
        location = data.get("location", "").strip()

        if not name or not etype or not date_str or not location:
            return jsonify({"success": False, "error": "Event name, type, date, and location are required."}), 400

        try:
            guests = int(data.get("guests", 50))
            if guests <= 0:
                return jsonify({"success": False, "error": "Guest count must be at least 1."}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Invalid guest count."}), 400

        try:
            budget = float(data.get("total_budget", 100000))
            if budget <= 0:
                return jsonify({"success": False, "error": "Budget must be a positive amount in INR."}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Invalid budget amount."}), 400

        # Construct sanitized payload
        event_payload = {
            "name": name,
            "event_type": etype,
            "event_date": date_str,
            "location": location,
            "guests": guests,
            "total_budget": budget,
            "theme": data.get("theme", "Classic Elegant").strip(),
            "venue_preference": data.get("venue_preference", "Flexible"),
            "food_preference": data.get("food_preference", "Mixed"),
            "duration": data.get("duration", "4-5 hours").strip(),
            "special_requirements": data.get("special_requirements", "").strip(),
            "planning_style": data.get("planning_style", "Balanced")
        }

        # Invoke AI generation
        plan_result = generate_event_plan(event_payload)

        # Save to database
        event_id = save_generated_plan(event_payload, plan_result)

        return jsonify({
            "success": True,
            "event_id": event_id,
            "is_ai": plan_result.get("is_ai_generated", False),
            "mode": plan_result.get("mode", "live"),
            "notice": plan_result.get("notice") or plan_result.get("warning"),
            "redirect_url": url_for("event_details", event_id=event_id)
        })

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to generate event plan: {str(e)}"}), 500


@app.route("/api/events", methods=["GET"])
def api_get_events():
    """Return all saved events as JSON."""
    events = get_all_events()
    return jsonify({"success": True, "events": events})


@app.route("/api/events/<int:event_id>", methods=["GET"])
def api_get_event(event_id):
    """Return specific event details with child entities."""
    event = get_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "error": "Event not found"}), 404
    budget_items = get_budget_items(event_id)
    summary = calculate_budget_summary(event["total_budget"], budget_items)
    tasks = get_timeline_tasks(event_id)
    vendors = get_vendors(event_id)
    return jsonify({
        "success": True,
        "event": event,
        "budget": summary,
        "tasks": tasks,
        "vendors": vendors
    })


@app.route("/api/events/<int:event_id>", methods=["PUT"])
def api_update_event(event_id):
    """Update event primary fields."""
    data = request.get_json() or {}
    
    # Safe numerical conversions if provided
    if "guests" in data:
        try:
            data["guests"] = int(data["guests"])
        except (ValueError, TypeError):
            pass
            
    if "total_budget" in data:
        try:
            data["total_budget"] = float(data["total_budget"])
        except (ValueError, TypeError):
            pass

    success = update_event(event_id, data)
    if not success:
        return jsonify({"success": False, "error": "Failed to update event or event not found"}), 400
    return jsonify({"success": True, "message": "Event updated successfully"})


@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def api_delete_event(event_id):
    """Delete an event."""
    success = delete_event(event_id)
    if not success:
        return jsonify({"success": False, "error": "Event not found or failed to delete"}), 404
    return jsonify({"success": True, "message": "Event deleted successfully"})


@app.route("/api/events/<int:event_id>/duplicate", methods=["POST"])
def api_duplicate_event(event_id):
    """Duplicate an event plan."""
    new_id = duplicate_event(event_id)
    if not new_id:
        return jsonify({"success": False, "error": "Failed to duplicate event"}), 404
    return jsonify({
        "success": True,
        "new_event_id": new_id,
        "redirect_url": url_for("event_details", event_id=new_id)
    })


@app.route("/api/events/<int:event_id>/budget/update", methods=["POST"])
def api_update_budget(event_id):
    """Save modified budget items list."""
    data = request.get_json() or {}
    items = data.get("items", [])
    success = update_budget_items(event_id, items)
    if not success:
        return jsonify({"success": False, "error": "Failed to save budget"}), 400
    
    event = get_event_by_id(event_id)
    fresh_items = get_budget_items(event_id)
    summary = calculate_budget_summary(event["total_budget"], fresh_items)
    return jsonify({"success": True, "summary": summary})


# ==========================================
# SPECIALIZED AI ACTION ROUTES
# ==========================================

@app.route("/api/generate-theme", methods=["POST"])
def api_generate_theme():
    """Suggest 3 creative alternative theme concepts."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    event = get_event_by_id(event_id) if event_id else data
    current_theme = data.get("current_theme") or (event.get("theme") if event else "")
    res = improve_theme(event or {}, current_theme)
    return jsonify({"success": True, "result": res})


@app.route("/api/optimize-budget", methods=["POST"])
def api_optimize_budget():
    """Analyze event budget allocations and provide savings recommendations."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    event = get_event_by_id(event_id) if event_id else data
    items = get_budget_items(event_id) if event_id else data.get("items", [])
    res = optimize_budget(event or {}, items)
    return jsonify({"success": True, "result": res})


@app.route("/api/generate-invitation", methods=["POST"])
def api_generate_invitation():
    """Generate invitation drafts in multiple tones."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    event = get_event_by_id(event_id) if event_id else data
    res = generate_invitation(event or {})
    return jsonify({"success": True, "result": res})


@app.route("/api/suggest-activities", methods=["POST"])
def api_suggest_activities():
    """Suggest activities tailored to guest count and event type."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    event = get_event_by_id(event_id) if event_id else data
    res = suggest_activities(event or {})
    return jsonify({"success": True, "result": res})


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """Conversational 'Ask CelebrAI' assistant."""
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"success": False, "error": "Message cannot be empty."}), 400
    
    event_id = data.get("event_id")
    event = get_event_by_id(event_id) if event_id else {}
    history = data.get("history", [])
    res = ask_celebr_ai(event, message, history)
    return jsonify({"success": True, "reply": res.get("reply"), "is_ai": res.get("is_ai")})


# ==========================================
# TIMELINE & TASK ROUTES
# ==========================================

@app.route("/api/tasks", methods=["POST"])
def api_add_task():
    """Add a new timeline task."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    if not event_id or not data.get("title"):
        return jsonify({"success": False, "error": "Event ID and title are required"}), 400
    task_id = add_timeline_task(event_id, data)
    return jsonify({"success": True, "task_id": task_id})


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def api_update_task(task_id):
    """Update task details or toggle completion status."""
    data = request.get_json() or {}
    success = update_timeline_task(task_id, data)
    return jsonify({"success": success})


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def api_delete_task(task_id):
    """Delete a timeline task."""
    success = delete_timeline_task(task_id)
    return jsonify({"success": success})


# ==========================================
# VENDOR ROUTES
# ==========================================

@app.route("/api/vendors", methods=["POST"])
def api_add_vendor():
    """Add a new vendor record."""
    data = request.get_json() or {}
    event_id = data.get("event_id")
    if not event_id or not data.get("category"):
        return jsonify({"success": False, "error": "Event ID and category are required"}), 400
    vendor_id = add_vendor(event_id, data)
    return jsonify({"success": True, "vendor_id": vendor_id})


@app.route("/api/vendors/<int:vendor_id>", methods=["PUT"])
def api_update_vendor(vendor_id):
    """Update vendor details, status, or contact info."""
    data = request.get_json() or {}
    success = update_vendor(vendor_id, data)
    return jsonify({"success": success})


@app.route("/api/vendors/<int:vendor_id>", methods=["DELETE"])
def api_delete_vendor(vendor_id):
    """Delete a vendor record."""
    success = delete_vendor(vendor_id)
    return jsonify({"success": success})


# ==========================================
# PDF EXPORT ROUTE
# ==========================================

@app.route("/api/events/<int:event_id>/pdf")
def api_download_pdf(event_id):
    """Generate and download executive PDF event plan."""
    event = get_event_by_id(event_id)
    if not event:
        abort(404)
    budget_items = get_budget_items(event_id)
    tasks = get_timeline_tasks(event_id)
    vendors = get_vendors(event_id)

    pdf_buffer = generate_event_pdf(event, budget_items, tasks, vendors)
    filename = f"CelebrAI_Plan_{event['name'].replace(' ', '_')}_{event_id}.pdf"

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )


# ==========================================
# ERROR HANDLERS
# ==========================================

@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html", message="The requested page could not be found."), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template("404.html", message="An unexpected server error occurred. Please try again."), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "0").lower() in ("1", "true")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
