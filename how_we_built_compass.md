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

## Deep Dive: How Resume Parsing Works

When a user drops their PDF into Compass, a two-stage pipeline kicks in — the first stage runs entirely in their browser, the second uses AI on the server.

### Stage 1: Reading the PDF (Client-Side, in the Browser)

We use an open-source library called **PDF.js** (built by Mozilla, the Firefox team). It runs directly in the user's browser — the PDF never leaves their machine at this point.

Here's what happens:
1. The user drops or selects a PDF file
2. PDF.js reads the raw file bytes
3. It extracts the text content from the **first 3 pages** (we cap it here because resumes are rarely longer, and sending more text just costs more and slows things down)
4. The extracted text is a raw string — unformatted, no structure, just all the words from the PDF in reading order

At this point, we have raw text like: `"Arjun Sharma Senior Software Engineer Infosys 2020-2024 Built internal deployment pipeline..."`

### Stage 2: Structuring with AI (Server-Side)

Raw text isn't useful. We need structured data — a name field, a role field, a list of skills. So we send the first 3,000 characters of the extracted text to our `/api/parse-resume` endpoint, which calls **Google's Gemini 2.5 Flash** model.

The prompt tells Gemini exactly what to return:

```
"You are a PM hiring expert. Analyse this resume and return ONLY a JSON object..."
```

We give it a precise schema:
- **name** — the person's full name
- **currentRole** — their most recent job title and company (e.g., "Senior Engineer at Infosys")
- **totalExperience** — years of work experience as a string (e.g., "6 years")
- **experience** — up to 5 most recent positions
- **skills** — up to 8 most relevant skills
- **pmHighlights** — exactly 4 observations about PM-relevant signals, each classified as:
  - **strength** — something that signals PM readiness (e.g., "Led cross-functional migration affecting 3 teams")
  - **warning** — something that may need reframing (e.g., "All experience is at a service company, not a product company")
  - **action** — something missing they should build (e.g., "No evidence of user research or direct customer interaction")

**Why this matters:** The highlights aren't generic career advice. They're specific to THIS resume's actual content. The AI reads the resume and picks out what a PM hiring manager would notice.

**Temperature: 0.1** — We set this very low because resume parsing needs to be deterministic. The same resume should always produce the same structured output. Higher temperature would make the AI creative, which is exactly what we don't want for data extraction.

The JSON comes back, and we immediately populate the user's profile page — name, role, experience timeline, skill tags, and the PM highlights cards with colour-coded icons.

---

## Deep Dive: How Answer Scoring Works

Compass scores user writing in three different contexts — the onboarding gate task, the readiness assessment, and daily practice tasks. Each uses the same AI model but with very different prompts and rubrics.

### Gate Task Scoring (First Impression)

When the user submits their product teardown on the gate screen, we send their text + their background (from Q1) to `/api/score-gate`.

**The prompt structure:**
1. We tell Gemini it's a "PM hiring expert"
2. We include the user's background so scoring is contextual (an engineer writing about technical feasibility is different from a consultant doing the same)
3. We provide a 4-tier rubric:
   - **80–100:** Identifies the user, the problem, AND the metric. All three present with specificity.
   - **60–79:** Has two of three clearly. One dimension is weak or generic.
   - **40–59:** Leads with a solution before diagnosing the problem. This is the most common trap for new PM thinkers.
   - **0–39:** Too generic — could apply to any product. No evidence of structured thinking.
4. We ask for structured JSON: a numeric score, a one-line headline, one strength (referencing their actual words), one gap (referencing their actual words)

**Temperature: 0.2** — Low, for scoring consistency. The same quality answer should get roughly the same score every time.

**What the AI returns:**
```json
{
  "score": 62,
  "thinkingStyle": "user-first",
  "headline": "Strong user empathy, but no metric to measure success",
  "strength": "Grounded the analysis in a specific user segment — gig workers using the app on slow connections",
  "gap": "No measurable outcome proposed — 'better experience' isn't a metric, DAU retention or task completion rate would be"
}
```

The feedback appears instantly on the screen as an inline card — no page navigation. The user sees exactly where they scored, what they did well, and what was missing.

### Readiness Scoring (6-Dimension Assessment)

This is the most complex scoring in Compass. After the gate task, we send EVERYTHING we know about the user to `/api/score-readiness`:
- Their background (Q1 answer)
- Their target company
- Their full resume data (parsed from PDF)
- Their gate task result (score, headline, strength, gap)

**What makes this scoring rigorous:**

**1. Evidence signals per dimension.** For each of the 6 dimensions, we tell the AI exactly what evidence to look for. For example, for Analytical Depth: "Does the resume show data/metrics work? Did the gate task reference a metric? SQL, analytics, A/B testing experience?" For Technical Credibility: "Engineering roles, CS degree, system design, API work."

**2. Background baselines.** We provide a table of starting score ranges. An engineer starts at 70–85 on Technical Credibility but 25–35 on Business Framing. A management consultant starts the opposite. This prevents the AI from scoring everyone the same.

| Background | Product Sense | Analytical | Business | Technical | AI Fluency | Behavioural |
|---|---|---|---|---|---|---|
| Software Engineer | 35–45 | 50–60 | 25–35 | 70–85 | 30–45 | 35–45 |
| Consultant / MBA | 40–50 | 45–55 | 55–70 | 20–35 | 20–30 | 50–65 |
| Designer / UX | 55–65 | 30–40 | 30–40 | 25–35 | 20–30 | 40–50 |
| Data Scientist | 35–45 | 65–80 | 35–45 | 50–60 | 45–60 | 30–40 |

**3. Cross-validation rules.** Dimensions are linked to prevent gaming:
- If the gate score is below 40, Product Sense cannot exceed 55 (the gate task IS a live sample of product thinking — it overrides resume claims)
- If the resume shows no quantitative results and the gate task had no metric reasoning, Analytical Depth is capped at 45
- If the resume shows only individual contributor work with no team language, Behavioural is capped at 50

**4. Calibration examples.** We give the AI three full example profiles with expected scores, so it has concrete anchors for what a "42 in Product Sense" vs a "72 in Analytical Depth" actually looks like.

**5. Scoring bands.** Explicit definitions: 0–30 = no evidence, 31–50 = early signals, 51–65 = developing, 66–80 = solid, 81–100 = exceptional (rare).

**6. Anti-inflation rules.** "Most career switchers should have 2–3 dimensions in the 30–50 range. If all 6 are above 50, you are likely inflating." This prevents the AI from being generous.

**Temperature: 0.3** — Slightly higher than gate scoring because we want the AI to exercise judgement across many signals, but still consistent enough that re-running with the same data gives similar scores.

**The overall score** uses fixed weights: Product Sense 25%, Analytical 20%, Business 15%, Technical 15%, AI Fluency 10%, Behavioural 15%. These weights reflect how PM interviews are actually structured — product sense is tested most heavily.

### Daily Task Scoring (8 Different Rubrics)

Each of the 8 task types has its own scoring rubric in `/api/score-task`. The AI doesn't use one generic rubric — it uses the right one for the task type.

Examples:

**Metric Diagnosis rubric:**
- 80–100: Structured decomposition, multiple hypotheses with data sources, prioritised by likelihood and impact
- 40–59: Lists possible causes but doesn't structure the diagnosis. No prioritisation.

**Networking rubric:**
- 80–100: Personalised to the specific person and company, references real product work, has a clear and easy-to-accept ask. Would actually get a response.
- 40–59: Template-sounding. Could be sent to anyone at any company.

**Portfolio rubric:**
- 80–100: Clear problem framing grounded in user evidence, structured reasoning, specific metrics. Demonstrates PM thinking — not just description.
- 40–59: Describes what happened but doesn't frame it as PM impact. Tells instead of shows.

After scoring, the AI also estimates **dimension impact** — how many points this practice would add to the user's score:
- Excellent response (80–100): +3 to +5 points
- Good response (60–79): +2 to +3 points
- Developing response (40–59): +1 point
- Weak response (0–39): +0 points

This creates the core feedback loop: each task you complete makes your score go up by a visible, earned amount.

---

## Deep Dive: How North Responds

North is the AI assistant — a floating chat bubble that appears on every screen after onboarding. Here's exactly what happens when a user sends a message.

### Step 1: Assemble Context

Before the message even reaches the AI, the frontend bundles everything we know about this user into a context string:

```
Name: Arjun Sharma
Background: Software / Data Engineer
Target company: Fintech and payments
Overall readiness: 56/100
Dimensions: Product Sense 58, Analytical 44, Business 53, Technical 81, AI Fluency 37, Behavioural 62
Gate task: 62/100 — "Strong user empathy, but no metric to measure success"
Resume highlights: 6 years experience, Senior Engineer at Infosys, skills: Python, SQL, React...
```

This context gets sent alongside the user's message to the API.

### Step 2: Retrieve Relevant Data (RAG)

This is where RAG happens. The user might ask: "What companies should I apply to given my scores?"

**Vector search (primary path):**
1. The user's message is converted into an **embedding** — a list of 3,072 numbers that represent its meaning — using Gemini's `gemini-embedding-001` model
2. This embedding is sent to Supabase, where it's compared against the 50 pre-stored embeddings (12 companies, 24 jobs, 8 trends, 6 transition profiles)
3. The comparison uses **cosine similarity** — a mathematical measure of how similar two embeddings are. Items with the most similar "meaning" score highest.
4. The top 5 most relevant items are returned
5. These items are injected into the AI's prompt as "Retrieved Market Intelligence"

**Keyword fallback:** If vector search is unavailable (network issue, Supabase down), we fall back to simple keyword matching — look up the user's target company by name in the JSON file and pull its data directly. Less flexible, but never breaks.

### Step 3: Generate Response

Now we have the user's message, their full context, and the 5 most relevant pieces of market data. These all go into a prompt for Gemini 2.5 Flash.

**North's personality is defined in the prompt:**
- Honest and direct. Not a cheerleader. Never says "great question!"
- Specific to this user's actual data — never generic PM advice
- Concise: 2–4 sentences max per response
- Gives signal and next action, not motivation
- References the user's actual background, scores, and gaps
- Addresses the user by first name naturally
- Uses the real company data from RAG, not generic advice

**Temperature: 0.7** — Higher than scoring because we want North to feel conversational and varied. The same question asked twice should get a slightly different but equally helpful response.

**What comes back:** A plain text response, grounded in the user's actual data and the real company information from the dataset. Plus a `ragSource` field ("vector" or "keyword") so we know which retrieval method was used.

### Special Case: "I Got Rejected"

When the user clicks the "I got rejected" chip or says something about rejection, North doesn't just chat — it triggers the **rejection agent**, a multi-step AI pipeline that makes 3 separate Gemini API calls:

1. **IDENTIFY** (Gemini call #1): Extract the company name and interview round from the message. If the user didn't name a company, return `needsInfo: true` — North will ask them before continuing.

2. **RETRIEVE** (Vector search): Search the dataset for that specific company's hiring bar, interview format, common rejection reasons, and switcher notes.

3. **DIAGNOSE + GENERATE** (Gemini call #2): A single large prompt that compares the user's scores against the company's actual hiring bar, identifies which specific gaps caused the rejection, and builds a 2-week day-by-day recovery plan with concrete daily exercises.

The result is a structured JSON object rendered as a diagnosis card in the chat — not just text, but visual score comparisons, gap indicators, and a full plan with daily tasks and time estimates.

---

## Deep Dive: The Technology Stack and Integrations

### The AI Model: Google Gemini 2.5 Flash

Every AI feature in Compass uses **Gemini 2.5 Flash**, Google's fast language model, accessed through the `generativelanguage.googleapis.com` API.

**Why Gemini 2.5 Flash:**
- Fast — responses come back in 1–3 seconds, which matters for inline scoring feedback
- Cheap — Flash pricing is a fraction of larger models, critical for a prototype handling multiple API calls per user session
- Structured output — reliable at returning valid JSON when instructed, which we need for scores, diagnoses, and plans

**Configuration that matters:**
- `thinkingBudget: 0` — This is critical. Gemini 2.5 Flash has a "thinking" mode where it uses some of its output budget to reason internally before responding. We set this to zero so ALL the output budget goes to the actual response. Without this, responses get truncated — the AI "thinks" for 400 tokens and then only has 600 tokens left for the answer.
- `temperature` varies by use case: 0.1 for resume parsing (deterministic), 0.2 for gate scoring (consistent), 0.3 for readiness scoring and task scoring, 0.7 for North chat (conversational)
- `maxOutputTokens` varies: 200 for identification (short extraction), 600–1000 for scoring and matches, 1200 for readiness (6 dimensions), 2500 for the rejection agent (full recovery plan)

### Embedding Model: Gemini Embedding-001

For RAG (finding relevant data), we use a separate model: **gemini-embedding-001**. This model doesn't generate text — it converts text into **3,072-dimensional vectors** (lists of 3,072 numbers).

Two texts with similar meaning produce similar vectors, even if they use completely different words. "Razorpay's analytical bar is very high" and "Which fintech companies need strong data skills?" would produce similar vectors, so a search for the second would find the first.

### Supabase (Database + Auth + Vector Search)

**Supabase** serves three roles:

1. **Authentication:** Google OAuth sign-in and email/password sign-in. Handles session management, token refresh, and user accounts. The frontend uses Supabase's JavaScript client library loaded from a CDN.

2. **Database:** A PostgreSQL database with a `profiles` table that stores all user data — onboarding answers (q1–q8), resume data, gate score, readiness scores, and task progress. All stored as JSONB (structured JSON inside PostgreSQL).

3. **Vector search (pgvector):** A PostgreSQL extension that stores embedding vectors and can search them by similarity. We have an `embeddings` table with 50 rows (one per company, job, trend, and transition profile). A custom function called `match_embeddings` takes a query vector and returns the most similar stored vectors using cosine distance.

### PDF.js (Resume Reading)

**PDF.js** is Mozilla's open-source PDF renderer, loaded via CDN. It runs entirely in the browser — no server involved. We use it to extract text from uploaded resumes. It handles the complexity of PDF formatting (columns, tables, headers) and gives us a plain text string.

### Vercel (Hosting + Serverless Functions)

**Vercel** hosts the frontend (the single HTML file) and runs the backend (10 serverless functions in the `api/` folder). Every git push to GitHub triggers an automatic deploy — code is live in about 30 seconds.

The serverless functions are Node.js files. Each one handles one API endpoint (e.g., `/api/parse-resume`, `/api/score-task`). They run on demand — no server to manage, no scaling to configure. Vercel also securely stores environment variables (API keys) that are never exposed in the code.

### Integration Summary

| Tool | What It Does | How It's Used |
|---|---|---|
| **Gemini 2.5 Flash** | Text generation, scoring, planning | All 10 API endpoints (resume parsing, scoring, chat, job matching, trends, rejection agent) |
| **Gemini Embedding-001** | Text → vector conversion | RAG: embedding user messages + one-time embedding of 50 market data items |
| **Supabase Auth** | User sign-in | Google OAuth + email/password, session management |
| **Supabase PostgreSQL** | Data storage | User profiles, onboarding data, scores, task progress (JSONB) |
| **Supabase pgvector** | Semantic search | 50 embedded items searched by cosine similarity for RAG |
| **PDF.js** | PDF text extraction | Client-side resume parsing (first 3 pages) |
| **Vercel** | Hosting + serverless | Auto-deploys from GitHub, runs 10 API endpoints, stores env vars |
| **Tailwind CSS** | Styling (via CDN) | Utility classes for layout, responsive design |
| **Google Fonts** | Typography | Syne (headings) + DM Sans (body text) |

---

## Deep Dive: How RAG Works in Compass

RAG stands for **Retrieval-Augmented Generation**. It's the technique that makes Compass's AI responses specific and grounded rather than generic.

### The Problem RAG Solves

Without RAG, if you ask the AI "What does Razorpay look for in PM candidates?", it would answer based on its general training data — which might be outdated, vague, or wrong. It doesn't know Razorpay's actual hiring bar, interview format, or common rejection reasons.

With RAG, before the AI answers, we first **retrieve** the actual Razorpay data from our curated dataset and include it in the question. Now the AI has real, specific facts to work with.

### Step 1: Build the Knowledge Base (One-Time Setup)

We curated a dataset of 50 items in `data/pm-market-data.json`:
- 12 company profiles (Flipkart, Razorpay, Meesho, Swiggy, etc.) with hiring bars, interview formats, salary ranges, rejection reasons
- 24 job listings with specific skill requirements per dimension
- 8 market trends with sources
- 6 transition profiles (how engineers, consultants, designers, etc. convert into PM roles)

### Step 2: Convert Everything to Vectors (One-Time Setup)

We ran a script (`scripts/embed-market-data.js`) that:
1. Reads each of the 50 items
2. Converts each one into a human-readable text description (e.g., "Razorpay is a growth-stage fintech company in Bangalore. Hiring bar: Product Sense 75, Analytical Depth 80...")
3. Sends each text to Google's `gemini-embedding-001` model
4. Gets back a list of 3,072 numbers (the "embedding") that represents the meaning of that text
5. Stores the text + its embedding in Supabase's pgvector table

This is done once. The 50 embeddings sit in the database, ready to be searched.

### Step 3: Search at Query Time (Every Chat Message)

When a user sends a message to North:

1. **Embed the question:** The user's message is sent to `gemini-embedding-001` and converted into a 3,072-number vector
2. **Search for matches:** This vector is compared against all 50 stored vectors using cosine similarity — a mathematical measure of how close two vectors are in meaning
3. **Return top 5:** The 5 items with the highest similarity score are returned. These might be company profiles, job listings, trends, or transition profiles — whatever is most relevant to the question
4. **Inject into prompt:** The text of these 5 items is added to the AI prompt as "Retrieved Market Intelligence"
5. **Generate response:** Gemini 2.5 Flash now answers the question using both the user's context AND the retrieved real data

### Why Vectors Beat Keywords

**Keyword search** only works when the user uses the exact same words as the data. If the data says "Razorpay" and the user asks about "fintech companies," keyword search finds nothing.

**Vector search** understands meaning. "Which fintech companies need strong data skills?" would match with Razorpay's profile (a fintech company with high analytical depth requirements) even though those exact words don't appear anywhere in the data. The vectors for "fintech companies with strong data requirements" and "Razorpay — Analytical Depth 80" are mathematically similar.

### The Fallback

If vector search is unavailable (network issue, Supabase down), Compass falls back to keyword matching — look up the user's target company by exact name and pull its data from the JSON file directly. It's less flexible (can't handle fuzzy or natural-language queries) but it never breaks. The user experience degrades gracefully.

### Where RAG Is Used

- **North AI chat** — every message retrieves relevant data before responding
- **Rejection agent** — searches for the specific company that rejected the user
- **Job matches** — company data is loaded for comparison against user scores
- **Trend signals** — market trends are loaded and personalised

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
