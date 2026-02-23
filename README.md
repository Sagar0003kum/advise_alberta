# AlbertaFinder — AI-Powered Course Search

An AI-powered search engine for finding programs across all 26 Alberta post-secondary institutions. Uses **Google Gemini 2.5 Flash** with **Google Search Grounding** to retrieve real-time data directly from official institution websites.

## Features

- **AI Natural Language Search** — Type queries like "affordable nursing programs" or "tech diplomas in Calgary"
- **Real-Time Data** — Fees, program details, and availability sourced live via Google Search Grounding
- **26 Alberta Institutions** — Covers every publicly-funded post-secondary institution in Alberta
- **Source Verification** — Every result includes a direct link to the official program page
- **Smart Caching** — Repeat searches are served from a 24-hour cache to reduce API costs
- **Responsive Design** — Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- **Node.js 18+** installed ([download here](https://nodejs.org/))
- **Google Gemini API key** (FREE — no credit card needed!)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd alberta-finder
npm install
```

### 2. Get Your FREE Gemini API Key

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

That's it! No credit card, no billing setup. The free tier includes:
- **500 grounded search requests per day** (free)
- **$0.30 / 1M input tokens** | **$2.50 / 1M output tokens** (paid tier)
- 15 requests per minute

### 3. Add Your API Key

Open `.env.local` and paste your key:

```
GEMINI_API_KEY=AIzaSy-your-actual-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app!

### 5. Try a Search

Type something like:
- "Software development programs in Calgary"
- "Nursing diploma under $15,000"
- "Online business degree in Alberta"

## Project Structure

```
alberta-finder/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.js        # Backend — calls Gemini with Google Search grounding
│   ├── components/
│   │   ├── InstitutionBadge.js  # Institution grid card
│   │   ├── Navbar.js            # Top navigation bar
│   │   ├── ResultCard.js        # Search result card
│   │   ├── SkeletonCard.js      # Loading skeleton animation
│   │   └── TypingPlaceholder.js # Animated search placeholder
│   ├── lib/
│   │   └── data.js              # Shared institutions data
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.js                # Root layout + metadata
│   └── page.js                  # Home page (main app)
├── .env.local                   # API key (DO NOT COMMIT)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## How It Works

```
User types query → Frontend sends POST to /api/search
  → Backend calls Gemini 2.5 Flash API
  → Google Search Grounding enabled (searches real websites)
  → Gemini searches institution sites, extracts program data
  → Returns structured JSON (name, fees, duration, URL)
  → Frontend renders result cards with source links
```

## Deployment (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com), import your repo
3. Add environment variable: `GEMINI_API_KEY` = your key
4. Click Deploy

Live at `https://your-project.vercel.app`

## Cost Comparison: Why Gemini 2.5 Flash?

| Feature | Gemini 2.5 Flash | Claude Sonnet | OpenAI GPT-4o |
|---------|-----------------|---------------|---------------|
| **Free tier** | ✅ Yes (500 searches/day) | ❌ No | ❌ No |
| **Input tokens** | $0.30/1M | $3.00/1M | $2.50/1M |
| **Output tokens** | $2.50/1M | $15.00/1M | $10.00/1M |
| **Web search** | Free (500/day) then $35/1K | $10/1K searches | Not built-in |
| **Credit card needed** | ❌ No | ✅ Yes | ✅ Yes |
| **Cost per search** | ~FREE (free tier) | ~$0.03-0.06 | ~$0.05-0.10 |

**For your use case:** 500 free searches per day is more than enough for development and even a small production launch.

## Tech Stack

- **Next.js 14** — React framework with App Router
- **Tailwind CSS** — Utility-first styling
- **Google Gemini 2.5 Flash** — AI model
- **Google Search Grounding** — Real-time web data
- **Vercel** — Hosting & deployment

## License

MIT — use it however you want.
