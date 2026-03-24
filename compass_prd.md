# Compass — Product Requirement Document
### PM Career Navigation Platform
**Author:** Aditi Anapindi | **Date:** March 2026 | **Status:** Prototype live at compass-pm.vercel.app

---

## 1. Discovery Insights — Who's the User, What Did You Learn?

### The Broad Persona

Compass serves **professionals navigating a gap between the PM career they have and the PM career they want — with no trusted signal telling them how far they are or what to do next.** This is not a single job title. It is a transition state — covering career switchers (engineers, analysts, consultants), MBA graduates pivoting into tech PM, CS grads targeting APM programs, and experienced PMs pivoting to AI/Growth PM roles.

**Total addressable market: ~400,000–500,000 serious aspirants annually** across India and North America, triangulated from workforce data (4.3M Indian SWEs, 4.8M US SWEs), community sizes (Reddit r/ProductManagement 100K+, Lenny's Newsletter 1M subscribers, The Product Folks 119K+), and PM opening volumes. Discovery drew from 80+ secondary sources across two research documents (938-line discovery report, 780-line market research report).

### The PM Role Is Bifurcating

A critical discovery: the PM role itself is splitting, and the entry path is being rebuilt.

**The headline signal: LinkedIn scrapped its APM program in late 2025** and replaced it with an Associate Product Builder (APB) track — applicants submit a 60-second product demo they personally built, no resume required. CPO Tomer Cohen: *"We're going to teach them how to code, design, and PM at LinkedIn."* This is not isolated. Microsoft cut 373 PMs in May 2025, pushing engineer-to-PM ratio from 5.5:1 toward 10:1. Airbnb merged PM and product marketing into a single function. Coinbase and Indeed paused APM programs. Total APM spots are down ~30% industry-wide. PM job postings collapsed 94% from peak (426,104 in Sept 2022 → under 24,000 in Sept 2024).

The role is bifurcating: **High-judgment PM (growing)** — owns value, sets direction, navigates ambiguity. **Coordination PM (shrinking)** — writes PRDs, grooms backlogs, manages delivery. AI tools are absorbing these tasks. *"An AI-enabled product manager is going to come for your job — not AI itself."* — Sarthak Jain, Razorpay PM.

**Why this matters for Compass:** The old path (frameworks → mock interviews → APM application) is breaking. Aspiring PMs need to demonstrate they can build and think, not just coordinate. Compass is designed for this — the gate task forces building, the readiness score measures judgment, and the AI integrations model the tool fluency the market now demands.

### The Beachhead Persona: The Overwhelmed Explorer

From the broad population, we narrowed to: **The Overwhelmed Explorer** — 1–4 months into exploring PM, passive consumption (5 newsletters, 20 YouTube videos), zero active practice, no verdict on whether PM is right for them. This persona sits in the Orientation stage — the most chaotic stage, where there is no canonical starting point.

**Three pain points:**

| Pain Point | Evidence |
|---|---|
| **No Fit Verdict** — don't know if PM is right for them or which sub-type fits | 60–70% of explorers drop out before ever applying. No diagnostic exists anywhere. |
| **No Personalised First Step** — every guide says the same thing regardless of background | An engineer's gap (business framing) ≠ a consultant's gap (technical credibility). No platform differentiates. |
| **No Action Trigger** — nothing forces them to stop consuming and start doing | Median aspirant spends 2–4 months in passive content consumption before any active practice. |

**Why Explorer as beachhead:** Every persona passes through this stage. Solving for the Explorer means building the entry point all personas need — the highest-volume, most underserved slice. Expansion segments (career-break returners, PM → AI PM pivoters, services → product company, post-layoff PMs) validate the market extends beyond first-time aspirants.

### Truth Seekers vs. Hope Buyers

Explorers split into two psychographic mindsets. **Truth Seekers:** *"Tell me honestly if I'm ready, even if the answer is no."* They need calibration, not motivation. **Hope Buyers:** *"Tell me I can do this."* They want validation and community energy — the core customer of bootcamps.

**Compass is built for Truth Seekers.** The readiness score gives an honest number. The gate task forces action before the path unlocks. North (the AI assistant) is direct — *"honest and specific, never say 'great question!'"* The Hope Buyer market is served by PM School, NextLeap, and Exponent. The Truth Seeker market is not.

---

## 2. Problem Prioritisation — What Problem and Why This One?

### The Validated Problem Statement

> Aspiring PMs in India are preparing for a job market that no longer exists. No platform gives them accurate intelligence on where hiring actually is, what specific companies test, and how far they personally are from being competitive — so they spend 12–18 months in a low-signal cycle, optimising for the wrong things, targeting the wrong companies, and with no way to get in front of the right people.

### Three Core Problems

| Problem | Evidence |
|---|---|
| **No calibrated signal** — no platform tells you where your gap is relative to your target company's actual bar | Ghosting ranked #1 job-seeker stressor (JobScore). 0% of survey respondents received useful post-rejection feedback. |
| **Prep misaligned with reality** — courses teach frameworks; companies test analytical depth, AI fluency, domain specificity | *"I've hired PMs at 2 unicorns. I never got CVs from a PM bootcamp. Not one."* 78% agree AI literacy is now a hygiene check. |
| **No finish line** — 12–18 month prep cycles not because of content volume but because no go/no-go signal exists | Candidates use arbitrary milestones ("finish a book") to gauge readiness. No platform provides an objective threshold. |

These gaps — personalized diagnosis, calibrated feedback, readiness signal, post-rejection remediation — are consistently absent across all 11 competitors analysed.

### Why Now?

1. **AI raised the bar.** 14,000+ AI PM openings; 75% of employers struggle to find qualified AI PM candidates. Prep resources were written before this bar existed.
2. **PM volume collapsed.** 94% drop in postings from peak. 15–25x oversubscription in India.
3. **Solutions commoditised.** ChatGPT can generate a CIRCLES framework for any product question. Durable value must be in personalised guidance, not content.

### Market Sizing (India Beachhead)

| Pool | Estimate |
|---|---|
| Actively preparing for PM | 50,000–80,000/year |
| Beachhead (engineers/analysts, 2–5 yrs, Tier 1 targets) | 15,000–25,000/year |
| Annual entry-level PM openings | 3,000–7,000 |
| SOM Year 1–2 (paid users) | 2,000–5,000 |
| WTP ceiling | ~INR 40,000/year (~$480) |

---

## 3. Proposed Solution — Compass MVP

### The Metaphor

**"Like Google Maps, but for your PM career."** It doesn't teach you to drive — it tells you where you are, where you're going, and the fastest route given current traffic.

### Core Loop: Diagnose → Navigate → Signal

1. **Diagnose** — Readiness Score across 6 PM dimensions (Product Sense, Analytical Depth, Business Framing, Technical Credibility, AI Fluency, Behavioural), calibrated against real company hiring bars. Honest — most aspiring PMs score 30–65.
2. **Navigate** — 6-week action-forcing path tied to the user's specific gaps. Not a content library.
3. **Signal** — When score crosses threshold: *"You are now competitive for junior PM roles at Series B fintech companies."*

### Free vs. Paid

**Free (Diagnosis):** Landing → onboarding → Fit Verdict → resume upload → gate task → Readiness Score. **Paid — Compass Pro:** 6-week path, daily tasks with AI scoring, job matches, trend signals, Interview Room. **Pricing:** INR 999/mo or INR 7,999/yr (save 33%).

### Key Differentiators

| Compass | Exponent / PM School / NextLeap |
|---|---|
| Starts with diagnosis: "here's where YOU are weak" | Starts with content: "here's our curriculum" |
| Scores calibrated to real company hiring bars | Generic frameworks, same for everyone |
| Gate task forces action before path unlocks | Content unlocks immediately; no action required |
| Built for Truth Seekers | Built for Hope Buyers |

---

## 4. Implementation Plan — Build Roadmap

### What's Built (Live at compass-pm.vercel.app)

13-screen interactive prototype with: Supabase auth (Google OAuth + email), PDF resume parsing (PDF.js → Gemini 2.5 Flash), AI gate task scoring, AI readiness scoring (6 dimensions), North AI assistant (RAG-powered with user context), job matching against 12 Indian companies' real hiring bars, trend signals from curated market data, 24-listing Jobs screen with fit calculation, and Supabase data persistence.

### Roadmap

| Phase | Key Steps |
|---|---|
| **Now** | Validate with 5–10 real users. Resume-to-verdict personalisation. Second gate question (analytical depth). |
| **Next** | Payment integration (Razorpay India, Stripe NA). Riva AI interview backend. Supabase persistence expansion. |
| **Later** | Cohort/peer groups. Alumni referral layer. North America market skin (same engine, localised content). |

### Go-to-Market (India First)

Beachhead: Indian career switchers (engineers/analysts, 2–5 yrs) targeting Flipkart, Meesho, Razorpay, Swiggy, PhonePe, CRED. Channels: The Product Folks (119K+ LinkedIn), WhatsApp/Telegram prep groups, LinkedIn content, Product Hunt.

### Risks

| Risk | Mitigation |
|---|---|
| **Trust in early-stage readiness score** | Scores grounded in real company hiring bar data; transparent methodology |
| **Hope Buyer dominance** | North's honest personality + gate task act as natural filters |
| **Cold start (no mentors)** | AI assistant + curated data provide value at zero mentor supply; mentors added later |
| **India-only trap** | Architecture built for both markets from day 1 (one core, two skins) |
| **Assessment accuracy** | Directionally useful now; calibrates against hiring outcomes as user data accumulates |

---

## 5. Instruction Design — Step-by-Step Build Guide

### Design Direction

**Visual reference:** Clay (clay.global), a UI/UX agency known for premium dark-mode SaaS interfaces. Their Dribbble portfolio informed the colour system, card elevation patterns, and typographic hierarchy.

**Design system:** Near-black background (`#09090B`) with elevated card surfaces (`#18181B`, `#27272A`). Indigo accent (`#818CF8`) for primary actions and highlights. Status colours — emerald (strong), amber (developing), rose (gap). Typography: Syne (Google Fonts) for headings — geometric, bold, modern. DM Sans for body text — clean, highly legible. The system prioritises information density without clutter — dark surfaces create natural depth, and the accent palette draws attention to scores and CTAs.

### Technology Choices

**Single HTML file** (`index.html`) — maximum iteration speed with no build step or framework overhead. **Vanilla JS** with all state in a single `userData` object — React/Vue would add complexity without prototype-stage value. **Tailwind CSS via CDN** for rapid styling. **Gemini 2.5 Flash** via Vercel serverless functions for all AI features — fast, cheap, with `thinkingBudget: 0` to disable internal reasoning and maximise visible output. **Supabase** for auth (free tier, Google OAuth + email) and persistence (`profiles` table with jsonb columns). **PDF.js via CDN** for client-side resume text extraction. **Vercel** for hosting — auto-deploys on push to GitHub main, serverless functions co-located with frontend, zero DevOps.

### Screen Flow Design

The flow follows a **progressive commitment model** — give value before asking for anything:

```
FREE:        Landing → Q1–Q5 (auto-advance) → Loading → Fit Verdict
LOGIN WALL:  "Login to unlock my full path — it's free" → Sign In → Connect Profiles
POST-LOGIN:  Gate Task (AI-scored teardown) → Readiness Score (6 dimensions)
PAYWALL:     6-Week Path → Dashboard → Jobs → Interview Room
```

Key decisions: **Auto-advance on Q1–Q5** (no "Next" button — selection triggers 350ms transition, feels conversational). **Login wall at Fit Verdict** (users see PM type + locked score before being asked to sign in — they've invested 2 minutes, conversion is higher). **Gate task before readiness** (forces the Explorer to stop consuming and start doing — 1500-char product teardown with immediate AI feedback). **Paywall between diagnosis and navigation** (free = know your score; paid = close the gap).

### AI Integration Architecture

Six serverless functions in `api/`, each calling Gemini 2.5 Flash: **parse-resume** (PDF text → structured JSON with name, role, experience, skills, PM highlights), **score-gate** (teardown → score/headline/strength/gap with calibrated rubric), **score-readiness** (resume + gate data → 6 dimension scores with hardcoded scoring guide: 0–30 no evidence through 81–100 exceptional), **north-chat** (user message + full context → honest 2–4 sentence reply), **job-matches** (profile → 4 matches with fit scores grounded in real hiring bars), **job-trends** (profile → 4 personalised signals with impact levels).

**RAG approach:** Rather than a vector database, we curated `pm-market-data.json` — 12 Indian companies with hiring bars per dimension, interview formats, salary ranges, rejection reasons; 8 market trends; transition intelligence by background type; 24 job listings. Data loaded via `readFileSync` and injected into the Gemini prompt. Simple keyword matching selects relevant subsets. This gives Gemini real data to reference without hallucinating — without the complexity of embeddings.

### Key Build Iterations

Removed redundant s-gaps screen (merged into readiness). Redesigned readiness screen — from cramped 2-column layout to hero score ring + full-width radar chart + insight cards. Redesigned dashboard — from 3-column grid to streak hero + 2-column job/trend cards. Fixed North's personality (full user context + RAG company data + explicit prompt rules). Fixed response truncation (`thinkingBudget: 0` + increased `maxOutputTokens`). Fixed returning user routing (gate-complete users now route to readiness before dashboard).

### Deployment

`git push origin main` → Vercel auto-deploys in < 30 seconds. `GEMINI_API_KEY` in Vercel environment variables (never in code). Supabase anon key inlined (safe — RLS protects data). No CI/CD, no staging, no build step. For a prototype validating with 5–10 users, this is the right level of infrastructure.

---

**Live prototype:** compass-pm.vercel.app | **GitHub:** github.com/aditianapindi/compass-PM
