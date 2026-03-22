# PM Career Navigation Platform — Project Context

## What I'm Building
A Career Navigation Platform for Aspiring Product Managers, serving both India and North America.

## Product Name
**Compass** — "Like Google Maps, but for your PM career."

## Current Stage
Prototype live on Vercel with working Supabase auth, PDF resume parsing, AI gate scoring, and AI North assistant. Deployed at `compass-pm.vercel.app`. GitHub repo: `aditianapindi/compass-PM`. Next step: validate with 5–10 real users, then pursue technical co-founder or pre-seed raise.

## Key Files
- `index.html` — Full interactive prototype (single HTML file). 13 screens, vanilla JS, Tailwind CDN, Supabase JS CDN, PDF.js CDN, Google Fonts (Syne + DM Sans). Supabase keys inlined directly (anon key is safe to commit).
- `config.js` — Supabase credentials (gitignored — never commit).
- `api/parse-resume.js` — Vercel serverless function. Extracts PDF text via PDF.js on client, sends to Gemini 2.5 Flash, returns structured JSON (name, email, phone, currentRole, totalExperience, experience, awards, pmHighlights, skills).
- `api/score-gate.js` — Vercel serverless function. Takes gate task text + user background, sends to Gemini 2.5 Flash, returns score (0–100), thinkingStyle, headline, strength, gap.
- `api/north-chat.js` — Vercel serverless function. Takes user message + full user context string, sends to Gemini 2.5 Flash, returns North's reply (honest, specific, 2–4 sentences).
- `api/list-models.js` — Diagnostic endpoint. Lists all Gemini models available for the API key.
- `compass_session_notes.md` — Full session notes: all screens, design decisions, AI features, open threads.
- `pm_market_research_report.md` — Market research report (780 lines, live-verified March 2026).
- `pm_discovery_report.md` — Discovery report (938 lines): personas, journey maps, JTBD, TAM.
- `pm_navigator_product_brief.md` — Product decisions, MVP definition, build plan.

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
2. Updates across dimensions (product sense, analytical, behavioral, AI fluency) as user practices
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
Side: Profile (s-profile), Interview Room (s-interview)
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
| `s-gate` | First action task — 1500-char max product teardown, character countdown, AI scoring, inline feedback card |
| `s-readiness` | Radar chart (6 dimensions) + confidence indicator (measured vs estimated) + stat cards |
| `s-paywall` | Monetisation screen — Monthly (₹999/mo) vs Annual (₹7,999/yr) pricing cards |
| `s-path` | 3-phase 6-week navigation plan (Product Sense → Analytical → AI Fluency) |
| `s-dashboard` | Streak, today's task, job fit matches, hiring trend signals |
| `s-interview` | Interview Room — Riva AI avatar, round selector, live mock session |
| `s-profile` | User profile — connected accounts, PM highlights, skills, dimension scores. Edit Profile modal for resume re-upload. |

### Key Design Decisions
- **Free flow:** Landing → Q1–Q5 → Fit Verdict (no login required)
- **Login wall:** Bottom of Fit Verdict. "Login to unlock my full path — it's free"
- **Paywall:** Between Readiness Score and the 6-week Path. Free = diagnosis. Paid = navigation.
- **Pricing:** Monthly ₹999/mo · Annual ₹7,999/yr (save 33%). Inside validated WTP ceiling.
- **Score locked on verdict:** Shows `?` ring until LinkedIn/resume + gate task completed. Then unlocks with confidence indicator.
- **Gate task:** Max 1500 chars. Character countdown. Enabled after 20 chars typed. Submits to Gemini for real scoring.
- **Personalization:** `pmTypeMap` + `companyMap` + `personalize()` — all post-verdict text reflects Q1 background + Q4 target company. Name comes from Google profile or LinkedIn, not a form field.
- **Full navbar:** Visible on all screens from s-gate onward (Path, Jobs, Trends, Interview Room, Profile tabs + avatar).
- **s-gaps screen cut** — content merged into s-readiness as dimension breakdown grid
- **7-step How It Works** — includes "Build Your Portfolio" and "Create Connections" steps

### The 6 PM Dimensions (Hardcoded sample scores — not yet driven by real AI)
| Dimension | Score | Status |
|---|---|---|
| Product Sense | 58 | Developing 🟠 |
| Analytical Depth | 44 | Gap 🔴 |
| Business Framing | 53 | Developing 🟠 |
| Technical Credibility | 81 | Strong 🟢 |
| AI Fluency | 37 | Gap 🔴 |
| Behavioural | 62 | Developing 🟠 |

---

## AI Features Built (All Live)

### Resume Parsing (PDF.js + Gemini 2.5 Flash)
- User uploads PDF on s-connect
- PDF.js extracts text client-side (first 3 pages)
- Text sent to `/api/parse-resume` → Gemini 2.5 Flash
- Returns: `name`, `email`, `phone`, `currentRole`, `totalExperience`, `experience[]`, `awards[]`, `pmHighlights[]`, `skills[]`
- `pmHighlights` schema: `{ text, type: "strength|warning|action", label: "↑/⚠/→ label" }`
- Profile page updates automatically: header name + subtitle, resume snapshot card, PM highlights (colour-coded), detected skills, "One Thing to Fix" card
- `updateProfileFromResume(parsed)` is called on upload AND when navigating to s-profile if `userData.resumeData` exists

### Gate Task Scoring (Gemini 2.5 Flash)
- User writes product teardown on s-gate (up to 1500 chars)
- On submit → `/api/score-gate` with text + user background (Q1)
- Returns: `score` (0–100), `thinkingStyle`, `headline`, `strength`, `gap`
- Inline feedback card revealed on gate screen (no navigation away): score ring coloured green/amber/red, headline, green dot strength, amber dot gap
- "See My Full Readiness Score →" button navigates to s-readiness
- Result stored in `userData.gateScore`
- Falls through silently to s-readiness if API fails

### North AI Assistant (Gemini 2.5 Flash)
- Floating compass bubble (bottom-right), visible on all post-onboarding screens
- 5 quick-reply chips: "I'm feeling stuck", "How am I doing?", "Mock Interview", "What to do today?", "I got rejected"
- Free-text input — all messages routed to `/api/north-chat`
- Context sent with every message: name, Q1 background, Q4 target company, currentRole, totalExperience, readiness score, gate score + headline + strength + gap, resume pmHighlights (strengths and warnings)
- North personality: honest, not a cheerleader, 2–4 sentences, specific to user data, no generic PM advice
- Typing indicator (`···`) shown while waiting for Gemini
- Auto-popup nudges on s-verdict, s-gaps, s-dashboard with screen-specific messages (shown once per screen per session)

### Edit Profile Modal
- "Edit Profile" button on s-profile opens a modal overlay
- Modal has drag-and-drop + browse PDF upload zone
- Runs full parse-resume flow inline — shows progress states (reading → AI parsing → done)
- Closes automatically 1.2s after success and refreshes all profile data
- Click outside or ✕ to close

---

## Technical Architecture

### Infrastructure
- **Hosting:** Vercel (auto-deploys on push to GitHub main branch)
- **Repo:** `github.com/aditianapindi/compass-PM`
- **Auth:** Supabase (Google OAuth + email/password)
- **AI:** Gemini 2.5 Flash via `generativelanguage.googleapis.com/v1beta`
- **API key:** `GEMINI_API_KEY` stored in Vercel environment variables (never in code)
- **PDF parsing:** PDF.js via unpkg CDN (client-side, first 3 pages)

### Serverless Functions (`api/` folder)
| File | Purpose |
|---|---|
| `parse-resume.js` | Resume parsing — returns full structured JSON |
| `score-gate.js` | Gate task scoring — returns score, headline, strength, gap |
| `north-chat.js` | North AI chat — returns contextual reply |
| `list-models.js` | Diagnostic — lists available Gemini models |

### Key Global State (`userData` object)
```javascript
userData = {
  name,           // from Google auth or resume parse
  firstName,      // derived from name
  q1,             // background (e.g. "Software / Data Engineer")
  q4,             // target company
  profileConnected,
  resumeData: {   // from parse-resume API
    name, email, phone, currentRole, totalExperience,
    experience[], awards[], pmHighlights[], skills[], fileName
  },
  gateScore: {    // from score-gate API
    score, thinkingStyle, headline, strength, gap
  }
}
```

### Key Functions
- `processResumeFile(file)` — handles upload on s-connect, calls parse-resume API, updates userData and profile
- `processResumeFileFromModal(file)` — same logic but uses modal UI elements, closes modal on success
- `updateProfileFromResume(parsed)` — updates all profile elements from parsed resume data
- `submitGate()` — async, calls score-gate API, reveals inline feedback card
- `northAsk(message)` — async, calls north-chat API with full user context, handles typing indicator
- `getNorthContext()` — assembles userData into context string for North API
- `applyName()` — updates all avatar initials and profile name across all screens
- `showScreen(id)` — handles screen transitions; triggers updateProfileFromResume when navigating to s-profile

### Supabase Integration
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Keys inlined in index.html (anon key is safe to expose)
- Auth providers: Google OAuth, Email/Password
- Google redirect URI: `https://pcmddbdwajxmgftvycqw.supabase.co/auth/v1/callback`
- Supabase Site URL set to live Vercel domain
- On sign-in: name pulled from `user.user_metadata.full_name`, `applyName()` called, routed to `s-connect`
- No custom tables yet — users stored in Supabase Auth built-in users table

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
2. **Readiness score from AI** — radar chart scores are hardcoded; should be estimated from resume + gate score
3. **Second gate question** — metric drop diagnosis
4. **Riva interview backend** — currently hardcoded responses. Real version needs Claude API or Gemini.
5. **Voice input for Riva** — Web Speech API (text-first for now)
6. **North → Riva handoff** — Mock Interview chip in North should open Interview Room
7. **Cohort/peer group feature**
8. **`profiles` table in Supabase** — persist Q1–Q5 answers, readiness score, subscription status across sessions
9. **Stripe/Razorpay integration** for paywall
10. **Domain** — check and acquire compass domain

## Next Steps (Recommended Order)
1. Validate prototype with 5–10 real users (share `compass-pm.vercel.app`)
2. Resume-to-verdict personalization (s-verdict copy uses real resume data)
3. Readiness score dimensions driven by AI (resume + gate score as inputs)
4. `profiles` table in Supabase to persist user data across sessions
5. Payment integration (Stripe for NA, Razorpay for India)
6. Technical co-founder or pre-seed raise using prototype as proof of concept
