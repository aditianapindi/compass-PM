# Compass — Session Notes
**Last updated:** March 2026
**Prototype file:** `~/compass_prototype.html` — open directly in any browser

---

## What Compass Is

A PM career navigation platform. Tagline: **"Like Google Maps, but for your PM career."**

Target persona: **The Overwhelmed Explorer** — 1–4 months into exploring PM, passive consumption (5 newsletters, 20 YouTube videos), zero active practice, no verdict on whether PM is right for them.

Three pain points this persona has:
1. **No Fit Verdict** — don't know if PM is right for them or which PM sub-type fits
2. **No Personalised First Step** — every guide says the same thing regardless of background
3. **No Action Trigger** — nothing forces them to stop consuming and start doing

---

## Current Prototype State

**File:** `/Users/aditianapindi/compass_prototype.html`
Single HTML file. No backend. Open in browser directly.
Uses: Tailwind CSS (CDN), Google Fonts (Syne + DM Sans), vanilla JS, SVG animations.

### Screen Flow (in order)
```
Landing → Q1 → Q2 → Q3 → Q4 → Q5 → Loading → Fit Verdict
→ [Login unlock wall] → Sign In → Connect Profiles
→ Gate (first action task) → Readiness Score (spider web + breakdown)
→ Navigation Path → Dashboard
```
Side screens: Profile (`s-profile`), Interview Room (`s-interview`)

### All Screens
| Screen ID | What It Does |
|---|---|
| `s-landing` | Hero, pain points, 7-step how-it-works, footer CTA |
| `s-signin` | Sign in / create account (Google, LinkedIn, email) |
| `s-connect` | Connect LinkedIn, Teal, resume upload, GitHub, writing samples |
| `s-q1`–`s-q5` | 5 onboarding questions (background, time, blocker, target, practice) |
| `s-loading` | Spinning compass, 3 animated check items, auto-advances to verdict |
| `s-verdict` | PM Type (Growth PM), Readiness Score ring (56/100), "one thing in your way" |
| `s-gate` | First action task — 300-char minimum product teardown before path unlocks |
| `s-readiness` | Spider/radar web chart (6 dimensions) + stat cards + dimension breakdown grid |
| `s-path` | 3-phase 6-week navigation plan (Phase 1: Product Sense, 2: Analytical, 3: AI Fluency) |
| `s-dashboard` | Streak, today's task, job fit matches, hiring trend signals |
| `s-interview` | Interview Room — Riva AI avatar, round selector, live mock session |
| `s-profile` | User profile — connected accounts, PM highlights, skills, dimension scores |

---

## Key Design Decisions Made This Session

### Login Flow
- **Free:** Landing → Q1–Q5 → Loading → Fit Verdict (no login required)
- **Login wall:** Appears at the bottom of the Fit Verdict screen
- **Button text:** "Login to unlock my full path — it's free"
- **Post-login:** Connect Profiles → Gate → Readiness → Path → Dashboard
- **Rationale:** Users see the value (PM type + score) before being asked to commit

### Score Consistency
- One score throughout: **Readiness Score (56 / 100)**
- Target threshold: **75** (application-ready for Growth PM at fintech companies)
- Gap: **19 points**, achievable in **~6 weeks** of daily practice
- The old "PM Fit Score (64)" was removed — caused confusion

### Removed Redundancy
- `s-gaps` (bar chart of 6 dimensions) was **cut from the flow**
- Its content was merged into `s-readiness` as a dimension breakdown grid below the spider chart
- The spider/radar web chart is the hero visual — kept and prominent

### Evaluation Design (discussed, not yet built)
- Gate task tests **Product Sense** (300-char minimum)
- Recommended adding a second gate question: metric drop diagnosis ("DAU dropped 18% over 7 days. First question you'd ask — and why?")
- Remaining dimensions tested progressively in Weeks 1–2 of the path
- Rationale: don't front-load, preserve the "5 minute" promise

### How It Works Section
- Expanded from 5 → **7 steps**
- New steps: **Build Your Portfolio** (scored teardowns = proof of work) + **Create Connections** (cohort peers who become referrals)
- Layout: 4 items row 1, 3 items row 2 (centred) — fixed the broken wrapping

---

## AI Features Built

### North — Floating AI Assistant
- **Name:** North (True North — ties to Compass brand)
- Floating compass bubble, bottom-right corner
- Hidden on landing/signin, appears on post-onboarding screens
- Auto-pops notification badge with contextual message:
  - On verdict: "Your signal is in. Want to talk through what this verdict means for your path?"
  - On gap screen: "Two gaps flagged. Want me to explain why Analytical Depth matters more than most prep content tells you?"
  - On dashboard Day 1: "The streak starts now. Want me to walk you through today's task?"
- 5 quick-reply chips: I'm feeling stuck · How am I doing? · 🎯 Mock Interview · What to do today? · I got rejected
- Free-text input with Enter-to-send
- Pre-scripted honest responses for each chip (not cheerleader-style)

### Riva — AI Interview Avatar
- **Name:** Riva ("Ex-Razorpay Senior PM · 200+ interviews")
- Lives in the **Interview Room** tab (dashboard navbar)
- Geometric SVG illustrated face with animated breathing rings (pulsing outward)
- Status switches: green "Ready to interview you" → red pulsing "Interview in progress"
- Intro quote sets tone: *"I'm not here to make you feel good. I'm here to make you interview-ready."*
- **Round selector:** Product Sense (flagged as gap) / Metrics & Analytics (flagged as priority gap) / Behavioural
- **Company selector:** Razorpay / Meesho / Flipkart / Swiggy / CRED
- **Pressure level:** Practice (hints on) / Real pressure (no hints)
- Scores across all 6 dimensions, feeds back into Readiness Score
- Live session: running timer, Riva asks opening question, probes follow-up on your answer
- End session → assessment card with specific feedback tied to dimension gaps

---

## Design System

| Token | Value |
|---|---|
| Background | `#09090B` |
| Surface | `#18181B` |
| Elevated | `#27272A` |
| Border | `#3F3F46` |
| Text | `#FAFAFA` |
| Muted | `#A1A1AA` |
| Accent (indigo) | `#818CF8` |
| Amber | `#FBBF24` |
| Emerald | `#34D399` |
| Rose | `#F87171` |
| Orange | `#FB923C` |
| Violet | `#A78BFA` |

**Fonts:** Syne (headings, 600–800 weight) + DM Sans (body, 300–700)
**Heading letter-spacing:** h1: -0.045em · h2: -0.03em · h3: -0.02em

---

## The 6 PM Dimensions (Sample User: Arjun, Engineer at Infosys)

| Dimension | Score | Status | Note |
|---|---|---|---|
| Product Sense | 58 | Developing 🟠 | Strong on features, building on user empathy |
| Analytical Depth | 44 | Gap 🔴 | Can name metrics, not yet driving them |
| Business Framing | 53 | Developing 🟠 | Understands impact, developing commercial fluency |
| Technical Credibility | 81 | Strong 🟢 | Biggest advantage. Don't undersell it. |
| AI Fluency | 37 | Gap 🔴 | Uses AI as a user, not yet as a PM |
| Behavioural | 62 | Developing 🟠 | Good stories, need PM-framing in delivery |

---

## Open Threads / Ideas Not Yet Built

1. **Second gate question** — metric drop diagnosis alongside the product sense task
2. **AI interview simulation backend** — currently prototype only (hardcoded Riva responses). Real version needs Claude API. Text-based first (2–3 weeks), voice later.
3. **Voice input for Riva** — Web Speech API (free, Chrome/Edge). Text-in, text-out first before full voice.
4. **Score confidence indicator** — "3 of 6 dimensions measured · 3 estimated" on the readiness screen
5. **North mock interview mode** — North's "Mock Interview" chip should transition into Riva's interview room
6. **Cohort/peer group feature** — mentioned in product brief, not prototyped
7. **Alumni layer** — people who got PM roles through Compass, visible as resources
8. **Product name** — "Compass" locked. Domain not checked.
9. **Real companies to build rubrics for first** — Razorpay (published framework), Meesho, Flipkart top priority

---

## Next Steps (Recommended Order)

1. **Validate the prototype** with 5–10 real users (share the HTML file or host on Netlify for free)
2. **Connect Claude API** for the intelligence layer (gap diagnosis, gate scoring, North responses)
3. **Build in Lovable** (lovable.dev) for a shareable URL — describe screens in plain English, it generates working web app
4. **Add second gate question** (metric drop diagnosis)
5. **Technical co-founder or pre-seed raise** using prototype as proof of concept

---

## Key Research Files
- `~/pm_market_research_report.md` — 780 lines, live-verified market data
- `~/pm_discovery_report.md` — 938 lines, personas, journey maps, JTBD, TAM
- `~/pm_navigator_product_brief.md` — product decisions, MVP definition, build plan
- `~/CLAUDE.md` — project context loaded in every Claude session
