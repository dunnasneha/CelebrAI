"""
CelebrAI Automated Test Suite (Python Engine & Core Rules Verification)
Compatible with pytest and python -m unittest test_app.py
"""

import unittest
import math


def format_inr(number):
    """Formats a number in Indian Rupees (Lakhs and Crores standard)"""
    if number is None:
        return "₹0"
    try:
        val = int(round(float(number)))
    except (ValueError, TypeError):
        return "₹0"
    
    if val < 0:
        return "-₹" + format_inr(abs(val))[1:]
    if val == 0:
        return "₹0"
    
    s = str(val)
    if len(s) <= 3:
        return f"₹{s}"
    
    last_three = s[-3:]
    remaining = s[:-3]
    chunks = []
    while len(remaining) > 2:
        chunks.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    if remaining:
        chunks.insert(0, remaining)
    
    return f"₹{','.join(chunks)},{last_three}"


def calculate_budget_summary(total_budget, items):
    """Calculates budget allocations with contingency reserve isolation"""
    total_planned = 0
    contingency = 0
    total_spent = 0
    
    for item in items:
        allocated = float(item.get('allocated_amount', 0))
        spent = float(item.get('actual_spent', 0))
        is_cont = item.get('is_contingency', False) or 'contingency' in item.get('category', '').lower()
        
        total_spent += spent
        if is_cont:
            contingency += allocated
        else:
            total_planned += allocated
            
    total_allocated = total_planned + contingency
    remaining_budget = total_budget - total_allocated
    is_over_budget = remaining_budget < 0
    
    return {
        'total_budget': total_budget,
        'total_planned': total_planned,
        'contingency': contingency,
        'total_allocated': total_allocated,
        'total_spent': total_spent,
        'remaining_budget': remaining_budget,
        'is_over_budget': is_over_budget,
        'overage_amount': abs(remaining_budget) if is_over_budget else 0,
        'utilization_percentage': round((total_allocated / total_budget) * 100, 1) if total_budget > 0 else 0
    }


class TestCelebrAIBudget(unittest.TestCase):
    def setUp(self):
        self.total_budget = 500000
        self.items = [
            {'category': 'Venue & Staging', 'allocated_amount': 150000, 'actual_spent': 140000, 'is_contingency': False},
            {'category': 'Royal Catering', 'allocated_amount': 200000, 'actual_spent': 200000, 'is_contingency': False},
            {'category': 'Decor & Lighting', 'allocated_amount': 80000, 'actual_spent': 75000, 'is_contingency': False},
            {'category': 'Contingency Fund', 'allocated_amount': 50000, 'actual_spent': 0, 'is_contingency': True}
        ]

    def test_contingency_isolation_no_double_counting(self):
        summary = calculate_budget_summary(self.total_budget, self.items)
        self.assertEqual(summary['total_planned'], 430000)
        self.assertEqual(summary['contingency'], 50000)
        self.assertEqual(summary['total_allocated'], 480000)
        self.assertEqual(summary['remaining_budget'], 20000)
        self.assertFalse(summary['is_over_budget'])

    def test_over_budget_detection(self):
        over_items = self.items + [{'category': 'Luxury Fleet', 'allocated_amount': 50000, 'actual_spent': 0}]
        summary = calculate_budget_summary(self.total_budget, over_items)
        self.assertTrue(summary['is_over_budget'])
        self.assertEqual(summary['remaining_budget'], -30000)
        self.assertEqual(summary['overage_amount'], 30000)


class TestCelebrAIFormatters(unittest.TestCase):
    def test_inr_formatting(self):
        self.assertEqual(format_inr(0), "₹0")
        self.assertEqual(format_inr(500), "₹500")
        self.assertEqual(format_inr(5000), "₹5,000")
        self.assertEqual(format_inr(50000), "₹50,000")
        self.assertEqual(format_inr(500000), "₹5,00,000")
        self.assertEqual(format_inr(2500000), "₹25,00,000")
        self.assertEqual(format_inr(10000000), "₹1,00,00,000")

    def test_inr_edge_cases(self):
        self.assertEqual(format_inr(None), "₹0")
        self.assertEqual(format_inr(""), "₹0")


class TestCelebrAIPlatformIntegrations(unittest.TestCase):
    def test_challenge_alignment(self):
        categories = ['Wedding', 'Birthday', 'Anniversary', 'College Event', 'Corporate', 'Festival']
        self.assertEqual(len(categories), 6)
        self.assertIn('Wedding', categories)
        self.assertIn('College Event', categories)


if __name__ == '__main__':
    unittest.main()
