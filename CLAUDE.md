# PM Career Navigation Platform — Project Context

## Rules for Claude
- **Never remove a working code path to "clean up" while fixing a bug.** Fix around it. Add guards/fallbacks — don't replace the approach.
- **Prefer the minimal change.** When asked to optimize, consider config-level fixes before swapping dependencies. Smaller blast radius = fewer cascading failures.
- **Flag risks before acting.** When a change touches shared infrastructure (models, APIs, auth), present the options and tradeoffs BEFORE implementing.
- **Audit all side effects.** When changing anything cross-cutting (model, config, API params), check every file that uses it. Don't leave incompatible params behind.
- **Do not swap models or dependencies without confirming availability.** `gemini-2.0-flash` is DEPRECATED for this API key. All endpoints MUST use `gemini-2.5-flash`.
- **Before pushing a fix, mentally trace the exact user flow** ("click sign in → what function runs → what showScreen is called → what screen appears") through the new code.
- **All 8 API endpoints use `gemini-2.5-flash` with `thinkingConfig: { thinkingBudget: 0 }`** — this is critical for speed and preventing response truncation. Do NOT remove `thinkingBudget: 0`.
- **All 8 API endpoints have `geminiWithRetry()` auto-retry** — 1 retry with 500ms delay on transient Gemini errors. Do NOT increase retries beyond 1 (demo latency concern).

---

## What I'm Building
A Career Navigation Platform for Aspiring Product Managers, serving both India and North America.

## Product Name
**Compass** — "Like Google Maps, but for your PM career."

## Current Stage
Prototype live on Vercel with full AI pipeline: Supabase auth, PDF resume parsing, AI gate scoring, AI readiness scoring (6 dimensions), RAG-powered North AI assistant (vector search + keyword fallback), daily task system (21 tasks across 4 phases) with score improvement, post-rejection agentic remediation, job matching, trend signals, and mock interview room. Deployed at `compass-pm.vercel.app`. GitHub repo: `aditianapindi/compass-PM`. Next step: validate with 5–10 real users, then pursue technical co-founder or pre-seed raise.

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
| `parse-resume.js` | Resume parsing — PDF text → Gemini → structured JSON (name, role, experience, skills, pmHighlights). Text truncated to 3000 chars, maxOutputTokens: 1024 |
| `score-gate.js` | Gate task scoring — returns score (0–100), thinkingStyle, headline, strength, gap |
| `score-readiness.js` | Readiness scoring — 6 PM dimensions with evidence signals, background baselines, cross-validation rules, calibration examples. Weights: Product Sense 25%, Analytical 20%, Business 15%, Technical 15%, AI Fluency 10%, Behavioural 15% |
| `score-task.js` | Daily task scoring — 8 task-type-specific rubrics (product-teardown, metric-diagnosis, business-case, technical-tradeoff, ai-feature-design, stakeholder-conflict, networking, portfolio), returns score + dimensionImpact (delta +0 to +5) |
| `north-chat.js` | North AI chat — semantic vector search (pgvector) with keyword fallback for RAG. Returns contextual reply + ragSource. maxOutputTokens: 800 |
| `rejection-agent.js` | Post-rejection agentic flow — 3 Gemini calls: IDENTIFY (company + round) → RETRIEVE (vector search + keyword fallback) → DIAGNOSE + GENERATE (2-week remediation plan) |
| `semantic-search.js` | Standalone vector search endpoint — embeds query via gemini-embedding-001, searches Supabase pgvector |
| `job-matches.js` | AI job matching — compares user scores against company hiring bars, returns 4 personalized matches. maxOutputTokens: 1000 |
| `job-listings.js` | Job listings with fit calculation — pure math (user score / required score per dimension) |
| `job-trends.js` | Personalized trend signals — connects user gaps to market movements. maxOutputTokens: 600 |
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
Landing → Q1–Q8 (auto-advance) → Loading → Fit Verdict
→ [Login wall] → Sign In → Connect Profiles
→ Gate (first action task) → Readiness Score → [Paywall] → Dashboard (merged path+dashboard)
Side: Profile (s-profile), Interview Room (s-interview), Jobs+Trends (s-jobs)
```

### All Screens
| Screen ID | What It Does |
|---|---|
| `s-landing` | Hero, pain points, 7-step how-it-works, footer CTA. No `active` class in HTML — shown by `onAuthStateChange` when no session. |
| `s-signin` | Sign in / create account (Google OAuth via Supabase, email/password). No LinkedIn button. Smart flow: if user tries to create account with existing email, auto-switches to sign-in mode. |
| `s-connect` | Connect LinkedIn, Teal, resume upload (PDF.js + Gemini), GitHub, writing samples |
| `s-q1`–`s-q8` | 8 onboarding questions — auto-advance on selection, no Next button. Q3=experience signals (checkboxes), Q5=skills (multi-select pills) |
| `s-loading` | Spinning compass, 10 rotating motivational quotes, animated check items (12 companies, not 40+), auto-advances to verdict |
| `s-verdict` | PM Type card, locked score ring (unlocks after LinkedIn + gate task), background pattern hypothesis |
| `s-gate` | Dual-purpose screen: onboarding gate task OR daily practice tasks. charLimit varies by task (500–2000). AI scoring, inline feedback card with dimension impact, learning resources after daily tasks. Textarea collapses after scoring for scroll UX. "Next Task →" CTA after completion. |
| `s-readiness` | Animated radar chart (6 dimensions) + score ring + confidence indicator (measured vs estimated) + stat cards. Scores driven by AI (score-readiness.js) |
| `s-paywall` | Monetisation screen — Monthly (₹999/mo) vs Annual (₹7,999/yr) pricing cards |
| `s-dashboard` | **Merged path + dashboard (Duolingo-style).** Recovery plan card (if rejection agent used, persisted in localStorage). Compact progress header (tasks done, progress bar X/21, streak grid). Tasks grouped by dimension sorted weakest-first, each clickable via `startSpecificTask(taskId)`. Mock interview milestone card (unlocks at 12+ tasks). Job matches section. `s-path` redirects here via `showScreen`. |
| `s-interview` | Interview Room — Riva AI avatar, round selector (Product Sense/Metrics/Behavioural), company selector, pressure level. Start button is enabled. Uses hardcoded responses (backend is prototype-level). |
| `s-jobs` | **Merged Jobs + Trends.** Job listings with fit percentages + personalized trend signals in one screen. |
| `s-profile` | User profile — connected accounts, detected skills, PM type verdict, dimension scores (left column); resume snapshot, PM highlights, fix card (right column). Edit Profile modal for resume re-upload. Retake Assessment button. Log out button at bottom with user email display. |

### Key Design Decisions
- **Free flow:** Landing → Q1–Q8 → Fit Verdict (no login required)
- **Login wall:** Bottom of Fit Verdict. "Login to unlock my full path — it's free"
- **Paywall:** Between Readiness Score and the Dashboard. Free = diagnosis. Paid = navigation.
- **Pricing:** Monthly ₹999/mo · Annual ₹7,999/yr (save 33%). Inside validated WTP ceiling.
- **Score locked on verdict:** Shows `?` ring until LinkedIn/resume + gate task completed. Then unlocks with confidence indicator.
- **Gate task (dual-purpose):** Onboarding mode = product teardown for gate scoring. Daily mode = varied task types targeting weakest dimensions.
- **Personalization:** `pmTypeMap` + `companyMap` + `personalize()` — all post-verdict text reflects Q1 background + Q4 target company. Name comes from Google profile or LinkedIn, not a form field.
- **Full navbar:** Visible on all screens from s-gate onward (Path, Jobs, Interview Room, Profile tabs + avatar). Compass logo calls `goHome()` — routes signed-in users to dashboard, others to landing.
- **Score=0 handling:** Use `data.score == null` (not `!data.score`) — zero is a valid score.
- **Returning user flow:** `compass_logged_in` localStorage flag enables fast return path. Cleared on `logOut()`.

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
- Text sent to `/api/parse-resume` → Gemini 2.5 Flash (text truncated to 3000 chars, maxOutputTokens: 1024)
- Returns: `name`, `email`, `phone`, `currentRole`, `totalExperience`, `experience[]`, `awards[]`, `pmHighlights[]`, `skills[]`
- `pmHighlights` schema: `{ text, type: "strength|warning|action", label: "↑/⚠/→ label" }`
- Profile page updates automatically

### 2. Gate Task Scoring (Gemini 2.5 Flash)
- User writes product teardown on s-gate (charLimit varies by task)
- On submit → `/api/score-gate` with text + user background (Q1)
- Returns: `score` (0–100), `thinkingStyle`, `headline`, `strength`, `gap`
- Temperature: 0.2 for scoring consistency

### 3. Readiness Scoring (Gemini 2.5 Flash)
- Takes resume data + gate score + background + target company
- Scores 6 dimensions using evidence signals, background baselines, cross-validation rules, and calibration examples
- Returns dimension scores (0–100) with status (Gap/Developing/Solid/Strong) + overall weighted score
- Powers the animated radar chart on s-readiness
- Temperature: 0.3

### 4. Daily Task System (21 tasks × 8 types × 4 phases)
- **Phase 1 (Weeks 1–2):** Product Sense — 4 product teardown tasks
- **Phase 2 (Weeks 3–4):** Analytical Depth (4 metric diagnosis tasks) + Business Framing (2 business case tasks)
- **Phase 3 (Weeks 5–6):** AI Fluency (2 ai-feature-design tasks) + Technical Credibility (1 technical-tradeoff task) + Behavioural (2 stakeholder-conflict tasks)
- **Phase 4 (Interview Ready):** Networking (3 tasks: cold outreach, referral mapping, coffee chat prep) + Portfolio (3 tasks: feature redesign case study, side project brief, impact narrative)
- Each has its own AI scoring rubric via `/api/score-task`
- **Task selection:** Targets user's 2–3 weakest dimensions (`selectDailyTask()`), filters out completed tasks
- **Clickable task list:** `renderTaskList()` groups tasks by dimension sorted weakest-first. Each task is clickable via `startSpecificTask(taskId)`. Current task shows pulsing indicator + "Start Task →" button.
- Score improvement: each task adds +0 to +5 points to the relevant dimension
- Progress tracked: tasks completed counter, progress bar (X/21), full task list with scores, streak grid
- **Mock interview milestone:** Card appears at bottom of task list. Locked until 12+ tasks completed, then shows CTA to enter Interview Room.
- Persistence: localStorage (immediate) + Supabase `task_progress` column (async)
- `currentTaskMode` variable switches s-gate between onboarding ('gate') and daily practice ('daily')
- **After task completion:** "Next Task →" button (calls startDailyTask) with "← Back to Path" secondary link
- **Learning resources after daily tasks:** `LEARNING_RESOURCES` array (32 curated entries from Lenny Rachitsky, Aakash Gupta, Shreyas Doshi, Shravan Tickoo) mapped by dimension + taskType. `getResourcesForTask(task)` returns top 2 matches. `renderLearningResources(task)` shows "Deepen this skill" card in feedback. Only appears for daily tasks (not gate).
- **Post-scoring scroll UX:** Textarea collapses to 80px with opacity 0.5 after successful scoring. Feedback card uses `scrollIntoView({ block: 'start' })`. Error messages also scroll into view. Textarea resets in `populateGateScreen()` and `resetGateToOnboarding()`.

### 5. North AI Assistant (Gemini 2.5 Flash + RAG)
- Floating compass bubble (bottom-right), visible on all post-onboarding screens
- 5 quick-reply chips: "I'm feeling stuck", "How am I doing?", "Mock Interview" (navigates to Interview Room), "What to do today?", "I got rejected"
- **RAG pipeline:** User message → embed via gemini-embedding-001 → search Supabase pgvector (top 5 results) → inject into Gemini prompt → grounded response
- **Fallback:** If vector search unavailable, keyword matching from pm-market-data.json
- Returns `ragSource` field ("vector" or "keyword") for verification
- Context includes: name, background, target company, readiness scores, gate score, resume highlights
- North personality: honest, not a cheerleader, 2–4 sentences, specific to user data
- Temperature: 0.7
- **Auto-popup tooltip:** Shows on dashboard and verdict screens with personalized intro message, fades after 5s. Uses `<span id="north-tooltip-text">` to avoid wiping arrow caret div. `max-width:280px` with `white-space:normal`.

### 6. Post-Rejection Remediation Agent (Agentic AI)
- Triggered by "I got rejected" chip or natural language in North chat
- **Step 1 — IDENTIFY:** Extracts company + round from message. If company unknown, asks user (returns `needsInfo: true`)
- **Step 2 — RETRIEVE:** Vector search for company data with keyword fallback from pm-market-data.json
- **Step 3 — DIAGNOSE + GENERATE:** Compares user scores vs company hiring bar, generates 2-week day-by-day remediation plan
- Returns structured JSON: headline, rootCause (primary + secondary with scores/bars/gaps), recoveryPlan (2 weeks × 5 days), reapplySignal
- Frontend renders structured diagnosis card in North chat with progress bars and recovery plan
- **Recovery plan persisted:** Saved to `userData.recoveryPlan` + `compass_recovery_plan` in localStorage. Loaded in `loadProfile()`. Rendered on dashboard via `renderRecoveryPlan()` with week tabs (`switchRecoveryWeek()`), dismiss button (`dismissRecoveryPlan()`). Cleared on `logOut()`.

### 7. Job Matching (AI + Math)
- **AI matches (dashboard):** Sends user scores + company data to Gemini → 4 personalized matches with fit percentages
- **Math-based listings (jobs screen):** 24 listings, fit = average of (user score / required score) per dimension, capped at 100%
- **Trend signals:** Market trends personalized to user's gaps and target company. Displayed on merged jobs screen.

### 8. Interview Room (Riva)
- Full UI: AI avatar with breathing rings, round selector (Product Sense/Metrics/Behavioural), company selector (Razorpay/Meesho/Flipkart/Swiggy/CRED), pressure level toggle
- "Start Interview with Riva →" button is enabled (not disabled)
- `startInterview()` → shows live panel with timer, chat interface
- `rivaRespond()` → hardcoded follow-up responses (prototype-level, backend not built yet)
- `endInterview()` → shows hardcoded assessment with "Try Another Round" and "Back to Dashboard" buttons
- **Mock interview milestone in path:** Unlocks after 12+ tasks completed, CTA links to Interview Room

### 9. Edit Profile Modal
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
- **AI:** Gemini 2.5 Flash via `generativelanguage.googleapis.com/v1beta` — ALL endpoints use `thinkingConfig: { thinkingBudget: 0 }`
- **Embeddings:** Gemini embedding-001 (3072 dimensions) for RAG vector search
- **Vector DB:** Supabase pgvector extension — `embeddings` table with `match_embeddings` RPC function
- **API keys:** `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` stored in Vercel environment variables (never in code). Local scripts use `.env` file.
- **PDF parsing:** PDF.js via unpkg CDN (client-side, first 3 pages)

### Auth Flow Architecture
The auth system uses a **dual-path approach**:

1. **Sign-in/sign-up handlers navigate directly** — after `signInWithPassword()` or `signUp()` succeeds, the handler itself calls `loadProfile()` and `showScreen()`. This is the primary navigation path for interactive sign-in/sign-up.
2. **`onAuthStateChange` handles page-load and OAuth redirects** — fires on `INITIAL_SESSION` (page load with existing session) and after Google OAuth redirect. Uses `_authHandled` flag to prevent double-navigation.
3. **`loadProfile(existingSession)` accepts optional session** — avoids redundant `getSession()` calls that can race with session storage.
4. **Smart sign-in for existing accounts** — when a user clicks "Create Account" with an email that already exists (Supabase returns `identities.length === 0`), the UI auto-switches to sign-in mode: button becomes "Sign in →", password field clears and focuses. Changing the email resets back to create mode.

**Critical:** Never remove direct `showScreen()` calls from sign-in/sign-up handlers. Supabase v2 fires `onAuthStateChange` asynchronously via `setTimeout(0)` — it is NOT reliable as the sole navigator.

Key variables:
- `_authHandled` — dedup flag, prevents INITIAL_SESSION + SIGNED_IN from both navigating. Reset on sign-out (no session).
- `preAuthScreens` — screens where auth handler should navigate: `['s-signin', 's-landing', 's-verdict', 's-connect', 's-q1'–'s-q8', 's-loading']`
- `getReturningScreen(profile)` — returns the right screen based on how far the user progressed (readiness_scores → dashboard, gate_score → readiness, resume_data → gate, q1 → connect)

### showScreen Architecture
- `showScreen(id)` handles all screen transitions with 180ms fade
- `s-path` redirects to `s-dashboard` (merged screens)
- `_showScreenTimer` prevents overlapping transitions — always cancelled before `!cur` early return to prevent timer conflicts
- Hides ALL screens (not just active) in the timer callback to prevent bleed-through
- `onScreenReady(id)` — extracted function containing all screen-specific triggers (dashboard renderers, radar animations, North bubble, etc.). Called from both the `!cur` fast path (OAuth redirect) and the normal 180ms transition callback. This ensures screens render correctly regardless of entry path.
- Dashboard renderers (`renderDashboardTask`, `renderStreak`, `renderTaskList`) are each wrapped in try/catch so one failure doesn't block the rest
- North bubble visibility managed per-screen

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
  },
  recoveryPlan: {   // from rejection-agent API, persisted in localStorage
    company, round, headline,
    rootCause: { primary: { dimension, userScore, companyBar, gap, explanation }, secondary: {...} },
    recoveryPlan: { duration, focusAreas, weeks: [{ week, theme, days: [{ day, task, output, time }] }] },
    reapplySignal
  }
}
```

### Persistence
- **Supabase `profiles` table:** q1–q8, resume_data, gate_score, readiness_scores, task_progress, exp_signals, skills (all JSONB)
- **localStorage backup:** task_progress (`compass_task_progress`), readiness_scores (`compass_readiness_scores`), recovery_plan (`compass_recovery_plan`), logged_in flag (`compass_logged_in`), enriched flag (`compass_v2_enriched`)
- **Resilient saves:** `saveProfile()` retries without `task_progress` if column doesn't exist, so other data still saves
- **Load priority:** Supabase → localStorage fallback for task_progress and readiness_scores
- `ensureReadinessScores()` guarantees scores exist (from Supabase → localStorage → hardcoded defaults) so task system always works

### Key Functions
- `processResumeFile(file)` — handles upload on s-connect, calls parse-resume API, updates userData and profile
- `processResumeFileFromModal(file)` — same logic but uses modal UI elements, closes modal on success
- `updateProfileFromResume(parsed)` — updates all profile elements from parsed resume data
- `submitGate()` — async, calls score-gate API, reveals inline feedback card. Uses `data.score == null` (not `!data.score`).
- `submitDailyTask()` — async, calls score-task API, records completion, applies dimension delta, selects next task. Uses `data.score == null`.
- `startDailyTask()` — sets daily mode, selects task, populates gate screen
- `startSpecificTask(taskId)` — starts any task from the clickable task list, resolves {company} placeholder
- `selectDailyTask()` — picks next uncompleted task targeting weakest 3 dimensions
- `applyDimensionDelta(dim, delta)` — updates dimension score + recalculates weighted overall
- `ensureReadinessScores()` — guarantees readinessScores exist from Supabase/localStorage/defaults
- `renderDashboardTask()` — renders today's task card on dashboard
- `renderStreak()` — renders progress counter, progress bar, streak, and week grid
- `renderTaskList()` — groups tasks by dimension sorted weakest-first, each task clickable, mock interview milestone at bottom
- `renderPathProgress()` — renders 4-phase task list with progress bars on path screen
- `northAsk(message)` — async, calls north-chat API with full user context, handles typing indicator
- `northRejectionAgent(message)` — async, calls rejection-agent API, handles needsInfo follow-up flow
- `renderRejectionCard(data)` — renders structured diagnosis card in North chat
- `northAutoPopup(screenId, message, delay)` — shows tooltip with intro message on first visit to a screen
- `getNorthContext()` — assembles userData into context string for North API
- `fetchReadinessScores()` — calls score-readiness API, stores result
- `fetchJobMatches()` / `fetchJobListings()` / `fetchTrendSignals()` — dashboard/jobs data fetchers
- `applyName()` — updates all avatar initials and profile name across all screens
- `onScreenReady(id)` — extracted screen-specific hooks (dashboard renderers, radar, North bubble). Called from both `!cur` and transition paths.
- `goHome()` — routes signed-in users (`userData.profileConnected`) to dashboard, others to landing. Used by all post-auth navbar Compass logos.
- `getResourcesForTask(task)` — filters LEARNING_RESOURCES by dimension + taskType match, returns top 2
- `renderLearningResources(task)` — renders "Deepen this skill" card with 2 curated resources in feedback area
- `renderRecoveryPlan()` — renders pinned recovery card on dashboard with week tabs, daily tasks, dismiss button
- `switchRecoveryWeek(weekNum)` — toggles week tab visibility in recovery plan
- `dismissRecoveryPlan()` — clears recoveryPlan from userData, localStorage, and dashboard
- `showTaskFeedback(data, task)` — shared function rendering score results for both gate and daily tasks, collapses textarea, scrolls into view
- `logOut()` — signs out of Supabase, clears all userData and localStorage (including compass_logged_in, compass_recovery_plan), navigates to landing
- `showScreen(id)` — handles screen transitions, cancels pending timers, calls `onScreenReady(id)`
- `saveProfile()` / `loadProfile(existingSession?)` — Supabase persistence with localStorage backup. loadProfile accepts optional session to avoid getSession() race.
- `saveProgressLocal()` / `loadLocal()` / `saveLocal()` — localStorage helpers
- `getReturningScreen(profile)` — determines which screen to show for returning users based on profile progress
- `populateGateScreen(task)` — populates gate screen with task data, sets charLimit/maxLength
- `startInterview()` / `endInterview()` / `rivaRespond()` — Interview Room functions (hardcoded prototype)

### Supabase Integration
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Anon key inlined in index.html (safe to expose)
- Service key in Vercel env vars (for vector search RPC calls)
- Auth providers: Google OAuth, Email/Password
- **Tables:** `profiles` (user data + task progress), `embeddings` (pgvector RAG data)
- **RPC:** `match_embeddings(query_embedding, match_count, filter_type)` — cosine similarity search
- On sign-in: handlers directly load profile and navigate. `onAuthStateChange` is backup for OAuth redirects.

### Design System
| Token | Value |
|---|---|
| Background | `#09090B` |
| Surface | `#18181B` |
| Elevated | `#27272A` |
| Accent | `#818CF8` (indigo) |
| Fonts | Syne (headings) + DM Sans (body) |

### TASK_BANK Structure
```javascript
// 21 tasks across 4 phases, 8 types, 6 dimensions
// Phase 1 (4): ps-1 to ps-4 (Product Sense, product-teardown)
// Phase 2 (6): ad-1 to ad-4 (Analytical Depth, metric-diagnosis) + bf-1, bf-2 (Business Framing, business-case)
// Phase 3 (5): ai-1, ai-2 (AI Fluency, ai-feature-design) + tc-1 (Technical Credibility, technical-tradeoff) + bh-1, bh-2 (Behavioural, stakeholder-conflict)
// Phase 4 (6): nw-1 to nw-3 (Networking: cold outreach, referral mapping, coffee chat prep) + pf-1 to pf-3 (Portfolio: case study, project brief, impact narrative)
// Each task: { id, type, dimension, phase, title, prompt, minutes, charLimit }
// {company} placeholder in title/prompt resolved from companyMap[userData.q4]
```

---

## Known Issues & Fixes Applied

### Auth Flow (CRITICAL — do not regress)
- Sign-in/sign-up handlers MUST call `showScreen()` directly. Do NOT remove these in favor of `onAuthStateChange`.
- `onAuthStateChange` fires asynchronously in Supabase v2 — unreliable as sole navigator.
- `loadProfile()` must accept optional session to avoid `getSession()` race condition.
- `_authHandled` flag prevents INITIAL_SESSION + SIGNED_IN double navigation. Reset when session is null.
- Catch block in `onAuthStateChange` must navigate even when no screen is active (`!cur`).

### Score Handling
- `data.score == null` not `!data.score` — zero is a valid score that `!data.score` treats as falsy.

### Screen Transitions
- `showScreen()` cancels `_showScreenTimer` BEFORE the `!cur` early return to prevent timer conflicts.
- Timer callback hides ALL screens (not just active) to prevent bleed-through.

### API Configuration
- ALL 8 endpoints use `gemini-2.5-flash` with `thinkingConfig: { thinkingBudget: 0 }`.
- `gemini-2.0-flash` is DEPRECATED and unavailable for this API key — never use it.
- `thinkingBudget: 0` is essential — without it, Gemini uses thinking tokens from the output budget, causing truncated responses.
- ALL 8 endpoints have `geminiWithRetry()` — 1 retry with 500ms delay on transient Gemini API errors (capacity/overload). Do NOT increase retries (demo latency).
- Frontend error messages: "Our AI is warming up — try again in a moment" (not "Scoring failed").

### Mobile Responsiveness
- Single `@media(max-width:700px)` block (injected via JS) handles ALL responsive overrides.
- Grids that collapse to `1fr` on mobile: `.signin-grid`, `.dash-grid`, `.profile-grid`, `.interview-grid`, `#jobs-grid`, `.verdict-grid`, `#job-matches-list`, `#trend-signals-list`, `#dim-list`, `#readiness-insights`, `.paywall-pricing`, `.paywall-features`, `.landing-steps-3`, `.interview-sub-grid`.
- `.landing-steps-4` collapses to `repeat(2,1fr)` on mobile (2x2 grid).
- `.nav-links` hidden on mobile — avatar provides navigation to Profile where all links are accessible.
- `#north-panel` uses `width:calc(100vw - 32px)` on mobile to prevent overflow.

### Logout Cleanup (CRITICAL — prevents stale state between users)
- `logOut()` must reset ALL module-level variables: `currentTaskMode = 'gate'`, `_rejectionPending = false`, `northAutoShown = {}`, `jobListingsCache = null`, `northOpen = false`.
- `logOut()` must clear North chat DOM (reset to default greeting).
- `logOut()` removes all localStorage keys: `compass_task_progress`, `compass_readiness_scores`, `compass_v2_enriched`, `compass_recovery_plan`, `compass_logged_in`.

### Duplicate Function Prevention
- `handleDrop`, `handleFileSelect`, `handleConnect` must each have ONE definition (at ~line 2088-2106). Later duplicate definitions were removed — they overwrote the real AI-parsing versions with cosmetic-only ones.
- `_rejectionPending` resets when North panel closes (`toggleNorth`) to prevent user getting stuck in rejection agent mode.

### Job Filter
- "Your Target" filter uses `companyMap[userData.q4].company` to resolve the actual company name (e.g. Q4="Fintech and payments" → company="Razorpay"). Direct comparison of `userData.q4` against `job.company` will never match.

---

## Open Threads (Not Yet Built)
1. **Resume-to-verdict personalization** — s-verdict copy should reference actual resume data (currentRole, experience) not just Q1 answer
2. **Riva interview backend** — currently hardcoded responses. Real version needs Claude API or Gemini live chat.
3. **Voice input for Riva** — Web Speech API (text-first for now)
4. **Cohort/peer group feature**
5. **Stripe/Razorpay integration** for paywall
6. **Domain** — check and acquire compass domain

## Next Steps (Recommended Order)
1. Validate prototype with 5–10 real users (share `compass-pm.vercel.app`)
2. Resume-to-verdict personalization (s-verdict copy uses real resume data)
3. Payment integration (Stripe for NA, Razorpay for India)
4. Technical co-founder or pre-seed raise using prototype as proof of concept
