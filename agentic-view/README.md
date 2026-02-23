# AgenticView

Create APIs for AI to extract information from any webpage accurately and reliably through a Human-in-the-Loop workflow.

## Overview

AgenticView enables you to:

- **Input (AI)**: Paste a URL → AI scans and suggests candidate data fields
- **Refine (Human)**: Click to lock exact elements you want
- **Output (System)**: Get a stable, fast, low-cost API endpoint for agents

## Architecture

This project follows **SOLID principles** for maintainable, scalable code:

### Single Responsibility Principle (SRP)

- Each service handles one specific concern
- `AIService`: AI-powered suggestions
- `ProxyService`: Page fetching and HTML manipulation
- `ExtractionService`: Data extraction from pages
- `SchemaRepository`: Database operations

### Open/Closed Principle (OCP)

- Services are open for extension through interfaces
- Closed for modification via dependency injection

### Liskov Substitution Principle (LSP)

- All implementations can be swapped via interfaces
- `ISchemaRepository`, `IAIService`, `IProxyService`, `IExtractionService`

### Interface Segregation Principle (ISP)

- Small, focused interfaces
- Clients only depend on methods they use

### Dependency Inversion Principle (DIP)

- High-level modules depend on abstractions
- Services injected via interfaces, not concrete implementations

## Project Structure

```
agentic-view/
├── app/                          # Next.js App Router
│   ├── api/v1/                   # API Routes
│   │   ├── proxy/                # Proxy endpoint
│   │   ├── ai/suggest/           # AI suggestions
│   │   ├── schemas/              # Schema CRUD
│   │   └── fetch/[schemaId]/    # Live extraction
│   ├── layout.tsx
│   ├── page.tsx                  # Main UI
│   └── globals.css
├── components/                   # React components
│   ├── URLInput.tsx
│   ├── PageInspector.tsx
│   ├── FieldList.tsx
│   ├── FieldDialog.tsx
│   ├── SchemaPreview.tsx
│   └── SchemaActions.tsx
├── lib/
│   ├── interfaces/               # SOLID interfaces
│   │   ├── ISchemaRepository.ts
│   │   ├── IAIService.ts
│   │   ├── IProxyService.ts
│   │   └── IExtractionService.ts
│   ├── services/                 # Service implementations
│   │   ├── AIService.ts
│   │   ├── ProxyService.ts
│   │   └── ExtractionService.ts
│   ├── repositories/             # Data access layer
│   │   └── SchemaRepository.ts
│   ├── database/                 # Database layer
│   │   ├── connection.ts
│   │   └── models/
│   │       └── Schema.model.ts
│   ├── types/                    # TypeScript types
│   │   ├── schema.types.ts
│   │   ├── ai.types.ts
│   │   └── api.types.ts
│   ├── utils/                    # Utilities
│   │   ├── validators.ts
│   │   ├── errorHandler.ts
│   │   └── cn.ts
│   └── hooks/                    # React hooks
│       └── useSchemaBuilder.ts
└── public/
    └── selector.js               # Client-side element selector

```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (via Mongoose)
- **AI**: Anthropic Claude API
- **Browser Automation**: Playwright
- **Icons**: Lucide React

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/agenticview
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### 1. Proxy Endpoint

```
GET /api/v1/proxy?url=<target_url>
```

Fetches and processes HTML for iframe display.

### 2. AI Suggest

```
POST /api/v1/ai/suggest
Body: {
  element_html: string,
  element_text: string,
  parent_context?: string,
  current_fields?: string[]
}
```

Returns AI-powered field suggestions.

### 3. Create Schema

```
POST /api/v1/schemas
Body: {
  name: string,
  source_url: string,
  fields: SchemaField[],
  sample_output: object
}
```

### 4. Get Schema

```
GET /api/v1/schemas/[schemaId]
```

### 5. Live Extraction (for AI Agents)

```
GET /api/v1/fetch/[schemaId]?url=<target_url>
```

Returns extracted data using the schema's selectors.

### 6. Export Schema

```
GET /api/v1/schemas/[schemaId]/export
```

Downloads schema as JSON file.

## Usage Flow

### 1. Create a Schema

1. Enter a website URL
2. Name your schema
3. Click elements on the page to select fields
4. AI suggests field names and data types
5. Confirm or edit suggestions
6. Save the schema

### 2. Use the API

Once saved, your AI agent can call:

```bash
curl "http://localhost:3000/api/v1/fetch/schema_abc123?url=https://example.com/product/123"
```

Response:

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

## SOLID Design Benefits

### Maintainability

- Each component has a single, clear responsibility
- Easy to locate and fix bugs
- Changes are isolated to specific modules

### Testability

- Services can be mocked via interfaces
- Unit tests can test each service independently
- Integration tests can swap implementations

### Scalability

- New data sources can be added by implementing interfaces
- New AI providers can replace `AIService`
- New storage backends can replace `SchemaRepository`

### Extensibility

- Add new field types without modifying existing code
- Add new extraction strategies via strategy pattern
- Add new validation rules via composition

## Development Guidelines

### Adding a New Service

1. Define interface in `lib/interfaces/`
2. Implement in `lib/services/`
3. Inject via constructor or function parameter
4. Use in API routes or components

Example:

```typescript
// 1. Define interface
export interface INewService {
  doSomething(): Promise<void>;
}

// 2. Implement
export class NewService implements INewService {
  async doSomething(): Promise<void> {
    // implementation
  }
}

// 3. Use
const service: INewService = new NewService();
```

### Adding a New Component

1. Create in `components/`
2. Follow Single Responsibility
3. Accept props, not global state
4. Use composition over inheritance

## Deployment

### Vercel (Recommended for MVP)

```bash
npm run build
vercel deploy
```

**Note**: Playwright requires serverless function timeout > 10s. Configure in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Post-MVP: Separate Scraping Service

For production, extract Playwright operations to a dedicated service:

- Use a persistent Node.js server
- Handle browser pool management
- Support longer timeouts and concurrency

## License

MIT

## Contributing

Contributions welcome! Please follow SOLID principles and include tests.
