"""
Professional PDF Export Service for CelebrAI using ReportLab.
Generates an executive, print-ready, multi-page celebration blueprint.
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from services.budget_service import format_inr


class NumberedCanvas:
    """Canvas wrapper to dynamically calculate and draw total page numbers."""
    def __init__(self, *args, **kwargs):
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#6B7280"))
        
        # Footer line
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(54, 38, 558, 38)

        # Footer text
        footer_text = "CelebrAI — Plan Beautiful Moments, Effortlessly."
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawString(54, 24, footer_text)
        self.drawRightString(558, 24, page_text)
        self.restoreState()


def generate_event_pdf(event, budget_items, timeline_tasks, vendors):
    """
    Generate a complete, structured PDF document of the event plan.
    Returns bytes in a BytesIO buffer.
    """
    buffer = io.BytesIO()
    
    # 0.75 inch margins (54 points)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#2E1065")
    gold_color = colors.HexColor("#B45309")
    text_dark = colors.HexColor("#1F2937")
    gray_light = colors.HexColor("#F9FAFB")
    border_color = colors.HexColor("#E5E7EB")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=gold_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("CelebrAI Event Blueprint", title_style))
    story.append(Paragraph("Plan Beautiful Moments, Effortlessly. • Official Executive Plan", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=gold_color, spaceAfter=14))

    # 2. Key Event Details Grid
    event_name = event.get('name', 'Celebration')
    event_type = event.get('event_type', 'Event')
    event_date = event.get('event_date', 'TBD')
    location = event.get('location', 'TBD')
    guests = event.get('guests', 0)
    total_budget = event.get('total_budget', 0)
    theme = event.get('theme', 'Not specified')
    venue_pref = event.get('venue_preference', 'Flexible')
    food_pref = event.get('food_preference', 'Mixed')
    style_pref = event.get('planning_style', 'Balanced')

    details_data = [
        [
            Paragraph(f"<b>Event Name:</b> {event_name}", body_style),
            Paragraph(f"<b>Event Type:</b> {event_type}", body_style)
        ],
        [
            Paragraph(f"<b>Date:</b> {event_date}", body_style),
            Paragraph(f"<b>Location:</b> {location}", body_style)
        ],
        [
            Paragraph(f"<b>Estimated Guests:</b> {guests}", body_style),
            Paragraph(f"<b>Total Budget:</b> {format_inr(total_budget)}", body_style)
        ],
        [
            Paragraph(f"<b>Preferred Theme:</b> {theme}", body_style),
            Paragraph(f"<b>Venue Preference:</b> {venue_pref}", body_style)
        ],
        [
            Paragraph(f"<b>Food Preference:</b> {food_pref}", body_style),
            Paragraph(f"<b>Planning Style:</b> {style_pref}", body_style)
        ]
    ]

    t_details = Table(details_data, colWidths=[250, 254])
    t_details.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF7F2")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E5E7EB")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F3F4F6")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(t_details)
    story.append(Spacer(1, 14))

    # 3. Event Concept & Overview
    overview = event.get('overview', {})
    if overview:
        story.append(Paragraph("1. Event Overview & Creative Concept", h1_style))
        if overview.get('concept'):
            story.append(Paragraph(f"<b>Concept:</b> {overview['concept']}", body_style))
        if overview.get('atmosphere'):
            story.append(Paragraph(f"<b>Atmosphere:</b> {overview['atmosphere']}", body_style))
        if overview.get('personalized_description'):
            story.append(Paragraph(f"{overview['personalized_description']}", body_style))
        
        considerations = overview.get('key_considerations', [])
        if considerations:
            story.append(Paragraph("<b>Key Planning Considerations:</b>", body_style))
            for c in considerations:
                story.append(Paragraph(f"• {c}", body_style))
        story.append(Spacer(1, 10))

    # 4. Budget Breakdown Table
    story.append(Paragraph("2. Financial Blueprint & Budget Allocation", h1_style))
    story.append(Paragraph("<i>All values are realistic estimates in Indian Rupees (INR) based on market averages.</i>", body_style))
    story.append(Spacer(1, 4))

    budget_table_data = [
        [
            Paragraph("Category", table_header_style),
            Paragraph("Allocated Amount", table_header_style),
            Paragraph("Actual Spent", table_header_style),
            Paragraph("Notes / Scope", table_header_style)
        ]
    ]

    tot_planned = 0
    contingency_amt = 0
    for item in budget_items:
        amt = float(item.get('allocated_amount', 0))
        spent = float(item.get('actual_spent', 0))
        is_cont = bool(item.get('is_contingency', False)) or ('contingency' in item.get('category', '').lower())
        if is_cont:
            contingency_amt += amt
        else:
            tot_planned += amt

        cat_title = f"{item.get('category', 'Item')} (Contingency)" if is_cont else item.get('category', 'Item')
        budget_table_data.append([
            Paragraph(cat_title, table_cell_bold if is_cont else table_cell_style),
            Paragraph(format_inr(amt), table_cell_style),
            Paragraph(format_inr(spent), table_cell_style),
            Paragraph(item.get('notes', '—'), table_cell_style)
        ])

    # Totals row
    tot_allocated = tot_planned + contingency_amt
    remaining = total_budget - tot_allocated
    budget_table_data.append([
        Paragraph("<b>Total Allocated (Planned + Contingency)</b>", table_cell_bold),
        Paragraph(f"<b>{format_inr(tot_allocated)}</b>", table_cell_bold),
        Paragraph("—", table_cell_style),
        Paragraph(f"<b>Remaining Budget: {format_inr(remaining)}</b>", table_cell_bold)
    ])

    t_budget = Table(budget_table_data, colWidths=[140, 100, 80, 184])
    t_budget.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, gray_light]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#FEF3C7")),
    ]))
    story.append(t_budget)
    story.append(Spacer(1, 14))

    # 5. Timeline Tasks
    story.append(Paragraph("3. Preparation Timeline & Milestone Schedule", h1_style))
    if timeline_tasks:
        timeline_table_data = [
            [
                Paragraph("Phase", table_header_style),
                Paragraph("Milestone Task", table_header_style),
                Paragraph("Target Date", table_header_style),
                Paragraph("Priority", table_header_style),
                Paragraph("Status", table_header_style)
            ]
        ]
        for t in timeline_tasks:
            status_text = "✓ Completed" if t.get('is_completed') else "Pending"
            timeline_table_data.append([
                Paragraph(t.get('phase', 'General'), table_cell_style),
                Paragraph(f"<b>{t.get('title', 'Task')}</b><br/>{t.get('description', '')}", table_cell_style),
                Paragraph(t.get('due_date', '—'), table_cell_style),
                Paragraph(t.get('priority', 'Medium'), table_cell_style),
                Paragraph(status_text, table_cell_bold if t.get('is_completed') else table_cell_style)
            ])

        t_timeline = Table(timeline_table_data, colWidths=[90, 214, 75, 55, 70])
        t_timeline.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, gray_light])
        ]))
        story.append(t_timeline)
    else:
        story.append(Paragraph("No timeline tasks currently recorded.", body_style))
    story.append(Spacer(1, 14))

    # 6. Vendor Checklist
    story.append(Paragraph("4. Vendor Management & Selection Criteria", h1_style))
    if vendors:
        vendor_table_data = [
            [
                Paragraph("Category", table_header_style),
                Paragraph("Selection Criteria & Questions", table_header_style),
                Paragraph("Estimated Cost", table_header_style),
                Paragraph("Booking Status", table_header_style),
                Paragraph("Contact / Notes", table_header_style)
            ]
        ]
        for v in vendors:
            crit = v.get('criteria', '')
            q = v.get('questions_to_ask', '')
            crit_text = f"<b>Criteria:</b> {crit}<br/><b>Questions:</b> {q}" if q else f"<b>Criteria:</b> {crit}"
            notes_text = v.get('notes', '') or v.get('contact_info', '—')
            vendor_table_data.append([
                Paragraph(v.get('category', 'Vendor'), table_cell_bold),
                Paragraph(crit_text, table_cell_style),
                Paragraph(format_inr(v.get('estimated_cost', 0)), table_cell_style),
                Paragraph(v.get('status', 'Not Started'), table_cell_style),
                Paragraph(notes_text, table_cell_style)
            ])

        t_vendor = Table(vendor_table_data, colWidths=[80, 204, 75, 65, 80])
        t_vendor.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, gray_light])
        ]))
        story.append(t_vendor)
    else:
        story.append(Paragraph("No vendor items currently recorded.", body_style))
    story.append(Spacer(1, 14))

    # 7. Creative Recommendations & Menu
    creative = event.get('creative', {})
    if creative:
        story.append(Paragraph("5. Creative Blueprint & Styling", h1_style))
        decor = creative.get('decorations', [])
        if decor:
            story.append(Paragraph("<b>Thematic Decor Elements:</b>", h2_style))
            for d in decor:
                story.append(Paragraph(f"• {d}", body_style))

        menu = creative.get('menu_suggestions', {})
        if menu:
            story.append(Paragraph("<b>Curated Feast & Menu Highlights:</b>", h2_style))
            if menu.get('welcome_drinks'):
                story.append(Paragraph(f"<b>Welcome Drinks:</b> {', '.join(menu['welcome_drinks'])}", body_style))
            if menu.get('appetizers'):
                story.append(Paragraph(f"<b>Appetizers:</b> {', '.join(menu['appetizers'])}", body_style))
            if menu.get('mains'):
                story.append(Paragraph(f"<b>Main Course:</b> {', '.join(menu['mains'])}", body_style))
            if menu.get('desserts'):
                story.append(Paragraph(f"<b>Desserts:</b> {', '.join(menu['desserts'])}", body_style))

        invitation = creative.get('invitation_draft')
        if invitation:
            story.append(Paragraph("<b>Personalized Invitation Draft:</b>", h2_style))
            story.append(Paragraph(f"<i>\"{invitation}\"</i>", body_style))
        story.append(Spacer(1, 10))

    # 8. Risk Management & Contingencies
    risks = event.get('risk', {})
    if risks:
        story.append(Paragraph("6. Risk Management & Contingency Safeguards", h1_style))
        if risks.get('weather_contingency'):
            story.append(Paragraph(f"<b>Weather Contingency:</b> {risks['weather_contingency']}", body_style))
        if risks.get('backup_venue'):
            story.append(Paragraph(f"<b>Backup Venue Considerations:</b> {risks['backup_venue']}", body_style))
        if risks.get('emergency_supplies'):
            story.append(Paragraph(f"<b>Emergency Supplies:</b> {risks['emergency_supplies']}", body_style))
        if risks.get('budget_overruns'):
            story.append(Paragraph(f"<b>Budget Overrun Prevention:</b> {risks['budget_overruns']}", body_style))
        if risks.get('schedule_delays'):
            story.append(Paragraph(f"<b>Schedule Delays:</b> {risks['schedule_delays']}", body_style))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
