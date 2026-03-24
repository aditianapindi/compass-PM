# PM Career Navigation Platform — Project Context

## What I'm Building
A Career Navigation Platform for Aspiring Product Managers, serving both India and North America.

## Product Name
**Compass** — "Like Google Maps, but for your PM career."

## Current Stage
Prototype live on Vercel with full AI pipeline: Supabase auth, PDF resume parsing, AI gate scoring, AI readiness scoring (6 dimensions), RAG-powered North AI assistant (vector search + keyword fallback), daily task system with score improvement, post-rejection agentic remediation, job matching, and trend signals. Deployed at `compass-pm.vercel.app`. GitHub repo: `aditianapindi/compass-PM`. Next step: validate with 5–10 real users, then pursue technical co-founder or pre-seed raise.

## Key Files
- `index.html` — Full interactive prototype (single HTML file). 13 screens, vanilla JS, Tailwind CDN, Supabase JS CDN, PDF.js CDN, Google Fonts (Syne + DM Sans). Supabase anon key inlined (safe to commit).
- `.env` — Environment variables for scripts (gitignored — never commit). Contains `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
- `package.json` — ESM module config (`"type": "module"`) + `dotenv` dependency.
- `data/pm-market-data.json` — Curated RAG dataset: 12 companies, 24 job listings, 8 market trends, 6 transition profiles with hiring bars, interview formats, salary ranges, rejection reasons, and switcher notes.
- `how_we_built_compass.md` — Plain-English guide to building the prototype (14 steps, 252 lines). Also available as `how_we_built_compass.docx`.
- `compass_prd.md` — Product requirements document.
- `compass_session_notes.md` — Session notes: screens, design decisions, AI features, open threads.
- `pm_market_research_report.md` — Market research report (780 lines, live-verified March 2026).
- `pm_discovery_report.md` — Discovery report (938 lines): personas, journey maps, JTBD, TAM.
- `pm_navigator_product_brief.md` — Product decisions, MVP definition, build plan.

### Serverless Functions (`api/` folder)
| File | Purpose |
|---|---|
| `parse-resume.js` | Resume parsing — PDF text → Gemini → structured JSON (name, role, experience, skills, pmHighlights) |
| `score-gate.js` | Gate task scoring — returns score (0–100), thinkingStyle, headline, strength, gap |
| `score-readiness.js` | Readiness scoring — 6 PM dimensions with evidence signals, background baselines, cross-validation rules, calibration examples. Weights: Product Sense 25%, Analytical 20%, Business 15%, Technical 15%, AI Fluency 10%, Behavioural 15% |
| `score-task.js` | Daily task scoring — 6 task-type-specific rubrics, returns score + dimensionImpact (delta +0 to +5) |
| `north-chat.js` | North AI chat — semantic vector search (pgvector) with keyword fallback for RAG. Returns contextual reply + ragSource |
| `rejection-agent.js` | Post-rejection agentic flow — 3 Gemini calls: IDENTIFY (company + round) → RETRIEVE (vector search + keyword fallback) → DIAGNOSE + GENERATE (2-week remediation plan) |
| `semantic-search.js` | Standalone vector search endpoint — embeds query via gemini-embedding-001, searches Supabase pgvector |
| `job-matches.js` | AI job matching — compares user scores against company hiring bars, returns 4 personalized matches |
| `job-listings.js` | Job listings with fit calculation — pure math (user score / required score per dimension) |
| `job-trends.js` | Personalized trend signals — connects user gaps to market movements |
| `list-models.js` | Diagnostic — lists available Gemini models |

### Scripts (`scripts/` folder)
| File | Purpose |
|---|---|
| `embed-market-data.js` | One-time script to embed all 50 market data items into Supabase pgvector (3072-dimension vectors via gemini-embedding-001) |
| `supabase-setup.sql` | SQL to enable pgvector, create embeddings table, create match_embeddings RPC function |

---

## Validated Problem Statement

> "Aspiring product managers globally lack a structured, personalized path from 'I want to be a PM' to 'I am ready to apply and here's why.' The market provides resources but not navigation. It provides frameworks but not feedback. It provides community but not calibrated signal. The result is 12–18 months of low-feedback preparation cycles, high rejection rates, and significant financial and emotional cost."

**India-specific:** Aspiring PMs bounce between YouTube, PM School cohorts, and WhatsApp prep groups without knowing where they stand relative to what Flipkart, Meesho, or CRED actually wants. When they fail interviews, they get no feedback.

**NA-specific:** Aspiring PMs have access to frameworks (Exponent, Cracking the PM) but lack personalized feedback on specific gaps and a trusted signal that they are ready to apply.

---

## Strategic Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Beachhead market | **India first** | Lower CAC, weaker competition, coaching culture fit, PM School acquired (market gap opened) |
| Business model | **Freemium subscription** (not cohort) | Aligns revenue with user success; captures 6–18 month journey |
| Core differentiator | **PM Readiness Score + Remediation Loop** | Does not exist anywhere; most-cited missing element |
| Product architecture | **One core, two market skins** | Same gap-diagnosis engine; localized content for India vs. NA |

---

## Beachhead Segment
Indian career switchers (engineers/analysts) with 2–5 years experience, targeting first PM role at Tier 1 Indian startup (Flipkart, Meesho, Razorpay, Swiggy, PhonePe, Zomato). Estimated active pool: 5,000–10,000 candidates at any given time.

---

## Key Market Facts (Verified)

### India
- Active PM aspirants: ~50,000–80,000/year
- Annual junior PM openings: ~2,000–3,500 → **~15–25x oversubscription**
- PM School acquired by NextLeap (Feb 2025) — market consolidation signal
- Product Space: 100,000+ members
- NextLeap (post-PM School) pricing: INR 39,999 (~$480) for 16-week program
- WTP ceiling: ~INR 40,000 (~$480); subscription sweet spot: INR 8,000–15,000/year
- Interview format: take-home assignments + multiple rounds (different from NA)

### North America
- Active PM aspirants: ~200,000–500,000
- Google APM: ~8,000 applications, ~45–50 hired, **0.56% acceptance rate**
- Meta RPM: active; ~97% don't receive an interview
- PM job postings: peaked 426,104 (Sept 2022) → dropped to under 24,000 (Sept 2024) → recovering to ~6,000+ open roles (2025)
- Exponent pricing: $12/month annual (~$144/yr) or $79/month
- Reforge pricing: $1,995/year (mid/senior PMs only)
- Lenny's Newsletter: 1 million subscribers; 30,000+ Slack members
- WTP: $200–$500/year for a structured platform

### AI Disruption
- 14,000+ AI PM openings on LinkedIn globally; 1,300 in India
- 75% of employers struggle to find qualified AI PM candidates
- AI PM skills now a first-class interview dimension at Google, Meta, Microsoft
- No platform has built AI-native PM interview prep yet — white space

---

## Competitor Gaps (No One Solves These)
1. **Personalized gap diagnosis** — no platform starts with "here's where YOU are weak"
2. **Calibrated peer feedback** — mock interviews exist but feedback quality is uncalibrated
3. **Objective readiness signal** — no go/no-go mechanism exists anywhere
4. **Post-rejection remediation loop** — no platform connects rejection → specific gap → fix

---

## MVP Core Feature: PM Readiness Score
A dynamic, multi-dimensional score that:
1. Maps user background + target companies at onboarding
2. Updates across dimensions (product sense, analytical, behavioral, AI fluency) as user practices daily tasks
3. Signals when user is ready to apply for specific role types
4. Triggers a targeted remediation plan after any rejection

---

## Risks to Validate
1. Will users trust a readiness score from an early-stage platform?
2. Can AI-assisted calibration provide a quality floor for peer feedback?
3. How to seed the community (cold start problem)?
4. India-first → India-only risk: build architecture for both markets from day 1
5. AI commoditization: durable value must be in guidance/community, not content delivery

---

## Compass Prototype — What's Built

### Screen Flow
```
Landing → Q1–Q5 (auto-advance) → Loading → Fit Verdict
→ [Login wall] → Sign In → Connect Profiles
→ Gate (first action task) → Readiness Score → [Paywall] → Navigation Path → Dashboard
Side: Profile (s-profile), Interview Room (s-interview), Jobs (s-jobs)
```

### All Screens
| Screen ID | What It Does |
|---|---|
| `s-landing` | Hero, pain points, 7-step how-it-works, footer CTA |
| `s-signin` | Sign in / create account (Google OAuth via Supabase, email/password) |
| `s-connect` | Connect LinkedIn, Teal, resume upload (PDF.js + Gemini), GitHub, writing samples |
| `s-q1`–`s-q5` | 5 onboarding questions — auto-advance on selection, no Next button |
| `s-loading` | Spinning compass, animated check items, auto-advances to verdict |
| `s-verdict` | PM Type card, locked score ring (unlocks after LinkedIn + gate task), background pattern hypothesis |
| `s-gate` | Dual-purpose screen: onboarding gate task OR daily practice tasks. 1500-char max, AI scoring, inline feedback card with dimension impact |
| `s-readiness` | Animated radar chart (6 dimensions) + score ring + confidence indicator (measured vs estimated) + stat cards. Scores driven by AI (score-readiness.js) |
| `s-paywall` | Monetisation screen — Monthly (₹999/mo) vs Annual (₹7,999/yr) pricing cards |
| `s-path` | 3-phase 6-week navigation plan with dynamic progress bars, task completion tracking, and overall score display |
| `s-dashboard` | Progress counter (tasks done), progress bar (X/17), task list with completion status, today's task card, job fit matches, hiring trend signals |
| `s-interview` | Interview Room — Riva AI avatar, round selector, live mock session |
| `s-jobs` | Job listings with fit percentages calculated from user scores vs required scores |
| `s-profile` | User profile — connected accounts, PM highlights, skills, dimension scores. Edit Profile modal for resume re-upload. |

### Key Design Decisions
- **Free flow:** Landing → Q1–Q5 → Fit Verdict (no login required)
- **Login wall:** Bottom of Fit Verdict. "Login to unlock my full path — it's free"
- **Paywall:** Between Readiness Score and the 6-week Path. Free = diagnosis. Paid = navigation.
- **Pricing:** Monthly ₹999/mo · Annual ₹7,999/yr (save 33%). Inside validated WTP ceiling.
- **Score locked on verdict:** Shows `?` ring until LinkedIn/resume + gate task completed. Then unlocks with confidence indicator.
- **Gate task (dual-purpose):** Onboarding mode = product teardown for gate scoring. Daily mode = varied task types targeting weakest dimensions.
- **Personalization:** `pmTypeMap` + `companyMap` + `personalize()` — all post-verdict text reflects Q1 background + Q4 target company. Name comes from Google profile or LinkedIn, not a form field.
- **Full navbar:** Visible on all screens from s-gate onward (Path, Jobs, Trends, Interview Room, Profile tabs + avatar).

### The 6 PM Dimensions
| Dimension | Weight | Evidence Sources |
|---|---|---|
| Product Sense | 25% | Gate task score, resume product mentions, background type |
| Analytical Depth | 20% | Resume data/metrics work, SQL/analytics experience, gate task metric references |
| Business Framing | 15% | Resume business mentions, MBA/consulting background, revenue/market experience |
| Technical Credibility | 15% | Engineering roles, CS degree, system design, API work |
| AI Fluency | 10% | AI/ML projects, LLM usage, AI certifications |
| Behavioural | 15% | Team leadership, cross-functional mentions, conflict resolution language |

Scoring uses background-type baselines (engineer starts 70–85 on Technical but 25–35 on Business), cross-validation rules (gate score < 40 caps Product Sense at 55), and 3 calibration examples.

---

## AI Features Built (All Live)

### 1. Resume Parsing (PDF.js + Gemini 2.5 Flash)
- User uploads PDF on s-connect
- PDF.js extracts text client-side (first 3 pages)
- Text sent to `/api/parse-resume` → Gemini 2.5 Flash
- Returns: `name`, `email`, `phone`, `currentRole`, `totalExperience`, `experience[]`, `awards[]`, `pmHighlights[]`, `skills[]`
- `pmHighlights` schema: `{ text, type: "strength|warning|action", label: "↑/⚠/→ label" }`
- Profile page updates automatically

### 2. Gate Task Scoring (Gemini 2.5 Flash)
- User writes product teardown on s-gate (up to 1500 chars)
- On submit → `/api/score-gate` with text + user background (Q1)
- Returns: `score` (0–100), `thinkingStyle`, `headline`, `strength`, `gap`
- Temperature: 0.2 for scoring consistency

### 3. Readiness Scoring (Gemini 2.5 Flash)
- Takes resume data + gate score + background + target company
- Scores 6 dimensions using evidence signals, background baselines, cross-validation rules, and calibration examples
- Returns dimension scores (0–100) with status (Gap/Developing/Solid/Strong) + overall weighted score
- Powers the animated radar chart on s-readiness
- Temperature: 0.3

### 4. Daily Task System (17 tasks × 6 types)
- **Task types:** Product Teardown, Metric Diagnosis, Business Case, AI Feature Design, Technical Tradeoff, Stakeholder Conflict
- Each has its own AI scoring rubric via `/api/score-task`
- Task selection targets user's 2–3 weakest dimensions, filters out completed tasks
- Score improvement: each task adds +0 to +5 points to the relevant dimension
- Progress tracked: tasks completed counter, progress bar (X/17), full task list with scores, streak grid
- Persistence: localStorage (immediate) + Supabase `task_progress` column (async)
- `currentTaskMode` variable switches s-gate between onboarding ('gate') and daily practice ('daily')

### 5. North AI Assistant (Gemini 2.5 Flash + RAG)
- Floating compass bubble (bottom-right), visible on all post-onboarding screens
- 5 quick-reply chips: "I'm feeling stuck", "How am I doing?", "Mock Interview", "What to do today?", "I got rejected"
- **RAG pipeline:** User message → embed via gemini-embedding-001 → search Supabase pgvector (top 5 results) → inject into Gemini prompt → grounded response
- **Fallback:** If vector search unavailable, keyword matching from pm-market-data.json
- Returns `ragSource` field ("vector" or "keyword") for verification
- Context includes: name, background, target company, readiness scores, gate score, resume highlights
- North personality: honest, not a cheerleader, 2–4 sentences, specific to user data
- Temperature: 0.7

### 6. Post-Rejection Remediation Agent (Agentic AI)
- Triggered by "I got rejected" chip or natural language in North chat
- **Step 1 — IDENTIFY:** Extracts company + round from message. If company unknown, asks user (returns `needsInfo: true`)
- **Step 2 — RETRIEVE:** Vector search for company data with keyword fallback from pm-market-data.json
- **Step 3 — DIAGNOSE + GENERATE:** Compares user scores vs company hiring bar, generates 2-week day-by-day remediation plan
- Returns structured JSON: headline, rootCause (primary + secondary with scores/bars/gaps), recoveryPlan (2 weeks × 5 days), reapplySignal
- Frontend renders structured diagnosis card in North chat with progress bars and recovery plan

### 7. Job Matching (AI + Math)
- **AI matches (dashboard):** Sends user scores + company data to Gemini → 4 personalized matches with fit percentages
- **Math-based listings (jobs screen):** 24 listings, fit = average of (user score / required score) per dimension, capped at 100%
- **Trend signals:** Market trends personalized to user's gaps and target company

### 8. Edit Profile Modal
- "Edit Profile" button on s-profile opens modal overlay
- Drag-and-drop + browse PDF upload zone
- Runs full parse-resume flow inline — shows progress states (reading → AI parsing → done)
- Closes automatically 1.2s after success and refreshes all profile data

---

## Technical Architecture

### Infrastructure
- **Hosting:** Vercel (auto-deploys on push to GitHub main branch)
- **Repo:** `github.com/aditianapindi/compass-PM`
- **Auth:** Supabase (Google OAuth + email/password)
- **AI:** Gemini 2.5 Flash via `generativelanguage.googleapis.com/v1beta`
- **Embeddings:** Gemini embedding-001 (3072 dimensions) for RAG vector search
- **Vector DB:** Supabase pgvector extension — `embeddings` table with `match_embeddings` RPC function
- **API keys:** `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` stored in Vercel environment variables (never in code). Local scripts use `.env` file.
- **PDF parsing:** PDF.js via unpkg CDN (client-side, first 3 pages)

### RAG Pipeline
1. **Dataset:** 50 items in `data/pm-market-data.json` (12 companies, 24 jobs, 8 trends, 6 transition profiles)
2. **Embedding:** One-time via `scripts/embed-market-data.js` → gemini-embedding-001 → 3072-dim vectors → Supabase pgvector
3. **Query:** User message → embed → cosine similarity search via `match_embeddings` RPC → top 5 results injected into Gemini prompt
4. **Fallback:** Keyword matching from JSON file if vector search is unavailable
5. **Used by:** North chat, rejection agent, semantic search endpoint

### Key Global State (`userData` object)
```javascript
userData = {
  name,             // from Google auth or resume parse
  firstName,        // derived from name
  q1,               // background (e.g. "Software / Data Engineer")
  q4,               // target company
  profileConnected,
  resumeData: {     // from parse-resume API
    name, email, phone, currentRole, totalExperience,
    experience[], awards[], pmHighlights[], skills[], fileName
  },
  gateScore: {      // from score-gate API
    score, thinkingStyle, headline, strength, gap
  },
  readinessScores: { // from score-readiness API or localStorage
    overall,          // weighted average (0–100)
    dimensions: [{ name, score, status, note }]  // 6 dimensions
  },
  taskProgress: {   // daily task system state
    currentDay,       // next task number (completedTasks.length + 1)
    streak,           // consecutive days with task completion
    lastTaskDate,     // ISO date string
    completedTasks: [{ id, type, dimension, score, delta, date }],
    currentTask       // currently selected task object
  }
}
```

### Persistence
- **Supabase `profiles` table:** q1–q5, resume_data, gate_score, readiness_scores, task_progress (all JSONB)
- **localStorage backup:** task_progress and readiness_scores saved to `compass_task_progress` and `compass_readiness_scores` keys
- **Resilient saves:** `saveProfile()` retries without `task_progress` if column doesn't exist, so other data still saves
- **Load priority:** Supabase → localStorage fallback for task_progress and readiness_scores
- `ensureReadinessScores()` guarantees scores exist (from Supabase → localStorage → hardcoded defaults) so task system always works

### Key Functions
- `processResumeFile(file)` — handles upload on s-connect, calls parse-resume API, updates userData and profile
- `processResumeFileFromModal(file)` — same logic but uses modal UI elements, closes modal on success
- `updateProfileFromResume(parsed)` — updates all profile elements from parsed resume data
- `submitGate()` — async, calls score-gate API, reveals inline feedback card
- `submitDailyTask()` — async, calls score-task API, records completion, applies dimension delta, selects next task
- `startDailyTask()` — sets daily mode, selects task, populates gate screen
- `selectDailyTask()` — picks next uncompleted task targeting weakest dimensions
- `applyDimensionDelta(dim, delta)` — updates dimension score + recalculates weighted overall
- `ensureReadinessScores()` — guarantees readinessScores exist from Supabase/localStorage/defaults
- `renderDashboardTask()` — renders today's task card on dashboard
- `renderStreak()` — renders progress counter, progress bar, streak, and week grid
- `renderTaskList()` — renders all 17 tasks with completion status, scores, and current task highlight
- `renderPathProgress()` — renders 3-phase task list with progress bars on path screen
- `northAsk(message)` — async, calls north-chat API with full user context, handles typing indicator
- `northRejectionAgent(message)` — async, calls rejection-agent API, handles needsInfo follow-up flow
- `renderRejectionCard(data)` — renders structured diagnosis card in North chat
- `getNorthContext()` — assembles userData into context string for North API
- `fetchReadinessScores()` — calls score-readiness API, stores result
- `fetchJobMatches()` / `fetchJobListings()` / `fetchTrendSignals()` — dashboard data fetchers
- `applyName()` — updates all avatar initials and profile name across all screens
- `showScreen(id)` — handles screen transitions and triggers screen-specific renderers
- `saveProfile()` / `loadProfile()` — Supabase persistence with localStorage backup
- `saveProgressLocal()` / `loadLocal()` / `saveLocal()` — localStorage helpers

### Supabase Integration
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Anon key inlined in index.html (safe to expose)
- Service key in Vercel env vars (for vector search RPC calls)
- Auth providers: Google OAuth, Email/Password
- **Tables:** `profiles` (user data + task progress), `embeddings` (pgvector RAG data)
- **RPC:** `match_embeddings(query_embedding, match_count, filter_type)` — cosine similarity search
- On sign-in: name pulled from `user.user_metadata.full_name`, `applyName()` called, `loadProfile()` restores state

### Design System
| Token | Value |
|---|---|
| Background | `#09090B` |
| Surface | `#18181B` |
| Elevated | `#27272A` |
| Accent | `#818CF8` (indigo) |
| Fonts | Syne (headings) + DM Sans (body) |

---

## Open Threads (Not Yet Built)
1. **Resume-to-verdict personalization** — s-verdict copy should reference actual resume data (currentRole, experience) not just Q1 answer
2. **Riva interview backend** — currently hardcoded responses. Real version needs Claude API or Gemini.
3. **Voice input for Riva** — Web Speech API (text-first for now)
4. **North → Riva handoff** — Mock Interview chip in North should open Interview Room
5. **Cohort/peer group feature**
6. **Stripe/Razorpay integration** for paywall
7. **Domain** — check and acquire compass domain

## Next Steps (Recommended Order)
1. Validate prototype with 5–10 real users (share `compass-pm.vercel.app`)
2. Resume-to-verdict personalization (s-verdict copy uses real resume data)
3. Payment integration (Stripe for NA, Razorpay for India)
4. Technical co-founder or pre-seed raise using prototype as proof of concept
