# CelebrAI — AI-Powered Celebration & Event Planner

> *"Plan Beautiful Moments, Effortlessly."*

CelebrAI is an intelligent, full-stack celebration and event-planning web application built for **PromptWars Challenge 5: Celebration & Event Planner**. It empowers hosts and event coordinators to organize unforgettable weddings, birthday bashes, milestone anniversaries, college fests, community galas, and festivals with mathematical precision and generative AI creativity.

---

## 🌟 Key Features

### 1. Real GenAI-Powered Planning Engine
- **Google Gemini 1.5 Flash Integration:** Constructs context-rich prompts from user inputs to produce structured, production-validated JSON celebration plans.
- **Dynamic Adaptability:** Accommodates guest scales from intimate gatherings (25 guests) to grand festivals (1,000+ attendees) across customizable planning styles (*Budget-friendly*, *Balanced*, *Premium*).
- **Graceful Demo Mode:** When no `GEMINI_API_KEY` is present, CelebrAI seamlessly activates a high-fidelity, mathematically structured demo mode. Demo outputs are clearly labeled so you can test every workflow out-of-the-box.

### 2. Intelligent Budget Planner (INR)
- **Authoritative Calculations:**
  $$\text{Total Allocated} = \text{Total Planned Expenses} + \text{Contingency Reserve}$$
  $$\text{Remaining Budget} = \text{Total Budget} - \text{Total Allocated}$$
- **Contingency Isolation:** Dedicated contingency reserve buffer (5–10%) prevented from double-counting.
- **Indian Rupee Formatting:** Native Indian numbering system formatting throughout (e.g., `₹1,50,000`, `₹15,00,000`).
- **Interactive Chart.js Visualization:** Dynamic doughnut chart showing expense distribution by category.
- **Real-Time Client Recalculation:** Adjust category amounts inline; percentage allocations, remaining balances, and charts update on every keystroke.
- **Budget Overrun Protection:** Prominent visual alert triggers immediately if allocations exceed the total budget limit.

### 3. Chronological & Date-Adaptive Timeline
- **Relative Date Engine:** All milestone deadlines adapt dynamically relative to the target event date (e.g., $-30$ days, $-7$ days, Day Before, Event Day schedule, Post-Event).
- **Phase-Based Organization:**
  - *Weeks Before* (Venue, catering, decor contracts)
  - *Final Week* (Final guest counts, music playlists)
  - *Day Before* (Vendor confirmation calls, sound checks)
  - *Event Day Schedule* (Morning setup, welcome drinks, ceremonies, banquet)
  - *Post-Event* (Vendor settlements, digital photo gallery distribution)
- **Task Management:** Mark tasks complete with dynamic progress bar tracking, add custom milestones, edit priorities, and delete items.

### 4. Interactive Vendor Checklist & Negotiation Guide
- **Comprehensive Service Coverage:** Venue, Catering, Decoration, Photography & Videography, Sound & Entertainment, Invitations & Favors, Transportation, and Equipment.
- **Critical Vetting Questions:** Tailored negotiation questions to ask each vendor (curfew hours, rain policies, tasting sessions, uncompressed photo rights).
- **Booking Status Workflow:** Track progress across `Not Started` $\rightarrow$ `Contacted` $\rightarrow$ `Booked`.
- **Custom Vendor Management:** Add custom vendor categories with specific deadlines and estimated INR costs.

### 5. Creative Blueprint & Banquet Menus
- **Color Palettes:** Curated hex codes and color swatches with one-click clipboard copying.
- **Banquet Menus:** Curated suggestions for welcome drinks, appetizers, multi-course mains, and signature desserts tailored to dietary preferences (*Vegetarian*, *Non-vegetarian*, *Vegan*, *Mixed*).
- **Personalized Invitation Drafts:** Ready-to-copy invitation messages.
- **Interactive Guest Engagement:** Curated party games, memory walls, and photo booth activities.

### 6. Proactive Risk Management & Safeguards
- **Weather Contingency:** Weatherproof canopies and covered banquet backups for outdoor events.
- **Delay Buffers:** Built-in 20-30 minute grace periods for ceremonies and feast kick-offs.
- **Host Emergency Kit:** Curated checklist of essentials (safety pins, stain pens, emergency medicines, backup power banks).
- **Overrun Buffers:** Retains dedicated contingency funds to absorb last-minute plate additions.

### 7. Interactive GenAI Tools
- **Improve My Theme:** Generates 3 alternative creative theme concepts with distinct color palettes and music styles.
- **Optimize My Budget:** AI financial strategist analyzes category allocations and proposes 4 concrete cost-saving opportunities.
- **Generate Invitations:** Drafts invitation copy in 4 distinct tones (*WhatsApp/Digital Motion*, *Warm & Casual*, *Traditional & Formal*, *Poetic*).
- **Suggest Activities:** Curates 5 interactive party games with recommended timings, rules, and supplies.
- **Ask CelebrAI Concierge:** Conversational AI assistant answering contextual questions about the active event plan.

### 8. Executive PDF Export
- **ReportLab Engine:** Generates an executive, print-ready, multi-page celebration blueprint.
- **Structured Sections:** Includes event details, concept narrative, formatted budget tables with INR totals, chronological timeline, vendor checklist, menu highlights, and risk safeguards.
- **Clean Formatting:** Proper margins, headers, and running page numbers (`Page X of Y`).

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 Custom Design System, Vanilla JavaScript (ES6+), Chart.js |
| **Backend** | Python 3.9+, Flask 3.0+ REST API |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash` via `google-generativeai`) |
| **Document Export**| Python ReportLab (Multi-page PDF generation) |
| **Database** | SQLite3 (Foreign keys enabled, cascade deletion, JSON fields) |
| **Styling & Assets**| Custom palette (Warm Cream, Deep Purple, Soft Rose, Champagne Gold), SVG icons |
| **Production Server**| Gunicorn WSGI |

*Zero dependency on React, Angular, Vue, or heavy node_modules — ensuring the complete repository stays under **500 KB** (well below the 10 MB limit)!*

---

## 📁 Project Structure

```
challenge5/
├── app.py                     # Main Flask application & REST API routes
├── test_app.py                # Comprehensive automated unit & integration test suite
├── requirements.txt           # Python dependency specifications
├── Procfile                   # Gunicorn production entrypoint
├── .env.example               # Environment variable template with placeholders
├── .gitignore                 # Excludes cache, virtualenv, secrets, and database
├── README.md                  # Project documentation & PromptWars submission guide
│
├── services/
│   ├── ai_service.py          # Google Gemini GenAI integration & prompt engineering
│   ├── budget_service.py      # Authoritative budget calculations & INR formatting
│   ├── database.py            # SQLite database layer, schema, and sample seeds
│   └── pdf_service.py         # ReportLab multi-page executive PDF generator
│
├── templates/
│   ├── base.html              # Core layout, navbar, footer, modals, toast system
│   ├── index.html             # High-converting landing page with hero & previews
│   ├── dashboard.html         # Saved celebrations workspace with metrics & filters
│   ├── create_event.html      # Event creation form with real-time validation & wizard
│   ├── event_details.html     # Event blueprint, menus, creative palette, and AI tools
│   ├── budget.html            # Smart budget planner with Chart.js doughnut chart
│   ├── timeline.html          # Dynamic milestone timeline & completion checklist
│   ├── vendors.html           # Vendor management, status toggles, & vetting questions
│   └── 404.html               # Custom error page
│
└── static/
    ├── css/
    │   └── style.css          # Design system stylesheet (Cream, Purple, Rose, Gold)
    └── js/
        ├── main.js            # Toast notifications, modals, INR formatter
        ├── event.js           # Form validation & AI loading progress animations
        ├── budget.js          # Chart.js initialization & live calculation updates
        ├── timeline.js        # Milestone completion, filtering, & task additions
        ├── vendors.js         # Vendor status updates & custom vendor handling
        └── ai_tools.js        # Interactive modals for Theme, Invites, Activities & Chat
```

---

## 🚀 Local Installation & Setup Instructions

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- (Optional) Git

### 1. Clone or Navigate to the Repository
```bash
cd challenge5
```

### 2. (Optional) Create a Virtual Environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux
```
Open `.env` in any text editor:
```ini
# Flask Secret Key
SECRET_KEY=celebr-ai-secret-key-production-ready

# Port
PORT=5000

# Google Gemini API Key (Obtain free at: https://aistudio.google.com/app/apikey)
# Leave blank to use High-Fidelity Demo Mode
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### 5. Start the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧪 Automated Testing

CelebrAI includes an automated test suite verifying all routes, database persistence, currency formatting, mathematical formulas, AI fallback models, and PDF binary streams.

Run the test suite:
```bash
python -m unittest test_app.py
```

### Test Coverage Highlights:
- ✅ **Health Check:** `/health` returns status healthy and reports AI configuration status.
- ✅ **Page Routes:** All pages (`/`, `/dashboard`, `/create-event`, `/event/1`, `/event/1/budget`, `/event/1/timeline`, `/event/1/vendors`) return `200 OK`.
- ✅ **Budget Math & Contingency:** Verifies that contingency is not double-counted, authoritative remaining budget formula holds, and Indian Rupee numbers format into Lakhs and Crores.
- ✅ **AI Plan Generation:** Verifies valid schema generation, date offset adaptation, and category breakdown summation.
- ✅ **API Plan Flow:** Submits an event through `/api/generate-plan`, verifies SQLite persistence, and verifies cascading relations.
- ✅ **ReportLab PDF Export:** Verifies that `/api/events/<id>/pdf` streams valid `%PDF` bytes with proper headers and tables.
- ✅ **Specialized AI Endpoints:** Tests `/api/generate-theme`, `/api/optimize-budget`, `/api/generate-invitation`, `/api/suggest-activities`, and `/api/chat`.
- ✅ **Task & Vendor Lifecycles:** Tests addition, status updates, completion toggling, and deletion.

---

## ☁️ Deployment Guide

### Deploying to Render
1. Push your repository to GitHub.
2. In the Render Dashboard, select **New $\rightarrow$ Web Service**.
3. Connect your repository.
4. Set the following build settings:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Under **Environment Variables**, add:
   - `SECRET_KEY` = *random secure string*
   - `GEMINI_API_KEY` = *your Google Gemini API key*
   - `PYTHON_VERSION` = `3.9.13` (or any modern 3.9+ version)
6. Click **Deploy Web Service**.

> **Note on SQLite Persistence in Production:**  
> Free hosting tiers on Render/Heroku feature ephemeral filesystems. On Render, attach a **Persistent Disk** (e.g. mounted at `/data` with `database.db` inside) if you wish to retain database records across restarts, or switch to PostgreSQL by providing a `DATABASE_URL` via SQLAlchemy.

---

## 🎬 PromptWars Demo Video Walkthrough Script

Use this 8-step script to record an end-to-end demonstration video for the PromptWars Challenge 5 submission:

1. **Homepage Introduction (0:00 - 0:45):**
   - Open `http://localhost:5000` (or deployed URL).
   - Highlight the branding, tagline *"Plan Beautiful Moments, Effortlessly"*, and the AI status badge in the navbar.
   - Scroll through the category cards (Weddings, Birthdays, Anniversaries, College Fests) and the sample preview card.

2. **Event Creation Form (0:45 - 1:30):**
   - Click **"Create My Event Plan"**.
   - Enter event details:
     - Name: *"Ananya's 25th Sunset Birthday"*
     - Event Type: *Birthday*
     - Date: Select a date 30 days in the future
     - Location: *Goa, India*
     - Guests: *60*
     - Budget: *₹2,00,000*
     - Theme: *Bohemian Sunset & Fairy Lights*
     - Food Preference: *Mixed*
   - Click quick chip shortcuts to show instant values and formatting.
   - Click **"Generate AI Event Plan"** to showcase the animated step-by-step loading state.

3. **Event Overview & Creative Blueprint (1:30 - 2:30):**
   - Showcase the generated celebration workspace.
   - Review the AI-generated concept, atmosphere description, and key considerations.
   - Demonstrate the color palette swatches and click a color to copy its hex code (`#2E1065`).
   - Review the curated banquet menu (welcome drinks, appetizers, mains, desserts).
   - Highlight the risk management safeguards (weather backup, buffer times).

4. **Interactive AI Tools Bar (2:30 - 3:30):**
   - Click **"Improve Theme"**: View 3 distinct creative theme variations.
   - Click **"Generate Invites"**: View 4 invitation tones (WhatsApp, Casual, Formal, Poetic) and click **"Copy Text"**.
   - Click **"Suggest Activities"**: Review 5 curated interactive party games.
   - Click **"Ask CelebrAI"**: Type *"What is a good rain backup for an outdoor lawn in Goa?"* and demonstrate the real-time AI reply.

5. **Smart Budget Planner & Chart (3:30 - 4:30):**
   - Navigate to the **"Smart Budget Planner"** tab.
   - Showcase the Chart.js doughnut chart and the summary metric cards.
   - Point out how the **Contingency Reserve** is isolated and not double-counted.
   - Edit an allocated amount (e.g. increase Venue from ₹60,000 to ₹1,80,000) to trigger the live **Budget Limit Exceeded!** warning.
   - Click **"Optimize Budget with AI"** to see strategic savings suggestions.
   - Click **"Save Budget Changes"** and show the confirmation toast.

6. **Adaptive Preparation Timeline (4:30 - 5:15):**
   - Switch to the **"Preparation Timeline"** tab.
   - Show how tasks are chronologically organized into *Weeks Before*, *Final Week*, *Day Before*, *Event Day*, and *Post-Event*.
   - Check off a milestone task (e.g., *"Venue Booking"*) and demonstrate the live update of the progress bar.
   - Filter by phase tabs (*"Final Week"*, *"Event Day"*).
   - Add a custom milestone using the **"+ Add Milestone"** modal.

7. **Vendor Checklist & Negotiation (5:15 - 5:45):**
   - Switch to the **"Vendor Checklist"** tab.
   - Review vetting questions for Catering, Photography, and Venue.
   - Change a vendor's status from `Not Started` to `Booked`.
   - Add custom notes and contact numbers.

8. **Executive PDF Download & Dashboard (5:45 - 6:30):**
   - Click **"Download Event Plan (PDF)"**.
   - Open the downloaded PDF in the browser: showcase the multi-page layout, custom styling, tables, and INR figures.
   - Click **"Dashboard"**: View the updated metrics, duplicate the event plan with one click, and show the search/filter feature.

---

## 📋 PromptWars Submission Checklist

- [x] **Lightweight Repository:** Clean source code strictly under 10 MB (actual: ~430 KB).
- [x] **No Framework Bloat:** Uses pure HTML5, modern CSS3, vanilla JavaScript, and Python Flask.
- [x] **Real Generative AI Integration:** Connected to Google Gemini 1.5 with structured JSON schema.
- [x] **Informative Fallback Mode:** Automatic high-fidelity demo mode with clear user notices when API key is unconfigured.
- [x] **Smart Budget Dashboard:** Live Chart.js doughnut chart, INR formatting, isolated contingency, and overrun warnings.
- [x] **Adaptive Timeline:** Dynamic date offsets relative to actual event date with completion tracking.
- [x] **Interactive Vendor Checklist:** Category criteria, critical interview questions, and status workflows.
- [x] **Publication-Grade PDF Export:** ReportLab multi-page document with real event details.
- [x] **Tested & Verified:** Comprehensive automated test suite (`test_app.py`) passing with 100% success.
- [x] **Production Ready:** Includes `Procfile`, `.env.example`, `.gitignore`, and health check route (`/health`).

---

## 📄 License
Created for PromptWars Challenge 5: Celebration & Event Planner. All rights reserved.
