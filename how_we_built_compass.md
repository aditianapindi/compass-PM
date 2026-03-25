# How We Built Compass
### A Plain-English Guide to Building the Prototype

---

## Step 1: Start With the Research, Not the Screen

Before writing a single line of code, we had three documents ready:
- A **discovery report** — who the user is, what their journey looks like, where they get stuck
- A **market research report** — what competitors exist, what's missing, how big the opportunity is
- A **product brief** — what we're building, for whom, and why now

These documents gave us a clear picture: aspiring PMs need honest diagnosis, not more content. That became the design principle for everything that followed.

---

## Step 2: Design the Flow on Paper First

We mapped out the screen-by-screen experience before building anything:

1. **Landing page** — explain what Compass does, show the pain points
2. **5 quick questions** — background, time spent, biggest blocker, target company, practice level
3. **Fit Verdict** — tell the user their PM type (e.g., "Growth PM") based on their answers
4. **Sign in** — only asked after they've seen value (their verdict)
5. **Upload resume** — so the AI can learn about their background
6. **Gate task** — a short writing exercise (product teardown) that forces action, not just consumption
7. **Readiness Score** — a radar chart showing their strengths and gaps across 6 PM skills
8. **Paywall** — free users get the diagnosis; paying users get the navigation plan
9. **Navigation Path** — a 6-week plan showing every task, grouped by phase, with progress tracking
10. **Dashboard** — daily streak, today's task, job matches, hiring trends
11. **Jobs, Interview Room, Profile** — supporting screens

The key decision: **give value before asking for anything.** Users see their PM type before signing in. They see their readiness score before hitting the paywall. This builds trust.

---

## Step 3: Pick a Visual Style

We referenced **Clay** (clay.global), a design agency known for dark, polished product interfaces. From their style, we adopted:

- **Dark background** — feels premium, reduces eye strain
- **Indigo purple as the main accent colour** — distinctive but not aggressive
- **Green, amber, and red** — for "strong," "developing," and "gap" indicators
- **Two fonts** — a bold geometric font (Syne) for headings and scores, a clean readable font (DM Sans) for body text
- **Card-based layouts** — information grouped into cards with subtle borders and elevation

This gave us a consistent look across all screens without needing a dedicated designer.

---

## Step 4: Build as a Single File

Instead of using a complex framework, we built the entire prototype as **one HTML file**. This was a deliberate choice:

- No setup time — open the file in a browser and it works
- Easy to share — one file, anyone can run it
- Fast to change — edit, save, refresh, see the result instantly
- Simple to deploy — push the file to the server and it's live

All screens live inside this one file. When a user clicks a button, we hide the current screen and show the next one. The styling, the layout, the logic — all in one place.

---

## Step 5: Add Sign-In

We used **Supabase**, a free service that handles user accounts. It gave us:

- "Sign in with Google" — one click, no password needed
- Email and password sign-in as a backup
- User names and emails stored securely

When someone signs in with Google, we pull their name from their Google account and use it throughout the app — in the greeting, the profile page, and when North (the AI assistant) addresses them.

---

## Step 6: Add Resume Parsing

When a user uploads their resume (a PDF), two things happen:

1. **The browser reads the PDF** — we use a library called PDF.js that extracts the text from the first 3 pages, right in the user's browser. Nothing gets uploaded to a server at this point.
2. **The text gets sent to an AI (Gemini)** — we send the extracted text to Google's Gemini AI and ask it to pull out structured information: name, current role, years of experience, skills, and anything that signals PM potential.

The AI returns this as organised data, which we use to fill in the user's profile page — their name, role, skills, and "PM highlights" (things in their background that are strengths, warnings, or action items for a PM career).

---

## Step 7: Build the Curated Knowledge Base (Our RAG Dataset)

Before the AI can give personalised, company-specific advice, it needs real data to draw from — not just its general training knowledge. We built a curated dataset file containing:

- **12 Indian tech companies** (Flipkart, Razorpay, Meesho, Swiggy, CRED, Zepto, PhonePe, Groww, Freshworks, Zomato, Darwinbox, Lenskart) — each with hiring bars across all 6 PM dimensions, interview formats, salary ranges, common rejection reasons, recent hiring signals, and whether they're friendly to career switchers
- **24 job listings** — real PM roles at these companies with specific skill requirements per dimension
- **8 market trends** — things like "AI PM roles surging" and "quick commerce creating new PM category," each with sources
- **Transition intelligence** — how different backgrounds (engineers, consultants, designers, MBAs) convert into PM roles, including conversion rates and best-fit companies

This dataset is the foundation for everything that follows. Every AI feature in Compass pulls from this real data instead of making things up. This approach is called **RAG — Retrieval-Augmented Generation**. The idea is simple: before asking the AI to answer a question, we first retrieve the relevant real data and include it in the question, so the AI's answer is grounded in facts rather than guesses.

---

## Step 8: Add the Gate Task and AI Scoring

The gate task is a 1500-character product teardown. The user picks apart a real product and writes what they'd change and why. When they submit:

1. Their text + their background get sent to Gemini
2. Gemini scores it against a detailed rubric we defined:
   - **80–100:** Identifies the user, the problem, AND the metric that would move
   - **60–79:** Has two of the three, but one dimension is weak
   - **40–59:** Leads with a solution without grounding it in a user problem
   - **0–39:** Too generic — could apply to any product
3. The response comes back with a score, a one-line headline, one strength, and one gap
4. The feedback appears right on the screen — no page navigation, instant result

We set the AI's temperature low (0.2) so that similar-quality responses get similar scores every time. This consistency is critical — if the same answer got 52 one time and 68 the next, users wouldn't trust the score.

---

## Step 9: Add the Readiness Score (AI Scoring With Evidence Rules)

After the gate task, we send everything we know about the user — their background, target company, resume data, and gate score — to another AI endpoint. This one scores them across 6 PM dimensions: Product Sense, Analytical Depth, Business Framing, Technical Credibility, AI Fluency, and Behavioural.

To make the scoring rigorous, we gave the AI detailed instructions:

**Evidence signals for each dimension** — we told the AI exactly what to look for. For example, for Analytical Depth: "Does the resume show data/metrics work? Did the gate task reference a metric? Any SQL, analytics, A/B testing experience?" For Technical Credibility: "Engineering roles, CS degree, system design, API work."

**Background-type baselines** — a table of starting score ranges by background. An engineer starts at 70–85 on Technical Credibility but 25–35 on Business Framing. A consultant starts the reverse. The AI adjusts up or down based on actual resume evidence.

**Cross-validation rules** — dimensions are linked. If the gate score is below 40, Product Sense can't exceed 55 (the gate task is a live sample of product thinking). If the resume shows only individual contributor work with no team language, Behavioural is capped at 50.

**Calibration examples** — we gave the AI three example profiles with expected scores, so it knows what a "42 in Product Sense" actually looks like.

**Explicit weighting** — the overall score uses fixed weights: Product Sense 25%, Analytical 20%, Business 15%, Technical 15%, AI Fluency 10%, Behavioural 15%.

Each dimension gets a score (0–100) and a status (Gap, Developing, Solid, or Strong). These scores power the animated radar chart and the score ring on the readiness screen.

---

## Step 10: Add North, the AI Assistant — With Vector Search (RAG)

North is a floating chat bubble that appears on every screen after onboarding. When the user sends a message, we need to find the most relevant information from our dataset to include in the AI's context. We built two approaches:

### Approach 1: Keyword Matching (Original)
When the user has a target company, we look up that exact company name in our dataset and pull its hiring bar, interview format, and rejection reasons. This works when we know exactly which company to look for.

**The problem:** If the user asks "Which companies are good for someone strong on analytics?" — there's no company name to match. The keyword approach finds nothing.

### Approach 2: Vector Search (Upgrade)
We converted every company profile, job listing, trend, and transition profile in our dataset into **embeddings** — lists of numbers that capture the meaning of the text, not just the exact words. These embeddings are stored in Supabase using an extension called pgvector.

When a user sends a message to North, we:
1. Convert their message into an embedding (using Google's Gemini embedding model)
2. Search our database for the 5 items whose embeddings are most similar to the message
3. Include those 5 items in the prompt we send to Gemini
4. Gemini responds using that real data

This is RAG in action: **Retrieve** the relevant data → **Augment** the prompt with it → **Generate** a grounded response.

**Why this matters:** The user can ask anything in natural language — "Where should I apply if I'm strong technically but weak on business?" — and North finds the right companies, even though those exact words don't appear anywhere in the dataset. The system understands meaning, not just keywords.

**How embedding works, simply:** Every piece of text gets turned into a list of numbers (an embedding) that represents what it means. Two texts that mean similar things end up with similar numbers — even if they use completely different words. When a user asks a question, we convert it to numbers and find the stored items with the closest numbers. That's the "retrieval" step.

**Fallback:** If vector search is unavailable, North falls back to keyword matching automatically. The user experience doesn't break — it's just less flexible.

We embedded 50 items total: 12 companies, 24 job listings, 8 trends, and 6 transition profiles. The embedding is done once and stored. At query time, only the user's message needs to be embedded — one quick call per chat message.

---

## Step 11: Add Job Matching and Hiring Trends (RAG)

When the user opens the dashboard, two things happen in parallel — both using our curated dataset:

**Job matches:** We load the relevant companies from our dataset and send them to the AI along with the user's readiness scores. The AI compares the user's scores against each company's actual hiring bar and generates 4 personalised matches. It follows specific rules we defined: if the user's score is below a company's bar on 2 or more important dimensions, the fit stays under 65%. It also uses the transition intelligence — if an engineer is targeting a company that historically hires engineers well, the fit gets a 5–10% boost.

**Trend signals:** We load the market trends and the target company's recent signals from the dataset. The AI personalises them — connecting the user's specific gaps to specific market movements. Not "AI is growing" but "Freshworks is hiring AI PMs and your AI Fluency at 37 is a gap — this is both an opportunity and a risk for you."

**Job listings (pure math, no AI):** The full Jobs screen shows 24 listings. For each, we calculate fit using simple math: divide the user's score by the required score for each dimension, cap at 100%, average them. This is fast — no AI call needed.

---

## Step 12: Add the Daily Task System and Score Improvement

After the paywall, the user enters their 6-week navigation path. We built a **daily task system** with 21 tasks across 8 different types:

| Task Type | What It Tests | Example |
|---|---|---|
| Product Teardown | Product Sense | "Pick a feature in Razorpay. Who is it for? What would you change?" |
| Metric Diagnosis | Analytical Depth | "Daily active users dropped 12%. Walk through your diagnosis." |
| Business Case | Business Framing | "Should Razorpay enter a new market? Go or no-go?" |
| AI Feature Design | AI Fluency | "Design an AI-native capability for Razorpay. Not a wrapper." |
| Technical Tradeoff | Technical Credibility | "Build in-house vs third-party API. What are the tradeoffs?" |
| Stakeholder Conflict | Behavioural | "Your engineering lead disagrees with your prioritisation. Respond." |
| Networking | Behavioural | "Write a personalised LinkedIn message to a PM at your target company." |
| Portfolio | Product Sense / Business | "Write a 1-page case study of a feature you'd redesign." |

Each task is personalised — the company name comes from the user's target, and the task selected each day targets their weakest dimension.

**How task selection works:** We look at the user's readiness scores, find the 2–3 weakest dimensions, and pick the next uncompleted task that targets those dimensions. As they complete tasks and their weak dimensions improve, the system moves to the next weakest area.

**How task scoring works:** Each task type has its own scoring rubric. For a metric diagnosis, an 80–100 means "structured decomposition with multiple hypotheses and data sources." For a stakeholder conflict, an 80–100 means "acknowledges the other perspective, provides data-backed reasoning, proposes a resolution." The AI scores the response and estimates how many points it would add to the relevant dimension (+1 to +5 depending on quality).

**Score improvement:** When a task is completed, the user's dimension score updates immediately. They can see their readiness score climbing as they practice. This creates the core feedback loop: diagnose your gaps → practice specific tasks → watch your scores improve → know when you're ready.

**Progress tracking:** The path screen shows all tasks grouped into 3 phases, with progress bars, checkmarks on completed tasks, and the score each task earned. The dashboard shows a streak calendar and the next task to tackle.

---

## Step 13: Add the Post-Rejection Agent (Agentic AI)

This is where the AI goes beyond answering questions and starts taking multiple steps on its own. When a user tells North "I got rejected," it triggers a multi-step agent:

**Step 1 — Ask:** If the user didn't mention which company rejected them, North asks before proceeding. No assumptions.

**Step 2 — Identify:** The AI extracts the company name and interview round from the user's message.

**Step 3 — Retrieve:** The agent searches our dataset (using vector search) for that company's hiring bar, interview format, and common rejection reasons.

**Step 4 — Diagnose:** It compares the user's readiness scores against the company's bar. If the user has 44 in Analytical Depth and Razorpay's bar is 80, that's the root cause.

**Step 5 — Generate:** It builds a 2-week, day-by-day recovery plan targeting the specific gaps that caused the rejection. Each day has a concrete exercise with a deliverable.

The result appears as a structured card in North's chat — not just text, but a visual diagnosis with the user's score versus the company's bar, progress bars, and a full plan.

**Why this is "agentic":** A normal chatbot takes one question and gives one answer. This agent takes a single input ("I got rejected") and autonomously decides to ask for more info, look up real data, compare scores, diagnose the cause, and generate a plan. One input → multiple steps → structured output.

---

## Step 14: Deploy and Iterate

**Deployment** is simple: we push the code to GitHub, and Vercel (our hosting service) automatically makes it live within 30 seconds. All API keys are stored securely in Vercel's environment variables, never in the code.

**Key iterations we made:**

- **Readiness screen** — the original layout was cramped. We redesigned it with a large animated score ring and a full-width radar chart.
- **Dashboard** — the original 3-column layout made everything compete for attention. We redesigned it so the streak and daily task are the hero.
- **North's intelligence** — early responses were generic. We fixed this by adding vector search (RAG), so North retrieves relevant data before responding.
- **Readiness scoring** — the original prompt was vague. We added per-dimension evidence signals, background baselines, cross-validation rules, and calibration examples.
- **Daily tasks** — originally all tasks redirected to the same gate question. We built a full task system with 6 different task types and per-type scoring rubrics.
- **Rejection agent** — the "I got rejected" button originally just gave a generic reply. We replaced it with a multi-step agentic flow that diagnoses and plans.

---

## Understanding the Flows

This section explains the key user flows in Compass — how screens connect, when AI is called, and how data moves through the system. Useful for anyone navigating the codebase or extending the prototype.

### Flow 1: First-Time User (Landing to Dashboard)

```
Landing Page → Q1–Q8 (onboarding questions, auto-advance) → Loading Screen → Fit Verdict
→ Sign In (login wall) → Connect Profiles (resume upload) → Gate Task → Readiness Score
→ Paywall → Dashboard
```

**What happens at each step:**

1. **Landing → Q1–Q8:** No login required. User answers 8 questions about their background, experience signals, skills, target company, networking level, practice habits, and biggest blocker. Each question auto-advances on selection — no "Next" button.
2. **Loading screen:** Shows a spinning compass with motivational quotes while the system processes. Auto-advances to Verdict after a timed animation.
3. **Fit Verdict:** Shows the user's PM type (e.g., "Growth PM") based on their Q1 answer. Score ring is locked — shows `?` until they complete the gate task and upload a resume. A login wall sits at the bottom: "Login to unlock my full path — it's free."
4. **Sign In:** Google OAuth (one click) or email/password. If a user tries to create an account with an existing email, the UI auto-switches to sign-in mode. After sign-in, returning users are routed to their last screen (dashboard if they've been through readiness, gate if they uploaded a resume, etc.).
5. **Connect Profiles:** Upload resume (PDF parsed by AI), connect LinkedIn/Teal/GitHub. Resume parsing extracts name, role, experience, skills, and PM-relevant highlights.
6. **Gate Task:** A product teardown writing exercise (up to 1500 characters). AI scores it 0–100 against a rubric and shows inline feedback: score, headline, strength, gap.
7. **Readiness Score:** AI scores the user across 6 PM dimensions using resume + gate score + background. Animated radar chart and score ring. Each dimension gets a status: Gap, Developing, Solid, or Strong.
8. **Paywall:** Monthly (₹999/mo) or Annual (₹7,999/yr). Free = diagnosis. Paid = navigation.
9. **Dashboard:** The main screen after onboarding. Shows progress (tasks completed, streak grid), today's task, full task list grouped by dimension, and job fit matches.

### Flow 2: Returning User (Sign In to Dashboard)

```
Sign In → (profile loaded from Supabase) → Routed to correct screen
```

When a returning user signs in (Google or email), the system loads their saved profile from Supabase and routes them to the right screen based on progress:

| What's saved | Where they land |
|---|---|
| Readiness scores exist | Dashboard |
| Gate score exists | Readiness Score screen |
| Resume data exists | Gate Task screen |
| Only Q1–Q8 answers | Connect Profiles screen |
| Nothing | Connect Profiles screen |

This logic lives in `getReturningScreen(profile)`. Google OAuth users go through a page reload, so the `onAuthStateChange` handler picks them up and routes them.

### Flow 3: Daily Practice (Dashboard to Task to Score Update)

```
Dashboard → Click task (or "Start Task") → Gate screen (daily mode) → Submit
→ AI scores response → Dimension score updates → Next Task or Back to Dashboard
```

1. **Task selection:** The system picks the next uncompleted task targeting the user's 2–3 weakest dimensions. Users can also click any task from the list.
2. **Gate screen (daily mode):** Same screen as onboarding gate, but in daily mode it shows the selected task's prompt and character limit.
3. **Submit:** Response is sent to `/api/score-task` with the task type, prompt, dimension, and user context. The AI scores it against a type-specific rubric.
4. **Feedback:** Score, strength, gap, and dimension impact (+0 to +5 points) shown inline.
5. **Score update:** The relevant dimension score updates immediately. The overall readiness score recalculates with weights. Progress saves to both localStorage (instant) and Supabase (async).
6. **After completion:** "Next Task →" button to continue, or "Back to Path" to return to dashboard.

### Flow 4: North AI Chat (Any Screen)

```
Click North bubble → Chat opens → Type message or pick quick chip
→ Message + user context sent to API → RAG retrieval → AI response
```

North is a floating chat bubble visible on all post-onboarding screens. The flow:

1. **User sends message** (typed or via quick chips: "I'm feeling stuck", "How am I doing?", "Mock Interview", "What to do today?", "I got rejected")
2. **Context assembly:** User's name, background, target company, readiness scores, gate score, and resume highlights are bundled into context
3. **RAG retrieval:** The message is embedded via Gemini and searched against the vector database (50 items: companies, jobs, trends, profiles). Top 5 results injected into the prompt.
4. **AI response:** Gemini generates a grounded, personalised response using the retrieved data + user context
5. **Special case — "I got rejected":** Triggers the rejection agent (see Flow 5)

### Flow 5: Post-Rejection Remediation (North Chat)

```
"I got rejected" → Agent asks for company (if unknown) → Vector search for company data
→ Compare user scores vs hiring bar → Generate 2-week recovery plan
```

This is a multi-step agentic flow:

1. **IDENTIFY:** Extract company and interview round from the user's message. If the company isn't mentioned, North asks before proceeding.
2. **RETRIEVE:** Vector search for the company's hiring bar, interview format, and common rejection reasons from the RAG dataset.
3. **DIAGNOSE:** Compare the user's dimension scores against the company's required scores. Identify the root cause gap(s).
4. **GENERATE:** Build a 2-week, day-by-day recovery plan targeting the specific gaps. Each day has a concrete exercise.
5. **Render:** The result appears as a structured diagnosis card in the chat with score vs. bar comparisons, progress bars, and the full recovery plan.

### Flow 6: Job Matching (Dashboard + Jobs Screen)

**Dashboard (AI matches):**
```
Dashboard loads → User scores + company data sent to Gemini → 4 personalised matches returned
```

If the API call is slow (>12 seconds) or fails, static fallback matches are shown based on the user's target company.

**Jobs screen (math-based):**
```
Jobs screen loads → For each of 24 listings: fit = avg(user score / required score per dimension)
```

No AI call — pure math. Also loads personalised trend signals connecting the user's gaps to market movements.

### Flow 7: Authentication Details

The auth system has two paths that work together:

**Interactive sign-in/sign-up:** When the user clicks a button on the sign-in screen, the handler navigates directly with `showScreen()` and loads the profile in the background. This is the primary path.

**OAuth redirect (Google):** The page reloads after Google auth. `onAuthStateChange` fires, detects the session, loads the profile, and navigates. The `onScreenReady(id)` function ensures screen-specific renderers (like dashboard task list) fire correctly even when there's no previous active screen.

**Smart sign-in:** If a user clicks "Create Account" with an email that already exists, the button automatically switches to "Sign in →" mode. The password field clears and focuses. Changing the email resets it back.

**Log out:** Available on the Profile screen. Clears all local state (userData, localStorage) and signs out of Supabase, returning to the landing page.

### Key Data Flow Summary

```
Resume PDF → PDF.js (browser) → /api/parse-resume (Gemini) → userData.resumeData → Profile screen
Q1–Q8 answers → userData.q1–q8 → personalize() → All screens
Gate task text → /api/score-gate (Gemini) → userData.gateScore → Verdict/Readiness
All user data → /api/score-readiness (Gemini) → userData.readinessScores → Radar chart
Daily task text → /api/score-task (Gemini) → dimension delta → Score update → Dashboard
Chat message → /api/north-chat (embed + vector search + Gemini) → Chat response
"I got rejected" → /api/rejection-agent (3 Gemini calls) → Diagnosis card
User scores → /api/job-matches (Gemini) → Dashboard matches
User scores → /api/job-listings (math) → Jobs screen
User gaps → /api/job-trends (Gemini) → Trend signals
```

All data is persisted to Supabase (profiles table) with localStorage as a backup for task progress and readiness scores.

---

## What It Took

- **1 HTML file** for the entire prototype
- **10 API endpoints** (resume parsing, gate scoring, readiness scoring, task scoring, North chat, job matches, job listings, trend signals, semantic search, rejection agent)
- **1 curated dataset** with 50 embedded items (12 companies, 24 job listings, 8 market trends, 6 transition profiles)
- **Vector search (pgvector)** in Supabase for semantic RAG retrieval
- **21 daily tasks** across 8 task types with per-type AI scoring rubrics
- **1 agentic flow** (post-rejection remediation: 5-step autonomous chain)
- **1 auth provider** (Supabase — Google sign-in + email)
- **1 hosting platform** (Vercel — auto-deploys from GitHub)
- **0 designers** — visual direction from Clay's portfolio, implemented directly in code

The prototype is live at **compass-pm.vercel.app** and handles the full flow from landing page to personalised daily practice with score improvement.
