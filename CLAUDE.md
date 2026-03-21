# PM Career Navigation Platform — Project Context

## What I'm Building
A Career Navigation Platform for Aspiring Product Managers, serving both India and North America.

## Product Name
**Compass** — "Like Google Maps, but for your PM career."

## Current Stage
Prototype complete with working Supabase auth (Google OAuth + email/password sign-up). Monetisation paywall screen added. All files moved into `compass/` folder. Next step: push to GitHub, deploy to Netlify, validate with 5–10 real users.

## Key Files
- `compass_prototype.html` — Full interactive prototype (single HTML file). 12 screens, vanilla JS, Tailwind CDN, Supabase JS CDN, Google Fonts (Syne + DM Sans).
- `config.js` — Supabase credentials (gitignored — never commit).
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
| `s-connect` | Connect LinkedIn, Teal, resume upload, GitHub, writing samples |
| `s-q1`–`s-q5` | 5 onboarding questions — auto-advance on selection, no Next button |
| `s-loading` | Spinning compass, animated check items, auto-advances to verdict |
| `s-verdict` | PM Type card, locked score ring (unlocks after LinkedIn + gate task), background pattern hypothesis |
| `s-gate` | First action task — 300-char max product teardown, character countdown, submits to readiness |
| `s-readiness` | Radar chart (6 dimensions) + confidence indicator (measured vs estimated) + stat cards |
| `s-paywall` | Monetisation screen — Monthly (₹999/mo) vs Annual (₹7,999/yr) pricing cards |
| `s-path` | 3-phase 6-week navigation plan (Product Sense → Analytical → AI Fluency) |
| `s-dashboard` | Streak, today's task, job fit matches, hiring trend signals |
| `s-interview` | Interview Room — Riva AI avatar, round selector, live mock session |
| `s-profile` | User profile — connected accounts, PM highlights, skills, dimension scores |

### Key Design Decisions
- **Free flow:** Landing → Q1–Q5 → Fit Verdict (no login required)
- **Login wall:** Bottom of Fit Verdict. "Login to unlock my full path — it's free"
- **Paywall:** Between Readiness Score and the 6-week Path. Free = diagnosis. Paid = navigation.
- **Pricing:** Monthly ₹999/mo · Annual ₹7,999/yr (save 33%). Inside validated WTP ceiling.
- **Score locked on verdict:** Shows `?` ring until LinkedIn/resume + gate task completed. Then unlocks with confidence indicator.
- **Gate task:** Max 300 chars (not min). Character countdown. Enabled after 20 chars typed.
- **Personalization:** `pmTypeMap` + `companyMap` + `personalize()` — all post-verdict text reflects Q1 background + Q4 target company. Name comes from Google profile or LinkedIn, not a form field.
- **Full navbar:** Visible on all screens from s-gate onward (Path, Jobs, Trends, Interview Room, Profile tabs + avatar).
- **s-gaps screen cut** — content merged into s-readiness as dimension breakdown grid
- **7-step How It Works** — includes "Build Your Portfolio" and "Create Connections" steps

### The 6 PM Dimensions (Sample: Arjun, Engineer at Infosys)
| Dimension | Score | Status |
|---|---|---|
| Product Sense | 58 | Developing 🟠 |
| Analytical Depth | 44 | Gap 🔴 |
| Business Framing | 53 | Developing 🟠 |
| Technical Credibility | 81 | Strong 🟢 |
| AI Fluency | 37 | Gap 🔴 |
| Behavioural | 62 | Developing 🟠 |

### AI Features Built
**North** — Floating AI assistant (bottom-right compass bubble). Appears post-onboarding. Contextual nudges on verdict/gap/dashboard Day 1. 5 quick-reply chips + free-text input. Honest, non-cheerleader responses.

**Riva** — AI interview avatar. Lives in Interview Room tab. Animated SVG face with breathing rings. Round selector (Product Sense / Metrics / Behavioural), company selector (Razorpay, Meesho, Flipkart, Swiggy, CRED), pressure level toggle. Scores all 6 dimensions, feeds back into Readiness Score.

### Design System
| Token | Value |
|---|---|
| Background | `#09090B` |
| Surface | `#18181B` |
| Elevated | `#27272A` |
| Accent | `#818CF8` (indigo) |
| Fonts | Syne (headings) + DM Sans (body) |

### Supabase Integration
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Config: `config.js` (gitignored) — exports `SUPABASE_URL` and `SUPABASE_KEY`
- Auth providers enabled: Google OAuth, Email/Password
- Users stored in: Supabase Authentication → Users (built-in, no custom table needed yet)
- Google redirect URI in Google Cloud Console: `https://pcmddbdwajxmgftvycqw.supabase.co/auth/v1/callback`
- Supabase Site URL: `http://localhost:3000` (update when deployed)
- On sign-in: name pulled from `user.user_metadata.full_name`, `applyName()` called, routed to `s-connect`

### Open Threads (Not Yet Built)
1. Second gate question — metric drop diagnosis
2. AI interview backend — currently hardcoded. Real version needs Claude API.
3. Voice input for Riva — Web Speech API (text-first)
4. North → Riva handoff for mock interview chip
5. Cohort/peer group feature
6. Domain check for "Compass"
7. `profiles` table in Supabase — store Q1–Q5 answers, readiness score, subscription status
8. Stripe/Razorpay integration for paywall

### Next Steps (Recommended Order)
1. Push to GitHub → deploy to Netlify → update Supabase redirect URL to live domain
2. Validate prototype with 5–10 real users (share Netlify URL)
3. Connect Claude API for gate scoring, gap diagnosis, North responses
4. Add `profiles` table in Supabase to persist user answers + score
5. Add payment integration (Stripe for NA, Razorpay for India)
6. Technical co-founder or pre-seed raise using prototype as proof of concept
