"""
Comprehensive Test Suite for CelebrAI Web Application
Tests routes, database operations, budget math, AI services, security headers, and PDF generation.
"""

import unittest
import json
from datetime import datetime, timedelta
from app import app
from services.database import (
    init_db, get_db, get_all_events, get_event_by_id,
    get_budget_items, get_timeline_tasks, get_vendors
)
from services.budget_service import calculate_budget_summary, format_inr
from services.ai_service import (
    generate_event_plan, improve_theme, optimize_budget,
    generate_invitation, suggest_activities, ask_celebr_ai
)
from services.pdf_service import generate_event_pdf


class CelebrAITestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        init_db()

    def test_01_health_check(self):
        """Test health endpoint and app status."""
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('app'), 'CelebrAI')
        self.assertIn('ai_active', data)

    def test_02_security_headers(self):
        """Verify that HTTP security headers are enforced."""
        response = self.client.get('/health')
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(response.headers.get("X-Frame-Options"), "SAMEORIGIN")
        self.assertEqual(response.headers.get("X-XSS-Protection"), "1; mode=block")
        self.assertEqual(response.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin")

    def test_03_page_routes(self):
        """Test that all primary HTML page routes render successfully (200 OK)."""
        routes = [
            '/',
            '/dashboard',
            '/create-event',
            '/event/1',
            '/event/1/budget',
            '/event/1/timeline',
            '/event/1/vendors'
        ]
        for route in routes:
            res = self.client.get(route)
            self.assertEqual(res.status_code, 200, f"Route {route} failed with status {res.status_code}")
            self.assertIn(b"CelebrAI", res.data)

    def test_04_budget_math_and_contingency(self):
        """Test authoritative budget calculations and contingency isolation."""
        total_budget = 200000
        items = [
            {"category": "Venue", "allocated_amount": 60000, "is_contingency": False},
            {"category": "Catering", "allocated_amount": 70000, "is_contingency": False},
            {"category": "Decorations", "allocated_amount": 30000, "is_contingency": False},
            {"category": "Contingency Reserve", "allocated_amount": 20000, "is_contingency": True}
        ]
        summary = calculate_budget_summary(total_budget, items)
        
        self.assertEqual(summary['total_planned'], 160000.0)
        self.assertEqual(summary['contingency'], 20000.0)
        self.assertEqual(summary['total_allocated'], 180000.0)
        self.assertEqual(summary['remaining_budget'], 20000.0)
        self.assertFalse(summary['is_over_budget'])
        self.assertEqual(summary['utilization_percentage'], 90.0)

        # Over-budget calculation
        items_over = [
            {"category": "Venue", "allocated_amount": 120000, "is_contingency": False},
            {"category": "Catering", "allocated_amount": 80000, "is_contingency": False},
            {"category": "Contingency Reserve", "allocated_amount": 20000, "is_contingency": True}
        ]
        summary_over = calculate_budget_summary(total_budget, items_over)
        self.assertEqual(summary_over['total_allocated'], 220000.0)
        self.assertEqual(summary_over['remaining_budget'], -20000.0)
        self.assertTrue(summary_over['is_over_budget'])
        self.assertEqual(summary_over['overage_amount'], 20000.0)

        # Currency formatting test
        self.assertEqual(format_inr(150000), "₹1,50,000")
        self.assertEqual(format_inr(5000000), "₹50,00,000")
        self.assertEqual(format_inr(-25000), "-₹25,000")

    def test_05_ai_plan_generator(self):
        """Test structured AI plan generator and date offset calculation."""
        target_date = (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d")
        event_payload = {
            "name": "Arjun's 30th Birthday",
            "event_type": "Birthday",
            "event_date": target_date,
            "location": "Bengaluru",
            "guests": 50,
            "total_budget": 120000,
            "theme": "Retro Neon Arcade",
            "venue_preference": "Indoor",
            "food_preference": "Mixed",
            "duration": "4 hours",
            "special_requirements": "Karaoke microphone and cocktail corner",
            "planning_style": "Balanced"
        }
        plan = generate_event_plan(event_payload)
        
        self.assertIn("overview", plan)
        self.assertIn("budget_breakdown", plan)
        self.assertIn("preparation_timeline", plan)
        self.assertIn("vendor_checklist", plan)
        self.assertIn("creative_recommendations", plan)
        self.assertIn("risk_management", plan)

        total_alloc = sum(item["allocated_amount"] for item in plan["budget_breakdown"])
        self.assertAlmostEqual(total_alloc, 120000, delta=1000)

        for task in plan["preparation_timeline"]:
            self.assertTrue(bool(task.get("due_date")), "Due date should not be empty")

    def test_06_api_generate_plan_flow(self):
        """Test API creation of a new event plan and verify persistence in SQLite."""
        event_date = (datetime.now() + timedelta(days=40)).strftime("%Y-%m-%d")
        payload = {
            "name": "TechFest Innovation Gala",
            "event_type": "College Event",
            "event_date": event_date,
            "location": "IIT Campus Auditorium",
            "guests": 250,
            "total_budget": 350000,
            "theme": "Cyberpunk Neon & Quantum Lights",
            "venue_preference": "Indoor",
            "food_preference": "Vegetarian",
            "duration": "6 hours",
            "special_requirements": "LED wall stage display",
            "planning_style": "Balanced"
        }

        res = self.client.post(
            '/api/generate-plan',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        new_id = data.get("event_id")
        self.assertIsNotNone(new_id)

        event = get_event_by_id(new_id)
        self.assertEqual(event["name"], "TechFest Innovation Gala")
        self.assertEqual(event["total_budget"], 350000.0)

        b_items = get_budget_items(new_id)
        self.assertGreater(len(b_items), 0)

        tasks = get_timeline_tasks(new_id)
        self.assertGreater(len(tasks), 0)

        vendors = get_vendors(new_id)
        self.assertGreater(len(vendors), 0)

    def test_07_pdf_generation(self):
        """Test ReportLab PDF generation creates a valid binary document."""
        event = get_event_by_id(1)
        b_items = get_budget_items(1)
        tasks = get_timeline_tasks(1)
        vendors = get_vendors(1)

        pdf_buffer = generate_event_pdf(event, b_items, tasks, vendors)
        pdf_bytes = pdf_buffer.getvalue()

        self.assertTrue(pdf_bytes.startswith(b"%PDF"))
        self.assertGreater(len(pdf_bytes), 1000)

        res = self.client.get('/api/events/1/pdf')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/pdf')
        self.assertTrue(res.data.startswith(b"%PDF"))

    def test_08_specialized_ai_tools(self):
        """Test Theme, Budget Optimization, Invitation, Activity, and Chat endpoints."""
        res_theme = self.client.post('/api/generate-theme', json={"event_id": 1})
        self.assertEqual(res_theme.status_code, 200)
        self.assertTrue(json.loads(res_theme.data)["success"])

        res_opt = self.client.post('/api/optimize-budget', json={"event_id": 1})
        self.assertEqual(res_opt.status_code, 200)
        self.assertTrue(json.loads(res_opt.data)["success"])

        res_inv = self.client.post('/api/generate-invitation', json={"event_id": 1})
        self.assertEqual(res_inv.status_code, 200)
        self.assertTrue(json.loads(res_inv.data)["success"])

        res_act = self.client.post('/api/suggest-activities', json={"event_id": 1})
        self.assertEqual(res_act.status_code, 200)
        self.assertTrue(json.loads(res_act.data)["success"])

        res_chat = self.client.post('/api/chat', json={
            "event_id": 1,
            "message": "What is the best contingency plan for evening rain in Udaipur?"
        })
        self.assertEqual(res_chat.status_code, 200)
        chat_data = json.loads(res_chat.data)
        self.assertTrue(chat_data["success"])
        self.assertIn("reply", chat_data)

    def test_09_event_update(self):
        """Test editing event details via PUT /api/events/<id>."""
        res = self.client.put('/api/events/1', json={
            "name": "Aarav & Diya's Grand Royal Sangeet (Updated)",
            "guests": 140,
            "total_budget": 550000
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(json.loads(res.data)["success"])

        updated = get_event_by_id(1)
        self.assertEqual(updated["name"], "Aarav & Diya's Grand Royal Sangeet (Updated)")
        self.assertEqual(updated["guests"], 140)
        self.assertEqual(updated["total_budget"], 550000.0)

    def test_10_timeline_task_lifecycle(self):
        """Test task creation, editing, toggle completion, and deletion."""
        # 1. Add task
        add_res = self.client.post('/api/tasks', json={
            "event_id": 1,
            "title": "Pick up floral garlands",
            "phase": "Day Before",
            "due_date": "2026-11-20",
            "priority": "High"
        })
        self.assertEqual(add_res.status_code, 200)
        task_id = json.loads(add_res.data)["task_id"]

        # 2. Edit task
        edit_res = self.client.put(f'/api/tasks/{task_id}', json={
            "title": "Pick up floral garlands & Urli props",
            "priority": "Urgent"
        })
        self.assertEqual(edit_res.status_code, 200)

        # 3. Toggle complete
        upd_res = self.client.put(f'/api/tasks/{task_id}', json={"is_completed": True})
        self.assertEqual(upd_res.status_code, 200)

        # 4. Delete task
        del_res = self.client.delete(f'/api/tasks/{task_id}')
        self.assertEqual(del_res.status_code, 200)

    def test_11_vendor_lifecycle(self):
        """Test vendor addition, status update, and deletion."""
        add_res = self.client.post('/api/vendors', json={
            "event_id": 1,
            "category": "Fireworks Specialist",
            "criteria": "Cold pyro license, safety extinguishers",
            "questions_to_ask": "Are cold spark fountains permitted indoors?",
            "estimated_cost": 25000,
            "status": "Not Started"
        })
        self.assertEqual(add_res.status_code, 200)
        vendor_id = json.loads(add_res.data)["vendor_id"]

        upd_res = self.client.put(f'/api/vendors/{vendor_id}', json={"status": "Booked", "contact_info": "+91 99999 88888"})
        self.assertEqual(upd_res.status_code, 200)

        del_res = self.client.delete(f'/api/vendors/{vendor_id}')
        self.assertEqual(del_res.status_code, 200)

    def test_12_validation_and_error_handling(self):
        """Test input validations for invalid or negative budgets, guest counts, and 404s."""
        # Missing required fields
        res1 = self.client.post('/api/generate-plan', json={"event_type": "Wedding"})
        self.assertEqual(res1.status_code, 400)
        self.assertIn("required", json.loads(res1.data)["error"])

        # Negative budget
        res2 = self.client.post('/api/generate-plan', json={
            "name": "Party", "event_type": "Birthday", "event_date": "2026-12-01",
            "location": "Delhi", "guests": 50, "total_budget": -5000
        })
        self.assertEqual(res2.status_code, 400)
        self.assertIn("positive", json.loads(res2.data)["error"])

        # Zero guests
        res3 = self.client.post('/api/generate-plan', json={
            "name": "Party", "event_type": "Birthday", "event_date": "2026-12-01",
            "location": "Delhi", "guests": 0, "total_budget": 50000
        })
        self.assertEqual(res3.status_code, 400)
        self.assertIn("at least 1", json.loads(res3.data)["error"])

        # Non-existent event 404
        res4 = self.client.get('/event/999999')
        self.assertEqual(res4.status_code, 404)


if __name__ == '__main__':
    unittest.main()
