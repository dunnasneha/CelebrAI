# CelebrAI — AI-Powered Celebration & Event Planner

> *"Plan Beautiful Moments, Effortlessly."*

CelebrAI is an intelligent, full-stack celebration and event-planning web application rewritten in **React, TypeScript, Vite, and Tailwind CSS**. It empowers hosts and event coordinators to organize unforgettable weddings, birthday bashes, milestone anniversaries, college fests, community galas, and festivals with mathematical precision and generative AI creativity.

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
| **Build Tool** | Vite |
| **AI Integration** | Google GenAI SDK (`@google/genai`) |
| **Storage** | Client-side LocalStorage with pre-seeded royal celebration blueprint |

---

## 🚀 Development Setup

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build for production
npm run build
```
