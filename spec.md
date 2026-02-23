# AgenticView — System Specification

| Property | Value             |
| -------- | ----------------- |
| Version  | 1.0               |
| Date     | 2026-02-24        |
| Track    | Agent-Ready Web   |
| Status   | Draft — 3-day MVP |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Target Users](#2-target-users)
3. [Problem Analysis](#3-problem-analysis)
4. [MVP Scope](#4-mvp-scope)
5. [Use Cases](#5-use-cases)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [System Architecture](#8-system-architecture)
9. [Data Storage Design](#9-data-storage-design)
10. [API Specification](#10-api-specification)
11. [Error Handling](#11-error-handling)
12. [Tech Stack](#12-tech-stack)
13. [3-Day Roadmap](#13-3-day-roadmap)

---

## 1. Overview

### 1.1 Product Description

AgenticView is a tool that enables **creating APIs for AI to extract information from any webpage accurately and reliably**, through a Human-in-the-Loop process: AI automatically scans and proposes candidate fields first, then the human confirms exactly which elements they want, and the system generates a stable API endpoint for the agent to call going forward.

### 1.2 Problem Statement

When an AI Agent needs to extract information from a webpage, there are currently two common approaches — and both have clear limitations:

| Approach              | How it works                                                                                  | Limitations                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Direct AI parsing** | Agent uses an LLM to read the full HTML/page content and infer the data it needs              | Consumes tokens on every call, inconsistent results, error-prone with complex layouts |
| **Custom scraper**    | Developer writes hardcoded Playwright/Puppeteer code tied to a specific site's HTML structure | Time-consuming to write, breaks whenever the site's UI changes, hard to scale         |

**Root cause:** There is no way for users to specify _exactly_ which elements on a page they want, and turn that into a cheap, fast, long-lived API.

### 1.3 Solution — Human-in-the-Loop Workflow

AgenticView solves this by breaking the process into three clear steps:

| Step       | Who acts | Description                                                                                                             |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Input**  | AI       | User pastes a URL → AI scans the page and drafts candidate data fields                                                  |
| **Refine** | Human    | User looks at the real page, clicks to **"lock"** the exact elements they want — AI adjusts its suggestions accordingly |
| **Output** | System   | Generates a stable, fast, low-cost API endpoint for the agent to call                                                   |

**Why this is better:**

- vs. _direct AI parsing_: Agent no longer needs an LLM on every call → **faster, cheaper, consistent**.
- vs. _custom scraper_: No code to write → **quick setup, no developer required**.
- The Human-in-the-Loop step guarantees **the exact elements the user actually wants**, not what the AI guesses.

---

## 2. Target Users

| Group                         | Description                                                  | Primary Need                                                    |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| **Developer / Indie Builder** | Building AI Agents that need data from multiple websites     | Avoid writing and maintaining a separate scraper for each site  |
| **Product / Business Team**   | Needs to track prices, markets, and competitors via agent    | Reliable data without having to maintain backend infrastructure |
| **Website Owner**             | Wants their site to be discoverable and accessible by agents | A simple way to make their website "agent-friendly"             |

---

## 3. Problem Analysis

### 3.1 Current Approaches and Their Limitations

**Approach 1: AI Agent reads and parses the entire page**

The agent uses an LLM to read the HTML or page content and infers what data to extract, with no guidance from the user.

| Symptom                                            | Root cause                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Inconsistent results across calls                  | AI "guesses" elements by semantics — no fixed selector           |
| Token cost on every extraction                     | LLM must re-read and re-analyze the full HTML each time          |
| Wrong results when multiple similar elements exist | No way to specify "this one, not that one"                       |
| No control over accuracy                           | User cannot tell whether the agent is extracting the right field |

**Approach 2: Writing a custom scraper**

Developer writes Playwright / Puppeteer / BeautifulSoup code hardcoded to the site's HTML structure.

| Symptom                                  | Root cause                                                          |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Scraper breaks after every site redesign | Selectors are hardcoded, cannot self-adapt                          |
| 1–3 days of dev time per new website     | Must read the DOM, write selectors, and test manually for each site |
| Hard to scale beyond 10+ websites        | Each site needs separate code and separate maintenance              |
| $100–500/month maintenance cost          | Constant bugs every time the site changes its UI                    |

### 3.2 Conclusion

> Both approaches share the same root cause: **there is no mechanism for users to specify exactly which elements they want**, once, and reuse that indefinitely at near-zero cost. AgenticView fills this gap with a Human-in-the-Loop workflow: AI proposes first, the user confirms and locks the selector, and the system creates a stable API from that point forward.

---

## 4. MVP Scope

### 4.1 In Scope (3 days)

| Feature                 | Description                                                                                | Priority |
| ----------------------- | ------------------------------------------------------------------------------------------ | -------- |
| URL Inspector           | Enter URL → display website in sandboxed proxy view                                        | P0       |
| Element Hover Highlight | Hover over page elements → real-time visual highlight                                      | P0       |
| Click to Select         | Click element → assign a field name                                                        | P0       |
| CSS Selector Generation | Auto-generate optimal CSS selector for the selected element                                | P0       |
| Schema Preview          | Real-time JSON preview panel alongside the inspector                                       | P0       |
| AI Smart Suggest        | On field selection, AI suggests name, data type, and related fields                        | P0       |
| Schema Export           | Export schema as a JSON file                                                               | P0       |
| Live API Endpoint       | `GET /api/v1/fetch/{schema_id}?url=...` → returns structured JSON for the agent to consume | P0       |

### 4.2 Out of Scope (post-MVP)

| Feature                            | Reason cut                                  |
| ---------------------------------- | ------------------------------------------- |
| User authentication / accounts     | Using localStorage instead                  |
| Schema library / template matching | Not enough time                             |
| Scheduled refresh / monitoring     | Requires more complex infrastructure        |
| Payment / subscription             | Not needed in MVP                           |
| MCP tool generation                | Out of scope                                |
| Authentication-gated page support  | Requires an auth layer                      |
| Automatic self-healing             | Manual trigger only if time allows on day 3 |
| Automatic pattern recognition      | User enters patterns manually if needed     |
| Recovery Dashboard                 | Depends on self-healing                     |
| Automatic multi-element detection  | Not enough time                             |
| Database (Supabase)                | Using localStorage instead                  |

---

## 5. Use Cases

### UC-01: Create a Schema from a Website

**Actor:** User

**Description:** User pastes a URL → AI scans and drafts candidate fields → User views the real page and clicks to lock the exact elements they want → System produces an accurate JSON schema.

**Preconditions:**

- URL is valid and accessible.
- Website does not block iframe embedding.

**Main Flow:**

**Step 1 — Input (AI):**

1. User pastes a URL into AgenticView.
2. System loads the page via proxy in a sandboxed inspector view.
3. AI scans the DOM, identifies elements likely to contain data (price, name, date, quantity, etc.) and displays a draft list of suggested fields in the side panel.

**Step 2 — Refine (Human):** 4. User looks at the real page and hovers to see elements highlighted. 5. If AI suggestion is correct → User confirms that field. 6. If AI suggestion is wrong or missing → User clicks directly on the correct element on the page to "lock" its selector. 7. AI refines its suggestion: field name (snake_case), data type, and related fields. 8. Schema Preview updates in real-time as the user confirms or locks each field.

**Step 3 — Output (System):** 9. User clicks "Save Schema" → System saves the schema with the precisely locked CSS selectors.

**Result:**

- Schema saved with user-confirmed CSS selectors.
- JSON preview shown in real-time:

```json
{
  "product_name": "Running Shoes Pro X",
  "price": 129.99
}
```

---

### UC-02: Export Schema as JSON File

**Actor:** User

**Description:** After creating a schema, user exports it as a JSON file for later reuse or sharing.

**Preconditions:**

- Schema has been successfully created with at least 1 field.

**Main Flow:**

1. User clicks "Export Schema".
2. System validates the schema.
3. System generates the JSON file and triggers a download.

**Result:**

- JSON file downloaded to the user's machine, ready to import back into AgenticView or use with a code snippet (Playwright / Python).

---

### UC-03: Agent Calls Live API Endpoint

**Actor:** AI Agent

**Description:** After the user saves a schema, the agent calls the live API endpoint with a target URL and receives clean, typed JSON — no LLM parsing, no scraper code required.

**Preconditions:**

- Schema has been saved with at least 1 locked CSS selector.

**Main Flow:**

1. Agent sends a request to the live endpoint with the target URL:
   ```
   GET /api/v1/fetch/{schema_id}?url=https://example.com/product/123
   ```
2. System fetches the target page via Playwright.
3. System applies the locked CSS selectors from the schema to extract field values.
4. System casts values to the declared data types (string, number, currency, boolean, date).
5. System returns a clean JSON response.

**Result:**

```json
{
  "schema_id": "schema_abc123",
  "url": "https://example.com/product/123",
  "extracted_at": "2026-02-24T10:35:00Z",
  "data": {
    "product_name": "Running Shoes Pro X",
    "price": 129.99,
    "in_stock": true
  }
}
```

---

## 6. Functional Requirements

### FR-01: Visual Studio — Display Website in iframe

- The system must allow users to enter a URL and display the website in an iframe with overlay.
- The system must inject a script to highlight elements on hover.
- The system must bypass same-origin policy via a proxy server.

### FR-02: Click-to-Select — Define Fields by Clicking

- The system must allow users to click an element to select it.
- The system must auto-generate a CSS selector from the selected element.
- The system must allow users to assign a field name to the selected element.
- The system must display a real-time Schema Preview JSON panel.

### FR-03: AI Smart Suggest — Intelligent Suggestions on Field Selection

- The system must call the Claude API when a user clicks an element.
- The system must suggest a field name (snake_case) based on DOM context.
- The system must detect the data type: `string`, `number`, `currency`, `date`, `boolean`.
- The system must suggest up to 3 related fields the user might also want to extract.
- The system must match against a schema template if applicable (e-commerce, article, etc.).

### FR-04: Schema Export — Export Schema as JSON File

- The system must allow exporting the schema as a JSON file.
- The system must include a code snippet (Playwright / Python) alongside the export.
- The system must validate the schema before exporting.

### FR-05: Live API Endpoint — Serve Extracted Data to Agent

- The system must expose `GET /api/v1/fetch/{schema_id}?url={target_url}` as a callable endpoint.
- The system must fetch the target page via Playwright using the stored CSS selectors.
- The system must cast each extracted value to its declared data type.
- The system must return a JSON response containing the extracted data and metadata (`schema_id`, `url`, `extracted_at`).

---

## 7. Non-Functional Requirements

### NFR-01: Performance

- Hover highlight must be smooth — target 60fps.
- Schema Preview must update in real-time without lag.
- API response time < 3 seconds.

### NFR-02: Reliability

- The system must work correctly on at least 3 real websites (e-commerce, news, crypto).
- API endpoint uptime > 95%.

### NFR-03: Cost Efficiency

- Near-zero operating cost per schema extraction.
- No AI token cost per API call — uses CSS selector instead of AI parsing.

### NFR-04: Usability

- User can create a schema in under 5 minutes.
- The Visual Studio must be intuitive with no documentation required.

### NFR-05: Security

- Proxy server must handle CORS and CSP headers correctly.
- No sensitive user information stored.

---

## 8. System Architecture

### 8.1 High-level Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Frontend       │────▶│   Backend API        │────▶│  Proxy Engine   │
│   (Next.js)      │     │   (Next.js API)      │     │  (Node.js)      │
│                  │◀────│                      │◀────│                 │
│  Visual Selector │     └──────────┬───────────┘     └─────────────────┘
│  Schema Preview  │                │
│  Export Panel    │                ▼
└──────────────────┘     ┌──────────────────────┐
                         │   localStorage       │
                         │   (Schema Storage)   │
                         └──────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │   Claude API         │
                         │   (AI Smart Suggest) │
                         └──────────────────────┘
```

### 8.2 Data Flow

The schema creation flow is divided into 3 phases following the Human-in-the-Loop process:

```
━━━━━━━━━━━━━━━━━━ PHASE 1: INPUT (AI) ━━━━━━━━━━━━━━━━━━

1. User pastes URL into AgenticView
       ↓
2. Backend fetches HTML via Proxy Engine
   (Strip CSP/X-Frame-Options, rewrite relative URLs, inject selector.js)
       ↓
3. Frontend renders real page inside iframe with overlay
       ↓
4. AI scans DOM → identifies candidate elements
   → Displays draft field suggestions in side panel

━━━━━━━━━━━━━━━━━━ PHASE 2: REFINE (Human) ━━━━━━━━━━━━━━

5. User views real page, hovers → element highlights in real-time
       ↓
6a. If AI suggestion is correct → User clicks Confirm on that field
       ↓
6b. If AI suggestion is wrong/missing → User clicks directly on element
    → Frontend captures the exact CSS selector of that element
       ↓
7. Claude API receives DOM context → suggests field name, data type, related fields
       ↓
8. User confirms or edits → Schema Preview updates in real-time
   (Repeat steps 5–8 for each additional field)

━━━━━━━━━━━━━━━━━━ PHASE 3: OUTPUT (System) ━━━━━━━━━━━━━

9. User clicks "Save Schema"
       ↓
10. Schema saved to localStorage with precisely locked CSS selectors
        ↓
11. User exports → Downloads JSON file
    (Post-MVP: creates a persistent API endpoint for Agent to call)
```

---

## 9. Data Storage Design

> MVP does not use a database. All schemas are stored in `localStorage` on the client side.

### 9.1 localStorage Schema Format

```javascript
// Key: "agenticview_schemas"
[
  {
    id: "schema_abc123",
    name: "Amazon Product Page",
    source_url: "https://amazon.com/dp/B08N5WRWNW",
    created_at: "2026-02-24T10:30:00Z",
    fields: [
      {
        name: "product_name",
        css_selector: "#productTitle",
        data_type: "string",
        confidence: 0.94,
      },
      {
        name: "price",
        css_selector: ".a-price-whole",
        data_type: "number",
        confidence: 0.88,
      },
    ],
    sample_output: {
      product_name: "Running Shoes Pro X",
      price: 129.99,
    },
  },
];
```

### 9.2 Export JSON Format

```json
{
  "schema_version": "1.0",
  "schema_id": "schema_abc123",
  "name": "Amazon Product Page",
  "created_at": "2026-02-24T10:30:00Z",
  "source_url": "https://amazon.com/dp/B08N5WRWNW",
  "fields": [
    {
      "name": "product_name",
      "css_selector": "#productTitle",
      "data_type": "string",
      "confidence": 0.94
    },
    {
      "name": "price",
      "css_selector": ".a-price-whole",
      "data_type": "number",
      "confidence": 0.88
    }
  ],
  "sample_output": {
    "product_name": "Running Shoes Pro X",
    "price": 129.99
  }
}
```

---

## 10. API Specification

### 10.1 Proxy Endpoint

**`GET /api/v1/proxy`**

Fetches HTML from the target URL, injects `selector.js`, and serves it to the frontend iframe.

**Query Parameters:**

| Parameter | Type   | Required | Description                               |
| --------- | ------ | -------- | ----------------------------------------- |
| `url`     | string | Yes      | Target URL to proxy (must be URL-encoded) |

**Response:** Processed HTML with the following modifications:

- Strip `Content-Security-Policy` headers.
- Strip `X-Frame-Options` headers.
- Rewrite relative URLs to absolute.
- Inject `<script src="/selector.js"></script>` before `</body>`.

**Error Codes:**

| Code | Reason                              |
| ---- | ----------------------------------- |
| 400  | Invalid URL or missing parameter    |
| 403  | Website blocks proxy / iframe       |
| 500  | Error fetching HTML from target URL |

---

### 10.2 AI Smart Suggest Endpoint

**`POST /api/v1/ai/suggest`**

Calls the Claude API to suggest a field name, data type, and related fields based on DOM context.

**Request Body:**

```json
{
  "element_html": "<div class=\"product-price\">$129.99</div>",
  "element_text": "$129.99",
  "parent_context": "<div class=\"product-info\">...</div>",
  "current_fields": ["product_name"]
}
```

| Field            | Type     | Required | Description                                       |
| ---------------- | -------- | -------- | ------------------------------------------------- |
| `element_html`   | string   | Yes      | Outer HTML of the selected element                |
| `element_text`   | string   | Yes      | Text content of the selected element              |
| `parent_context` | string   | No       | HTML of the parent element for additional context |
| `current_fields` | string[] | No       | List of field names already defined               |

**Response:**

```json
{
  "success": true,
  "suggestion": {
    "field_name": "product_price",
    "data_type": "currency",
    "currency_hint": "USD",
    "related_fields": ["original_price", "discount_percent", "in_stock"],
    "template_match": "e-commerce_product",
    "template_confidence": 0.91
  }
}
```

| Field                 | Type     | Description                                                  |
| --------------------- | -------- | ------------------------------------------------------------ |
| `field_name`          | string   | Suggested field name (snake_case)                            |
| `data_type`           | string   | Data type: `string`, `number`, `currency`, `date`, `boolean` |
| `currency_hint`       | string   | Currency code — only present when `data_type = "currency"`   |
| `related_fields`      | string[] | Up to 3 related fields the user might also want to extract   |
| `template_match`      | string   | Best-matching template, if detected                          |
| `template_confidence` | number   | Confidence score [0–1] of the template match                 |

---

### 10.3 Live Fetch Endpoint

**`GET /api/v1/fetch/{schema_id}`**

Fetches the target page, applies the schema's locked CSS selectors, and returns clean structured JSON for the agent.

**Path Parameters:**

| Parameter   | Type   | Required | Description            |
| ----------- | ------ | -------- | ---------------------- |
| `schema_id` | string | Yes      | ID of the saved schema |

**Query Parameters:**

| Parameter | Type   | Required | Description                                        |
| --------- | ------ | -------- | -------------------------------------------------- |
| `url`     | string | Yes      | Target page URL to extract data from (URL-encoded) |

**Response:**

```json
{
  "schema_id": "schema_abc123",
  "url": "https://example.com/product/123",
  "extracted_at": "2026-02-24T10:35:00Z",
  "data": {
    "product_name": "Running Shoes Pro X",
    "price": 129.99,
    "in_stock": true
  }
}
```

| Field          | Type   | Description                                    |
| -------------- | ------ | ---------------------------------------------- |
| `schema_id`    | string | ID of the schema used                          |
| `url`          | string | The target URL that was fetched                |
| `extracted_at` | string | ISO 8601 timestamp of when extraction occurred |
| `data`         | object | Key-value pairs of extracted fields            |

**Error Codes:**

| Code | Reason                                      |
| ---- | ------------------------------------------- |
| 400  | Missing or invalid `url` parameter          |
| 404  | `schema_id` not found                       |
| 422  | One or more CSS selectors returned no match |
| 500  | Playwright failed to load the target page   |

---

## 11. Error Handling

### 11.1 Invalid URL

**HTTP 400 Bad Request**

```json
{
  "success": false,
  "error": "INVALID_URL",
  "message": "The URL is invalid or cannot be reached"
}
```

### 11.2 Schema Not Found

**HTTP 404 Not Found**

```json
{
  "success": false,
  "error": "SCHEMA_NOT_FOUND",
  "message": "Schema does not exist"
}
```

### 11.3 Website Blocks iframe

**HTTP 403 Forbidden**

```json
{
  "success": false,
  "error": "IFRAME_BLOCKED",
  "message": "This website does not allow embedding in an iframe",
  "suggestion": "Try a different website or use Playwright mode"
}
```

### 11.4 AI Smart Suggest Failed

**HTTP 500 Internal Server Error**

```json
{
  "success": false,
  "error": "AI_SUGGEST_FAILED",
  "message": "Unable to call Claude API for suggestions",
  "fallback": "User can manually enter the field name and data type"
}
```

---

## 12. Tech Stack

### Architecture Decision for MVP

For the 3-day MVP, **both frontend and backend live in a single Next.js project**. Rationale:

- No need to set up and deploy two separate services.
- Next.js API Routes act as a lightweight BFF (Backend for Frontend) — sufficient for proxy and AI suggest within a demo scope.
- One codebase, one `npm run dev` command, running immediately.

**Known trade-off:** Next.js API Routes are serverless functions — they have a timeout limit (~10s). Playwright requires a persistent process, so running it inside API Routes is only suitable for local development. Post-MVP requires splitting the scraping layer into a dedicated service (see below).

---

### Frontend

| Library / Framework     | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| Next.js 14 (App Router) | Main framework — UI rendering and routing      |
| Tailwind CSS            | Styling                                        |
| Shadcn UI               | Component library                              |
| Framer Motion           | Smooth hover highlight effect on the inspector |
| lucide-react            | Icon set                                       |

### Backend (Next.js API Routes — same project)

Next.js API Routes in the MVP act as a **BFF layer** — not a full backend. Two endpoints:

| Route                     | Library used        | Role                                                                                                                                                                                           |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/proxy`       | Playwright          | Launch headless browser, load target URL, strip CSP/X-Frame-Options, inject `selector.js`, rewrite relative URLs → serve to iframe. Handles both static and JS-heavy sites with a single tool. |
| `POST /api/v1/ai/suggest` | `@anthropic-ai/sdk` | Receive DOM context from frontend → call Claude API directly → return field name, data type, related fields                                                                                    |

**Why Playwright instead of Cheerio:**

- Cheerio only parses static HTML — breaks on JS-rendered pages (React, Vue, etc.).
- Playwright runs a real browser (Chromium) → works on any site, no fallback needed.
- Free and open source — no extra cost.

**Why `@anthropic-ai/sdk` instead of Vercel AI SDK:**

- Calls Claude API directly without being tied to the Vercel platform.
- Works identically in local development and any deployment target.
- Simpler dependency — one SDK, one purpose.

### Storage

| Technology   | Purpose                                            |
| ------------ | -------------------------------------------------- |
| localStorage | Client-side schema storage — MVP does not use a DB |

### Deploy

- **Primary:** Local development — demo via screen share.
- **Fallback:** Vercel if time permits.

---

### Post-MVP Architecture (for reference)

When scaling to production, the scraping layer needs to be extracted into a dedicated service:

| Component    | MVP                                                    | Post-MVP                                                                                          |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Scraping     | Playwright (in API Route)                              | Playwright cluster in a dedicated long-running service — supports concurrency and longer timeouts |
| AI Suggest   | `@anthropic-ai/sdk`                                    | Unchanged — stays as a serverless API Route                                                       |
| Storage      | localStorage                                           | Supabase (schemas, fields, user accounts)                                                         |
| API Endpoint | `GET /api/v1/fetch/{schema_id}` backed by localStorage | Same endpoint backed by Supabase + auth + rate limiting                                           |

---

## 13. 3-Day Roadmap

### Day 1: Setup & Core Visual Studio

**Morning:**

- Scaffold Next.js + Shadcn UI.
- Set up proxy server to bypass CORS/CSP.
- Build URL Inspector: enter URL → display in iframe.

**Afternoon:**

- Implement hover highlight effect with Framer Motion.
- Inject `selector.js` into HTML via proxy.
- Test on 1–2 simple websites.

**Output:** URL Inspector working, hover highlight smooth.

---

### Day 2: Click-to-Select, Schema Preview & AI Smart Suggest

**Morning:**

- Click logic to select an element.
- Generate CSS selector from selected element.
- Real-time Schema Preview panel.

**Afternoon:**

- Integrate Claude API for AI Smart Suggest.
- AI suggests field name, data type, and related fields.
- Schema Preview auto-updates when fields are added or removed.

**Output:** Full happy path working — Select → AI Suggest → JSON Preview.

---

### Day 3: Schema Export, Testing & Polish

**Morning:**

- Implement Schema Export to JSON file.
- Test on 3 real websites: Amazon, CoinGecko, TechCrunch.
- Fix edge cases: iframe blocked, JS-heavy sites.

**Afternoon:**

- Polish UI/UX.
- Record demo video.
- Prepare presentation.

**Output:** Product stable, all P0 features working, demo ready.
