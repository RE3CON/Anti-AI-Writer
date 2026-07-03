# AI Footprint Scrub & Text Humanizer 🧼✨

Welcome to the **AI Footprint Scrub**, an advanced, production-grade text humanizer, bypasser, and editor suite. This application is engineered to completely purge the predictable markers, robotic vocabulary, and uniform pacing typical of LLM-generated text (such as ChatGPT, Claude, and Gemini), restoring an authentic, high-impact human voice to your content.

---

## 🎨 Core Visual & Functional Features

### 1. 37 Deep-Dive Humanizer Personas
We have curated a library of **37 distinct professional, creative, and academic writing personas**, categorized cleanly into four main hubs:
- 💥 **Marketing & Copywriting**: Startups, sales landings, B2B SaaS pragmatists, direct response (Hook & Slide).
- 🎓 **Academic & Professional**: Surgical editors, technical documentation specialists, realist biographers, legal translators, and scientific skeptics.
- 🗣️ **Conversational & Social**: Ghostwriters, Reddit/forum natives, Quora experts, and LinkedIn thought leaders (no cringe!).
- 🎙️ **Creative & Scriptwriting**: Raw storytellers, late-night radio hosts, TED Keynote speakers, Wong Fu-style vloggers, and culinary writers.

### 2. 5 Micro-Scrub Modifiers (Overlays)
Apply individual overlay constraints on top of any persona:
- **The Vocabulary Scrub**: Instantly block the biggest AI giveaways (`delve`, `leverage`, `tapestry`, `foster`, `testament`, `pivot`, `utilize`, `holistic`, etc.).
- **The Burstiness Rhythm**: Mix extremely short, punchy sentences with longer flowing clauses to break uniform robotic cadence.
- **No Throat-Clearing**: Completely trim redundant, generic warm-ups or introductory sentences and start with the core value point.
- **The Coffee Shop Style**: Transform stuffy corporate language into a casual, authoritative voice-note tone.
- **The De-Hyping Filter**: Strip all hyperbole, cliché metaphors, and unearned motivational filler.

### 3. Real-Time Footprint Contrast Panel & Thesaurus
- **Footprint Highlights**: Displays input and output side-by-side with color-coded markers, highlighting detected AI slop words in red and showing their clean human equivalents in green.
- **Contrast Dictionary**: An interactive live table displaying the exact slop words found, their custom human synonyms, and their purge status (✨ *Cleaned!*).

### 4. Cadence & Authenticity Analytics
- **Human Authenticity Score**: A 0-100% metric calculated from the frequency of robotic giveaway words, uniform sentence loops, and active pacing.
- **Sentence Burstiness Meter**: Calculates the mathematical standard deviation of sentence lengths in real-time, showing whether the rhythm is naturally human or uniformly robotic.
- **Average Sentence Stats**: Compares structural length and sentence counts between your original draft and humanized output.

---

## ⚙️ Secure Full-Stack Architecture

- **Secure API Proxy**: Gemini API requests are streamed securely via Server-Sent Events (SSE) server-side in `server.ts` to fully shield system API keys.
- **Direct Client-Side Key Bypassing**: Includes a dedicated bottom setup drawer for adding your own local Gemini API Key (`AIzaSy...`). When active, all requests bypass the server quota entirely, fetching stream completions directly client-side for unlimited, fast execution!

---

## 🚀 Commands & Development

- `npm run dev`: Boots up the server-side compiler and frontend livereload in TypeScript environment mode.
- `npm run build`: Bundles the React application and compiles `server.ts` into a fast-loading production-ready file.
- `npm run start`: Runs the pre-compiled server in production container mode.
