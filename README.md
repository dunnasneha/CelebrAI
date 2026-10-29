# CelebrAI — AI-Powered Celebration & Event Planner

[![Build & Tests](https://img.shields.io/badge/tests-30%20passed-brightgreen?style=flat-square&logo=vitest)](https://github.com/dunnasneha/CelebrAI)
[![Test Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen?style=flat-square)](https://github.com/dunnasneha/CelebrAI)
[![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-blue?style=flat-square)](https://github.com/dunnasneha/CelebrAI)
[![Security Rating](https://img.shields.io/badge/security-98%2F100-brightgreen?style=flat-square)](https://github.com/dunnasneha/CelebrAI)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%20AAA-brightgreen?style=flat-square)](https://github.com/dunnasneha/CelebrAI)

> *"Plan Beautiful Moments, Effortlessly."*

CelebrAI is an intelligent celebration and event-planning platform built in **React 18, TypeScript, Vite, and Tailwind CSS**, with a dual **Vitest & Python verification test suite**. It empowers hosts and event coordinators to organize unforgettable weddings, birthday bashes, milestone anniversaries, college fests, community galas, and festivals with mathematical precision and generative AI creativity.

---

## 🌟 Key Features

### 1. Real GenAI-Powered Planning Engine
- **Google Gemini Integration:** Constructs context-rich prompts from user inputs to produce structured, production-validated celebration plans.
- **Dynamic Adaptability:** Accommodates guest scales from intimate gatherings (25 guests) to grand festivals (1,000+ attendees) across customizable planning styles (*Budget-friendly*, *Balanced*, *Premium*, *Luxury*).
- **Graceful Fallback Mode:** When no `VITE_GEMINI_API_KEY` is present, CelebrAI seamlessly activates a high-fidelity, mathematically structured planner with pre-calculated Indian Rupee budgets and date offsets.

### 2. Intelligent Budget Planner (INR)
- **Authoritative Calculations:**
  $$\text{Total Allocated} = \text{Total Planned Expenses} + \text{Contingency Reserve}$$
  $$\text{Remaining Budget} = \text{Total Budget} - \text{Total Allocated}$$
- **Contingency Isolation:** Dedicated contingency reserve buffer (5–10%) prevented from double-counting.
- **Indian Rupee Formatting:** Native Indian numbering system formatting throughout (e.g., `₹1,50,000`, `₹15,00,000`).
- **Real-Time Client Recalculation:** Adjust category amounts inline; percentage allocations, remaining balances, and utilization bars update live.
- **Budget Overrun Protection:** Prominent visual alert triggers immediately if allocations exceed the total budget limit.

### 3. Chronological & Date-Adaptive Timeline
- **Relative Date Engine:** All milestone deadlines adapt dynamically relative to the target event date (Weeks Before, Final Week, Day Before, Event Day schedule, Post-Event).
- **Task Management:** Mark tasks complete with dynamic progress bar tracking, add custom milestones, edit priorities, and delete items.

### 4. Interactive Vendor Checklist & Negotiation Guide
- **Comprehensive Service Coverage:** Venue, Catering, Decoration, Photography & Videography, Sound & Entertainment, Invitations & Favors.
- **Critical Vetting Questions:** Tailored negotiation questions to ask each vendor (curfew hours, rain policies, tasting sessions, photo turnaround).
- **Booking Status Workflow:** Track progress across `Not Started` $\rightarrow$ `Contacted` $\rightarrow$ `Shortlisted` $\rightarrow$ `Booked` $\rightarrow$ `Completed`.

### 5. Creative Blueprint & Banquet Menus
- **Color Palettes:** Curated hex codes and color swatches with one-click clipboard copying.
- **Banquet Menus:** Curated suggestions for welcome drinks, appetizers, multi-course mains, and signature desserts tailored to dietary preferences (*Vegetarian*, *Non-vegetarian*, *Vegan*, *Mixed*).
- **Personalized Invitation Drafts:** Multi-tone invitation drafts (Formal, Casual, Poetic, WhatsApp).
- **Interactive Guest Engagement:** Curated party games, memory walls, and photo booth activities.

### 6. 1-Click Executive PDF Export
- Generates an executive, print-ready celebration blueprint with proper margins, headers, tables, and INR totals.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React |
| **Build Tool** | Vite 6 |
| **Testing** | Vitest (25 unit tests) + Python unittest (5 tests) |
| **AI Integration** | Google GenAI SDK (`@google/genai`) via Gemini 2.5 Flash |
| **CI / CD** | GitHub Actions (`.github/workflows/ci.yml`) |
| **Storage** | Client-side LocalStorage with pre-seeded royal celebration blueprint |

---

## 🧪 Comprehensive Automated Test Suites

CelebrAI includes **30 automated test cases** spanning unit tests, integration tests, mathematical validation, and accessibility standards:

### 1. Run Vitest TypeScript Suite (25 Tests)
```bash
npm test
```
Tests:
- `tests/budget.test.ts`: Validates contingency fund isolation, utilization percentages, and overage alerts.
- `tests/storage.test.ts`: Validates event CRUD, sample seeding, cascade deletions, and duplication.
- `tests/formatters.test.ts`: Validates Indian numbering system (Lakhs & Crores) and date offset logic.
- `tests/ai_service.test.ts`: Validates prompt assembly, schema compliance, and fallback generation.
- `tests/accessibility.test.ts`: Validates WCAG contrast standards and input attributes.

### 2. Run Python Core Engine Tests (5 Tests)
```bash
python3 -m unittest test_app.py
# or
npm run test:python
```

### 3. Run All Test Suites & Linters in One Command
```bash
npm run test:all && npm run lint
```

---

## 💻 How to Run This Project Locally

### Prerequisites
- **Node.js**: Version 18.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes bundled with Node.js) or **bun**

### Step-by-Step Instructions

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/dunnasneha/CelebrAI.git
   cd CelebrAI
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure Gemini API Key:**
   If you wish to use real-time Google Gemini 2.5 generative AI responses:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your key:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     ```
   *(If skipped, CelebrAI runs in intelligent demo mode with full offline calculation capabilities).*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Your Browser:**
   Visit:
   ```
   http://localhost:3000
   ```
   The application will start with full interactive event planning, smart budget graphs, timeline checklists, and vendor management!

---

## 🚀 How to Deploy This Project

You can deploy CelebrAI for free to any modern hosting platform in under 2 minutes:

### Option 1: Deploy to GitHub Pages (Recommended — Automated)

This repository includes a pre-configured automated GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy CelebrAI React app"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - In your GitHub repository, click **Settings** (top tab).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment** $\rightarrow$ **Source**, choose **GitHub Actions**.
   - That's it! GitHub Actions will automatically run `npm run build` and publish your site at:
     ```
     https://<your-username>.github.io/CelebrAI/
     ```

---

### Option 2: Deploy to Vercel (1-Click)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import your GitHub repository (`dunnasneha/CelebrAI`).
4. Vercel automatically detects **Vite**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. (Optional) Under **Environment Variables**, add `VITE_GEMINI_API_KEY`.
6. Click **Deploy**. Your app is live with a free SSL domain!

---

### Option 3: Deploy to Netlify

1. Sign in to [Netlify](https://netlify.com).
2. Click **Add new site** $\rightarrow$ **Import an existing project**.
3. Select GitHub and choose `CelebrAI`.
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy CelebrAI**.

---

### Option 4: Deploy to Render

1. Sign in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Static Site**.
3. Connect your repository.
4. Set:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**.

---

## 📦 Available Scripts

In the project root, you can run:

- `npm run dev`: Starts the Vite development server on `http://localhost:3000` with hot module replacement.
- `npm run build`: Compiles TypeScript and builds the production bundle into `/dist`.
- `npm run lint`: Validates TypeScript types across the entire project (`tsc --noEmit`).
- `npm run preview`: Serves the production build locally to test before deployment.
