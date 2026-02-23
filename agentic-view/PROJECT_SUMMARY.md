# AgenticView - Project Summary

## 🎯 Project Overview

AgenticView is a tool that enables **creating APIs for AI to extract information from any webpage accurately and reliably** through a Human-in-the-Loop workflow.

**Built with SOLID principles** for maintainability, testability, and scalability.

---

## ✅ Implementation Status

### Core Features (All Implemented ✅)

| Feature                 | Status | Description                            |
| ----------------------- | ------ | -------------------------------------- |
| URL Inspector           | ✅     | Load any website in sandboxed iframe   |
| Element Hover Highlight | ✅     | Real-time visual highlight on hover    |
| Click to Select         | ✅     | Click elements to add as fields        |
| CSS Selector Generation | ✅     | Auto-generate optimal selectors        |
| Schema Preview          | ✅     | Live JSON preview panel                |
| AI Smart Suggest        | ✅     | Claude-powered field suggestions       |
| Schema Export           | ✅     | Export as JSON file                    |
| Live API Endpoint       | ✅     | `/api/v1/fetch/{schema_id}` for agents |
| Schema CRUD             | ✅     | Create, Read, Update, Delete schemas   |
| MongoDB Integration     | ✅     | Persistent storage via Mongoose        |

---

## 📁 Project Structure

```
agentic-view/
├── app/                              # Next.js App Router
│   ├── api/v1/                       # API Routes (6 endpoints)
│   │   ├── proxy/route.ts            # ✅ Proxy endpoint
│   │   ├── ai/suggest/route.ts       # ✅ AI suggestions
│   │   ├── schemas/route.ts          # ✅ List/Create schemas
│   │   ├── schemas/[id]/route.ts     # ✅ Get/Delete schema
│   │   ├── schemas/[id]/export/route.ts # ✅ Export schema
│   │   └── fetch/[id]/route.ts       # ✅ Live extraction
│   ├── layout.tsx                    # ✅ Root layout
│   ├── page.tsx                      # ✅ Main UI
│   └── globals.css                   # ✅ Global styles
│
├── components/                       # React Components (6 components)
│   ├── URLInput.tsx                  # ✅ URL input form
│   ├── PageInspector.tsx             # ✅ Iframe inspector
│   ├── FieldList.tsx                 # ✅ Field list display
│   ├── FieldDialog.tsx               # ✅ Add/edit field dialog
│   ├── SchemaPreview.tsx             # ✅ JSON preview
│   └── SchemaActions.tsx             # ✅ Save/Export/Reset buttons
│
├── lib/
│   ├── interfaces/                   # SOLID Interfaces (4 interfaces)
│   │   ├── ISchemaRepository.ts      # ✅ Repository contract
│   │   ├── IAIService.ts             # ✅ AI service contract
│   │   ├── IProxyService.ts          # ✅ Proxy service contract
│   │   └── IExtractionService.ts     # ✅ Extraction contract
│   │
│   ├── services/                     # Service Layer (3 services)
│   │   ├── AIService.ts              # ✅ Claude API integration
│   │   ├── ProxyService.ts           # ✅ Playwright proxy
│   │   └── ExtractionService.ts      # ✅ Data extraction
│   │
│   ├── repositories/                 # Data Access Layer (1 repository)
│   │   └── SchemaRepository.ts       # ✅ MongoDB operations
│   │
│   ├── database/                     # Database Layer
│   │   ├── connection.ts             # ✅ MongoDB connection
│   │   └── models/Schema.model.ts    # ✅ Mongoose schema
│   │
│   ├── types/                        # TypeScript Types (3 type files)
│   │   ├── schema.types.ts           # ✅ Schema types
│   │   ├── ai.types.ts               # ✅ AI types
│   │   └── api.types.ts              # ✅ API types
│   │
│   ├── utils/                        # Utilities (3 utility files)
│   │   ├── validators.ts             # ✅ Input validation
│   │   ├── errorHandler.ts           # ✅ Error handling
│   │   └── cn.ts                     # ✅ Class name utility
│   │
│   └── hooks/                        # React Hooks (1 hook)
│       └── useSchemaBuilder.ts       # ✅ Schema builder logic
│
├── public/
│   └── selector.js                   # ✅ Client-side selector script
│
├── Documentation                     # Comprehensive Docs
│   ├── README.md                     # ✅ Main documentation
│   ├── ARCHITECTURE.md               # ✅ Architecture details
│   ├── SOLID_EXAMPLES.md             # ✅ SOLID examples
│   ├── USAGE_GUIDE.md                # ✅ Usage guide
│   └── PROJECT_SUMMARY.md            # ✅ This file
│
└── Configuration
    ├── package.json                  # ✅ Dependencies
    ├── tsconfig.json                 # ✅ TypeScript config
    ├── .env.local.example            # ✅ Environment template
    ├── .gitignore                    # ✅ Git ignore
    └── vercel.json                   # ✅ Vercel config
```

**Total Files Created**: 40+ files

---

## 🏗️ SOLID Architecture

### 1. Single Responsibility Principle (SRP) ✅

Each module has ONE clear responsibility:

| Module              | Responsibility                    |
| ------------------- | --------------------------------- |
| `AIService`         | AI-powered suggestions via Claude |
| `ProxyService`      | Fetch and process HTML            |
| `ExtractionService` | Extract data from pages           |
| `SchemaRepository`  | Database operations               |

### 2. Open/Closed Principle (OCP) ✅

Extend without modifying:

- Add new AI providers by implementing `IAIService`
- Add new storage backends by implementing `ISchemaRepository`
- Add new extraction strategies by implementing `IExtractionService`

### 3. Liskov Substitution Principle (LSP) ✅

All implementations are interchangeable:

- Swap MongoDB → PostgreSQL → In-memory
- Swap Claude → OpenAI → Local model
- No code changes needed

### 4. Interface Segregation Principle (ISP) ✅

Small, focused interfaces:

- `ISchemaRepository`: Only database operations
- `IAIService`: Only AI operations
- `IProxyService`: Only proxy operations
- `IExtractionService`: Only extraction operations

### 5. Dependency Inversion Principle (DIP) ✅

Depend on abstractions:

- API routes depend on interfaces, not concrete classes
- Services are injected via factory functions
- Easy to mock for testing

---

## 🔧 Tech Stack

| Layer             | Technology              | Purpose                    |
| ----------------- | ----------------------- | -------------------------- |
| **Framework**     | Next.js 14 (App Router) | Full-stack React framework |
| **Language**      | TypeScript              | Type safety                |
| **Styling**       | Tailwind CSS            | Utility-first CSS          |
| **Database**      | MongoDB Atlas           | Cloud database             |
| **ORM**           | Mongoose                | MongoDB object modeling    |
| **AI**            | Anthropic Claude API    | Field suggestions          |
| **Browser**       | Playwright              | Web scraping               |
| **Icons**         | Lucide React            | Icon library               |
| **ID Generation** | nanoid                  | Unique IDs                 |

---

## 📊 API Endpoints

| Endpoint                      | Method | Description                       |
| ----------------------------- | ------ | --------------------------------- |
| `/api/v1/proxy`               | GET    | Fetch and process HTML            |
| `/api/v1/ai/suggest`          | POST   | AI field suggestions              |
| `/api/v1/schemas`             | GET    | List all schemas                  |
| `/api/v1/schemas`             | POST   | Create new schema                 |
| `/api/v1/schemas/[id]`        | GET    | Get schema by ID                  |
| `/api/v1/schemas/[id]`        | DELETE | Delete schema                     |
| `/api/v1/schemas/[id]/export` | GET    | Export schema as JSON             |
| `/api/v1/fetch/[id]`          | GET    | **Live extraction for AI agents** |

---

## 🎨 UI Components

| Component       | Purpose                            |
| --------------- | ---------------------------------- |
| `URLInput`      | URL input form with validation     |
| `PageInspector` | Iframe-based page viewer           |
| `FieldList`     | Display selected fields            |
| `FieldDialog`   | Add/edit field with AI suggestions |
| `SchemaPreview` | Live JSON preview                  |
| `SchemaActions` | Save/Export/Reset buttons          |

---

## 🔐 Environment Variables

```env
MONGODB_URI=mongodb+srv://...          # MongoDB connection string
ANTHROPIC_API_KEY=sk-ant-...           # Claude API key
NODE_ENV=development                   # Environment
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright
npx playwright install chromium

# 3. Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 4. Run development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

---

## 📖 Documentation

| Document                                   | Description                     |
| ------------------------------------------ | ------------------------------- |
| [README.md](./README.md)                   | Main documentation, setup guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md)       | SOLID principles, data flow     |
| [SOLID_EXAMPLES.md](./SOLID_EXAMPLES.md)   | Practical SOLID examples        |
| [USAGE_GUIDE.md](./USAGE_GUIDE.md)         | Step-by-step usage guide        |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | This file                       |

---

## ✨ Key Features

### 1. Human-in-the-Loop Workflow

```
Input (AI) → Refine (Human) → Output (System)
```

1. **AI scans** the page and suggests fields
2. **Human clicks** to lock exact elements
3. **System generates** stable API endpoint

### 2. AI-Powered Suggestions

- Field name in snake_case
- Data type detection (string, number, currency, date, boolean)
- Related field suggestions
- Template matching (e-commerce, article, etc.)

### 3. Live API for Agents

```bash
curl "http://localhost:3000/api/v1/fetch/schema_abc123?url=https://example.com"
```

Returns:

```json
{
  "schema_id": "schema_abc123",
  "url": "https://example.com",
  "extracted_at": "2026-02-24T10:35:00Z",
  "data": {
    "product_name": "Running Shoes Pro X",
    "price": 129.99,
    "in_stock": true
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Planned)

```typescript
// Mock implementations for testing
class MockAIService implements IAIService { ... }
class InMemorySchemaRepository implements ISchemaRepository { ... }

// Test in isolation
describe('AIService', () => {
  it('should suggest field name', async () => {
    const service = new MockAIService();
    const suggestion = await service.suggestField({...});
    expect(suggestion.field_name).toBe('product_price');
  });
});
```

### Integration Tests (Planned)

```typescript
describe("Schema Creation Flow", () => {
  it("should create schema end-to-end", async () => {
    const mockRepo = new InMemorySchemaRepository();
    const mockAI = new MockAIService();
    // Test full flow
  });
});
```

---

## 🎯 Benefits of SOLID Architecture

| Benefit             | Description                                        |
| ------------------- | -------------------------------------------------- |
| **Maintainability** | Each module has a single, clear responsibility     |
| **Testability**     | Services can be mocked via interfaces              |
| **Scalability**     | Add new features without breaking existing code    |
| **Flexibility**     | Swap implementations easily (MongoDB → PostgreSQL) |
| **Extensibility**   | Add new AI providers, storage backends, etc.       |

---

## 🔄 Extension Examples

### Add OpenAI Support

```typescript
// 1. Create new service
export class OpenAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Use OpenAI API
  }
}

// 2. Update factory
function createAIService(): IAIService {
  return process.env.AI_PROVIDER === "openai"
    ? new OpenAIService()
    : new AIService();
}

// 3. Done! No other changes needed
```

### Add PostgreSQL Support

```typescript
// 1. Create new repository
export class PostgresSchemaRepository implements ISchemaRepository {
  async create(data: CreateSchemaDTO): Promise<Schema> {
    // Use PostgreSQL
  }
}

// 2. Update factory
function createSchemaRepository(): ISchemaRepository {
  return process.env.DB_TYPE === "postgres"
    ? new PostgresSchemaRepository()
    : new SchemaRepository();
}

// 3. Done! No other changes needed
```

---

## 📈 Future Enhancements (Post-MVP)

| Feature             | Description                          |
| ------------------- | ------------------------------------ |
| User Authentication | Multi-tenant support                 |
| Schema Templates    | Pre-built templates for common sites |
| Scheduled Refresh   | Auto-update extracted data           |
| Self-Healing        | Auto-fix broken selectors            |
| MCP Tool Generation | Generate MCP tools from schemas      |
| Analytics Dashboard | Monitor extraction success rates     |
| Rate Limiting       | Protect API from abuse               |
| Webhook Support     | Push updates to external services    |

---

## 🎓 Learning Resources

### SOLID Principles

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- [SOLID_EXAMPLES.md](./SOLID_EXAMPLES.md) - Practical examples

### Usage

- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Step-by-step guide
- [README.md](./README.md) - Quick start

### API Reference

- [USAGE_GUIDE.md#api-reference](./USAGE_GUIDE.md#api-reference)

---

## 🏆 Project Highlights

✅ **40+ files** implementing SOLID principles  
✅ **8 API endpoints** fully functional  
✅ **6 React components** with clean separation  
✅ **4 interfaces** for dependency inversion  
✅ **3 services** with single responsibilities  
✅ **Comprehensive documentation** (5 markdown files)  
✅ **Type-safe** with TypeScript  
✅ **Production-ready** architecture

---

## 🤝 Contributing

Contributions welcome! Please:

1. Follow SOLID principles
2. Add tests for new features
3. Update documentation
4. Use TypeScript strict mode

---

## 📝 License

MIT

---

## 🎉 Conclusion

AgenticView demonstrates how **SOLID principles** create:

- ✅ Maintainable code
- ✅ Testable architecture
- ✅ Scalable system
- ✅ Flexible design

**Ready to use, easy to extend, built to last.** 🚀
