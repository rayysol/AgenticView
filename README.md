# AgenticView

**Turn any webpage into a structured API for your AI agent — without writing a scraper.**

---

## The Problem

When an AI agent needs data from a website, you have two bad options:

- **Let the AI parse the page** → expensive (burns tokens every call), inconsistent, often wrong
- **Write a custom scraper** → takes days to build, breaks every time the site updates

Neither option lets you simply say: _"I want this field, from this exact element, reliably, forever."_

## The Solution

AgenticView uses a **Human-in-the-Loop** approach:

```
1. INPUT   — Paste a URL → AI scans the page and drafts candidate fields
2. REFINE  — You click the exact elements you want to lock in
3. OUTPUT  — A live API endpoint your agent calls to get clean, typed JSON
```

```
GET /api/v1/fetch/{schema_id}?url=https://example.com/product/123

→ { "product_name": "Running Shoes Pro X", "price": 129.99, "in_stock": true }
```

No LLM parsing on every call. No fragile scraper. Just a stable endpoint.

## Why It Works

|                         | Direct AI parsing | Custom scraper | AgenticView            |
| ----------------------- | ----------------- | -------------- | ---------------------- |
| Token cost per call     | High              | None           | None                   |
| Breaks on site redesign | Sometimes         | Always         | Rarely                 |
| Setup time              | Minutes           | Days           | < 5 minutes            |
| Accuracy                | Inconsistent      | High           | High (human-confirmed) |

## MVP Features

- **URL Inspector** — load any page in a sandboxed visual viewer
- **Hover & Click to Select** — highlight and lock the exact element you want
- **AI Smart Suggest** — Claude suggests field names, data types, and related fields
- **Schema Preview** — live JSON output as you build
- **Schema Export** — download a portable JSON schema file
- **Live API Endpoint** — `GET /api/v1/fetch/{schema_id}?url=...` returns structured JSON for your agent

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend:** Next.js API Routes (BFF), Playwright, `@anthropic-ai/sdk`
- **Storage:** MongoDB Atlas + `mongoose`

## Getting Started

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/agenticview
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a URL, and start mapping.

---

> Full specification: [`spec.md`](./spec.md)
