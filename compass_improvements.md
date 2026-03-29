# Compass — Post-Prototype Improvements
### UX/UI Critique + Analytics Plan
**Author:** Aditi Anapindi | **Date:** March 2026 | **Status:** Pre-validation (5–10 user test)

---

## Part 1: UX/UI Critique — What to Fix Before User Testing

### Headline Assessment

The visual system is strong (Clay-inspired dark mode, tight token system, correct progressive disclosure). The AI pipeline is real and functional. But the interaction design has gaps that will hurt conversion and trust with beachhead users. Three buckets: **false confidence signals**, **passive UX in the wrong moments**, and **mobile as an afterthought**.

---

### 1. Macro Interaction Design

#### What Works
- **Progressive commitment model is correct.** Free value before login, diagnosis before paywall. Wall positions match the user's emotional investment curve.
- **Auto-advance on single-select questions.** 350ms delay lets users see their selection register. Feels conversational, not form-like.
- **Gate task as action trigger is the strongest design decision.** Forces the Explorer out of consumption mode. This is the product thesis expressed as interaction design.
- **Loading screen checklist** (3 staggered check items) creates "work is being done" feeling before real AI calls happen.

#### What Breaks

**Login wall is too abrupt.** User goes from receiving their PM type verdict — emotionally charged — to immediately being asked to create an account. The locked score ring with "?" creates curiosity, but the transition from "here's your identity" to "now sign up" lacks a bridge. Show them the *shape* of what's behind the wall — a blurred readiness breakdown, a partial company match — something that makes the lock feel like a curtain, not a door slam.

**Paywall is positioned at peak frustration, not peak motivation.** User just learned their score is 42/100 and Product Sense is a "Gap." Worst emotional state to ask for money. The screen they're leaving is covered in red/amber badges. Fix: either show the *first day* of the path for free (they see the task, feel "I could do this"), or reframe the readiness screen ending with what they CAN do before gating the rest.

**No back navigation to readiness from dashboard.** The navbar has Path / Jobs / Interview Room / Profile — but "My Score" isn't a first-class destination. Core value prop (the score) is buried two clicks deep in Profile.

**8-question onboarding is 3 questions too long.** Q6 (networking), Q7 (practice level), Q8 (blocker) are qualitative self-reports that don't meaningfully change AI output. By Q6 users wonder "when does this end?" Q1–Q5 are tight and necessary. Q6–Q8 should be cut or deferred to post-gate.

---

### 2. Micro-Interactions

#### What Works
- **Option card hover**: Border tint + subtle background change, 0.15s transition — responsive without being jumpy.
- **Score ring count-up** (1500ms eased): Satisfying reveal moment.
- **Radar chart polygon expansion** from center: Communicates the gap visually.
- **North bubble pulse** (2s): Attracts attention without annoyance. Spring-overshoot `popIn` on panel is a nice touch.
- **Job card lift** (`translateY(-2px)`): Correct clickability affordance.

#### What Needs Work

**No haptic feedback on gate task submit.** User writes 1500 characters (most effortful thing in the product), hits submit, sees a spinner. Needs immediate visual acknowledgment — button state change, progress shimmer, "Scoring your response..." state that feels like the system *received* the work. Rotating quotes during scoring are good, but the transition *into* that state is flat.

**Textarea collapse after gate scoring is jarring.** Shrinks to 80px at 50% opacity. The user's best thinking is in that box — deemphasizing it feels dismissive. Better: keep visible but shift focus (scroll feedback card above it, or collapse into "Your response" accordion).

**Auto-advance has no recovery on mobile.** Mis-tap on mobile = wrong screen, no undo. Back arrow exists but 350ms is too fast. Fix: on mobile, switch to explicit "Next" after selection. Keep auto-advance on desktop.

**Loading screen progress is fake.** Checkmarks at 900ms, 2200ms, 3600ms are fixed intervals, not tied to real API calls. Wire to actual completion states.

**No transition for returning users.** `#returning-loader` → dashboard jump is abrupt. Add a fade.

---

### 3. UX Flow Issues

**Connect screen asks too much too early.** LinkedIn + Teal + Resume + GitHub + Writing Samples = 5 things. Resume is the only one that materially affects AI output. The rest create noise. Fix: Connect screen = just resume upload + "Skip for now." Other sources move to Profile, post-paywall.

**Locked score ring reads as "broken."** A "?" in a rotating dashed ring looks incomplete, not locked. Fix: show a blurred/pixelated score or a range ("Your score is between 35–55 — unlock to see").

**North auto-popup is interruptive.** Appears on dashboard and verdict — information-dense screens. Competes for attention. Reserve auto-popups for moments of confusion (e.g., gate task screen where users might not know what a "product teardown" is).

**No skip/defer on daily tasks.** If today's task doesn't resonate, user's choices are: do it or leave. Add "Not today — show me another" (even if it costs streak). Duolingo has this.

**Interview Room (Riva) is a dead end.** `rivaRespond()` returns hardcoded text. It's a top-level nav item — users will try it, get canned responses, and lose trust in *everything* including the AI scoring that works. Fix: hide behind a stronger gate ("Available after Week 4") or add visible "Preview — AI interview launching soon" disclaimer.

---

### 4. UI Issues

#### Typography
Strong pairing (Syne + DM Sans). Tight letter-spacing gives premium feel. **Issue:** Jump from 14px body to 28px section headers is too large. Missing a 20–22px intermediate weight in some contexts.

#### Color System
Strong. 3-layer dark surface system creates depth. Semantic colors used correctly. **Issue:** `--faint` text (`#71717A` on `#09090B`) is ~4.3:1 contrast — below WCAG AA (4.5:1 required). Bump to `#808080` or `#8A8A8A`.

#### Cards Are Overused
Pain points, steps, tasks, jobs, signals — everything is a card. When everything is a card, nothing has hierarchy. The readiness radar chart *breaking out* of a card is the best design decision on that screen. Apply elsewhere: landing pain points could be text-only with color borders (drop card background), "How it works" steps don't need card styling.

#### "How It Works" Grid
7 steps is too many. 4-col top row + 3-col centered bottom creates visual asymmetry. On mobile: `landing-steps-4` collapses to 2x2 leaving an orphan; `landing-steps-3` collapses to 1-col. Cut to 4–5 steps max.

#### Social Proof Accuracy
"Used by PMs at Razorpay, Meesho, Swiggy..." — if unverified, this destroys Truth Seeker trust. Change to "Built for PMs targeting Razorpay, Meesho..." — true and serves the same signaling purpose.

---

### 5. Mobile (Biggest Gap)

Beachhead users (Indian engineers, 2–5 years) will discover Compass on mobile — WhatsApp group links, LinkedIn mobile, Telegram. The single `@media(max-width:700px)` breakpoint that collapses grids to 1-col is the bare minimum.

**Missing:**
- **Touch target enforcement.** Back arrows, skip links, badges, nav elements are under 44px. Mis-taps will be constant.
- **Gate task textarea on mobile is hostile.** 1500 characters on a phone with soft keyboard eating half the viewport, no auto-grow. Fix: shorter char limits on mobile, or prompt "Continue on desktop."
- **Sign-in 2-column collapse.** Left brand panel pushes form below fold. On mobile, form should be first.
- **North quick-reply chips.** Wrap messily on mobile. Need `overflow-x:auto` horizontal scroll or 2-row grid.
- **No sticky submit button** on gate task for mobile. Users write, then scroll down to submit.

---

### 6. Trust & Credibility

**Scoring feels opaque.** User gets 42 but doesn't know what 42 means relative to real outcomes. "What score does a successful Razorpay PM candidate typically have?" is never answered. Add one calibration reference: "Candidates who score 65+ on Product Sense typically clear the Razorpay product round." Transforms the score from abstract to concrete.

**Confidence indicator (measured vs estimated) is buried.** If scores are estimated (no resume, no gate task), that should be the *dominant* visual signal, not a subtle badge.

---

### Priority Summary

| # | Issue | Impact | Effort |
|---|---|---|---|
| 1 | Mobile touch targets + gate task UX | 70%+ of beachhead traffic is mobile | Medium |
| 2 | Paywall positioning (show Day 1 free) | Asking for money at peak frustration kills conversion | Low |
| 3 | Cut Q6–Q8, defer to post-gate | Every extra question costs funnel conversions | Low |
| 4 | Score calibration reference | Without it, the score is a number with no meaning | Low |
| 5 | Social proof accuracy | One false claim destroys Truth Seeker trust | Trivial |

---

## Part 2: Analytics Plan

### Philosophy

At 5–10 users, analytics is not a product feature — it's an observation protocol. Instrument the funnel, log AI quality signals, read individual user journeys like case studies. Don't build dashboards. Don't use Google Analytics.

---

### Layer 1: Funnel — Where Do Users Die?

The only thing that matters before the user test.

| Event | What You're Learning |
|---|---|
| `landing_viewed` → `q1_started` | Does the landing page convert? Is the hero copy working? |
| `q1_started` → `q5_completed` | Drop-off per question — which ones feel irrelevant |
| `q5_completed` → `q8_completed` | Validates whether Q6–Q8 should be cut |
| `verdict_viewed` → `signup_clicked` | Login wall conversion — the most important number right now |
| `signup_completed` → `resume_uploaded` | Is the connect screen creating friction? |
| `resume_uploaded` → `gate_started` | Do users understand what a "gate task" is? |
| `gate_started` → `gate_submitted` | **Completion rate = product-market fit signal.** If users won't write 1500 chars, the thesis is wrong |
| `gate_submitted` → `readiness_viewed` | Did AI scoring complete without errors? |
| `readiness_viewed` → `paywall_cta_clicked` | Does the score motivate action or demoralize? |
| `paywall_cta_clicked` → `payment_completed` | WTP validation (not testable yet without Razorpay) |

**Implementation:** ~15 `fetch()` calls to a Supabase `events` table. One table, three columns: `user_id`, `event_name`, `timestamp`. Query with SQL.

---

### Layer 2: AI Quality Signals — Is the AI Actually Good?

| Metric | Why It Matters |
|---|---|
| **Gate task score distribution** | If 80% score 35–45, rubric is calibrated. If bimodal (all 20s or all 80s), AI is pattern-matching on length, not quality |
| **Readiness score distribution by background (Q1)** | Engineers should cluster differently from consultants. If everyone gets ~45 regardless of Q1, personalization isn't working |
| **Score delta after N tasks** | Do daily tasks move scores? If 10 tasks = no change, `applyDimensionDelta()` is too conservative. If everyone hits 80 after 5 tasks, too generous |
| **North conversation depth** | Average messages per session. 1.2 = ask and leave. 4+ = North provides real value |
| **North "I got rejected" frequency** | How many users trigger rejection agent? Tells you if beachhead is pre-application explorers (hypothesis) or post-rejection seekers (different product) |
| **Gate task character count vs. score correlation** | Strong positive correlation (longer = higher) means AI rewards volume, not quality. That's a rubric bug |

**Implementation:** Most data already exists in `profiles` table (gate_score, readiness_scores, task_progress). Add a `scripts/analytics.js` that queries Supabase and prints a summary to the terminal.

---

### Layer 3: Behavioral — What Do Users Actually Do?

| Signal | What It Reveals |
|---|---|
| **Time on gate task** (start → submit) | 15–25 min = thoughtful writing. 2 min = gaming/pasting |
| **Time on readiness screen** | Long dwell = score matters. Short = they don't trust it |
| **Which daily tasks get abandoned** | If `networking` tasks have 3x abandon rate vs `product-teardown`, users don't see Compass as a networking tool |
| **Task completion pattern** | Consecutive days (streak) = learning journey. Bursts = cramming before interview. Different retention strategies |
| **Job listings filter usage** | Which filter clicked first? "Your Target" vs "Best Fit" vs "All" = trust in matching signal |
| **North quick-chip usage** | Most-clicked chip reveals primary need: "I'm feeling stuck" = emotional support, "What to do today?" = navigation, "How am I doing?" = calibration |
| **Profile revisit rate** | High = score is motivating. Zero = score wasn't meaningful |

---

### Layer 4: What NOT to Build Yet

- **Cohort analysis** — no cohorts yet
- **Retention curves** — meaningless at N=10
- **A/B testing infrastructure** — need directional signal, not statistical significance
- **Dashboards** — more time building than analyzing 10 users
- **Heat maps / session recording (Hotjar/FullStory)** — useful at 100+ users, noise at 10

---

### Implementation: Events Table + Analytics Script

#### Supabase Table

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow inserts from anon/authenticated
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for service role" ON events FOR SELECT USING (true);

-- Index for fast queries
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_event ON events(event);
CREATE INDEX idx_events_created ON events(created_at);
```

#### Frontend Instrumentation (add to index.html)

```javascript
// Lightweight event tracker
function trackEvent(event, metadata = {}) {
  const userId = supabase.auth?.user?.()?.id || null;
  fetch('/api/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, event, metadata })
  }).catch(() => {}); // fire-and-forget, never block UX
}
```

#### Key Instrumentation Points

```javascript
// Funnel events — add to existing functions
// showScreen('s-q1')     → trackEvent('q1_started')
// showScreen('s-q5')     → trackEvent('q5_reached')
// showScreen('s-loading') → trackEvent('onboarding_completed')
// showScreen('s-verdict') → trackEvent('verdict_viewed')
// signup button click     → trackEvent('signup_clicked')
// after signIn success    → trackEvent('signup_completed')
// resume upload success   → trackEvent('resume_uploaded')
// showScreen('s-gate')    → trackEvent('gate_started', { mode: currentTaskMode })
// submitGate() success    → trackEvent('gate_submitted', { score, charCount, timeOnScreen })
// showScreen('s-readiness') → trackEvent('readiness_viewed')
// paywall CTA click       → trackEvent('paywall_cta_clicked')

// Behavioral events
// startDailyTask()        → trackEvent('task_started', { taskId, dimension, type })
// submitDailyTask() done  → trackEvent('task_completed', { taskId, score, delta, timeSpent })
// northAsk()              → trackEvent('north_message', { chipUsed, messageLength })
// job filter click        → trackEvent('job_filter', { filter })
// showScreen('s-profile') → trackEvent('profile_viewed')
// showScreen('s-interview') → trackEvent('interview_opened')
```

#### Analytics Script (`scripts/analytics.js`)

Run after each test session: `node scripts/analytics.js`

Output per user:
```
User: Priya (priya@example.com)
Funnel: landing → q1 → q2 → q3 → q4 → q5 → q6 [DROPPED]
Time on q6: 45s (read it, left)

User: Arjun (arjun@example.com)
Funnel: landing → q1...q8 → verdict → signup → connect → gate
Gate time: 22 min | Gate chars: 1,847 | Gate score: 58
Readiness: 47 | Readiness dwell: 3m 12s
Paywall: clicked CTA
North messages: 6 (topics: stuck, rejected, how am I doing)
Tasks completed: 3/21 | Streak: 2 days
```

---

## Part 3: Recommended Implementation Order

### Before User Test (This Week)
1. Add events table + `trackEvent()` instrumentation (2 hours)
2. Fix social proof copy: "Built for PMs targeting..." (5 minutes)
3. Add score calibration reference to readiness screen (30 minutes)
4. Add "Preview" disclaimer to Interview Room (15 minutes)

### After User Test (Based on Data)
5. Cut or defer Q6–Q8 (if funnel data confirms drop-off)
6. Reposition paywall (show Day 1 of path free)
7. Mobile touch target + gate task improvements
8. Login wall bridge (blurred readiness preview)
9. Build `scripts/analytics.js` summary tool
10. North auto-popup timing refinement

---

**Key principle:** Instrument first, redesign second. Let 10 real users tell you what's broken before you fix what you *think* is broken.
