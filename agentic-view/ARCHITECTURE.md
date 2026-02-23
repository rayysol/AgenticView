# AgenticView Architecture

## SOLID Principles Implementation

This document explains how AgenticView implements SOLID principles throughout the codebase.

## 1. Single Responsibility Principle (SRP)

Each class/module has exactly one reason to change.

### Examples

#### AIService (`lib/services/AIService.ts`)

**Responsibility**: AI-powered field suggestions using Claude API

- Suggests field names from DOM context
- Analyzes HTML structure
- Parses AI responses

**Does NOT**:

- Store data in database
- Fetch web pages
- Extract data from pages

#### ProxyService (`lib/services/ProxyService.ts`)

**Responsibility**: Fetch and manipulate HTML for iframe display

- Launch browser via Playwright
- Strip CSP/X-Frame-Options headers
- Rewrite relative URLs to absolute
- Inject selector script

**Does NOT**:

- Suggest field names
- Store schemas
- Extract structured data

#### SchemaRepository (`lib/repositories/SchemaRepository.ts`)

**Responsibility**: Schema data access

- Create schemas
- Read schemas
- Update schemas
- Delete schemas

**Does NOT**:

- Validate business logic
- Make AI suggestions
- Fetch web pages

## 2. Open/Closed Principle (OCP)

Open for extension, closed for modification.

### Implementation

All services implement interfaces, allowing new implementations without modifying existing code.

#### Example: Adding a New AI Provider

Current:

```typescript
export class AIService implements IAIService {
  // Uses Claude API
}
```

To add OpenAI:

```typescript
export class OpenAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Use OpenAI API instead
  }

  async analyzeDOM(html: string): Promise<string[]> {
    // Use OpenAI API instead
  }
}
```

No changes needed in:

- API routes
- Components
- Other services

Just swap the implementation:

```typescript
// Before
const aiService = new AIService();

// After
const aiService = new OpenAIService();
```

## 3. Liskov Substitution Principle (LSP)

Implementations can be substituted for their interfaces.

### Example: ISchemaRepository

```typescript
interface ISchemaRepository {
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(schemaId: string): Promise<Schema | null>;
  // ...
}
```

Current implementation uses MongoDB:

```typescript
class SchemaRepository implements ISchemaRepository {
  // MongoDB implementation
}
```

Can be replaced with PostgreSQL:

```typescript
class PostgresSchemaRepository implements ISchemaRepository {
  // PostgreSQL implementation
}
```

Or in-memory for testing:

```typescript
class InMemorySchemaRepository implements ISchemaRepository {
  private schemas: Schema[] = [];

  async create(data: CreateSchemaDTO): Promise<Schema> {
    const schema = { ...data, schema_id: nanoid() };
    this.schemas.push(schema);
    return schema;
  }

  async findById(schemaId: string): Promise<Schema | null> {
    return this.schemas.find((s) => s.schema_id === schemaId) || null;
  }
}
```

All three can be used interchangeably.

## 4. Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use.

### Examples

Instead of one large interface:

```typescript
// ❌ BAD: Fat interface
interface IService {
  fetchPage(url: string): Promise<string>;
  suggestField(request: AISuggestRequest): Promise<AISuggestion>;
  extractData(schema: Schema, url: string): Promise<FetchResult>;
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(id: string): Promise<Schema | null>;
}
```

We split into focused interfaces:

```typescript
// ✅ GOOD: Segregated interfaces
interface IProxyService {
  fetchPage(url: string): Promise<string>;
  injectScript(html: string, scriptPath: string): string;
  stripHeaders(html: string): string;
  rewriteUrls(html: string, baseUrl: string): string;
}

interface IAIService {
  suggestField(request: AISuggestRequest): Promise<AISuggestion>;
  analyzeDOM(html: string): Promise<string[]>;
}

interface IExtractionService {
  extractData(schema: Schema, targetUrl: string): Promise<FetchResult>;
  validateSelectors(schema: Schema, targetUrl: string): Promise<boolean>;
}

interface ISchemaRepository {
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(schemaId: string): Promise<Schema | null>;
  findAll(): Promise<Schema[]>;
  update(schemaId: string, data: Partial<Schema>): Promise<Schema | null>;
  delete(schemaId: string): Promise<boolean>;
}
```

Benefits:

- API routes only import interfaces they need
- Easier to mock for testing
- Clear contracts

## 5. Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

### Example: API Route

❌ **BAD**: Direct dependency on concrete class

```typescript
import { SchemaRepository } from "@/lib/repositories/SchemaRepository";

export async function GET() {
  const repo = new SchemaRepository(); // Tightly coupled
  const schemas = await repo.findAll();
  return NextResponse.json(schemas);
}
```

✅ **GOOD**: Dependency on interface

```typescript
import { ISchemaRepository } from "@/lib/interfaces/ISchemaRepository";
import { SchemaRepository } from "@/lib/repositories/SchemaRepository";

// Dependency injection
function createSchemaRepository(): ISchemaRepository {
  return new SchemaRepository();
}

export async function GET() {
  const repo: ISchemaRepository = createSchemaRepository();
  const schemas = await repo.findAll();
  return NextResponse.json(schemas);
}
```

Benefits:

- Easy to swap implementations
- Testable via mocks
- Loose coupling

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ URLInput    │  │ PageInspector│  │ FieldList    │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ FieldDialog │  │ SchemaPreview│  │ SchemaActions│       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                           │                                  │
│                           │ useSchemaBuilder hook            │
│                           ▼                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTP API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ /proxy     │  │ /ai/suggest│  │ /schemas   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐                             │
│  │ /fetch     │  │ /export    │                             │
│  └────────────┘  └────────────┘                             │
│                           │                                  │
│                           │ Depends on Interfaces            │
│                           ▼                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                      Service Layer                           │
│                           │                                  │
│  ┌────────────────────────┼────────────────────────┐        │
│  │         IProxyService  │  IAIService            │        │
│  │                ▼       │       ▼                │        │
│  │         ProxyService   │  AIService             │        │
│  └────────────────────────┼────────────────────────┘        │
│                           │                                  │
│  ┌────────────────────────┼────────────────────────┐        │
│  │    IExtractionService  │  ISchemaRepository     │        │
│  │                ▼       │       ▼                │        │
│  │    ExtractionService   │  SchemaRepository      │        │
│  └────────────────────────┼────────────────────────┘        │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    External Services                         │
│                           │                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Playwright │  │ Claude API │  │ MongoDB    │            │
│  │ (Browser)  │  │ (AI)       │  │ (Database) │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests

Each service can be tested in isolation:

```typescript
describe("AIService", () => {
  it("should suggest field name from element", async () => {
    const service = new AIService("test-api-key");
    const suggestion = await service.suggestField({
      element_html: '<div class="price">$99.99</div>',
      element_text: "$99.99",
    });

    expect(suggestion.field_name).toBe("product_price");
    expect(suggestion.data_type).toBe("currency");
  });
});
```

### Integration Tests

Test with mock implementations:

```typescript
describe("Schema Creation Flow", () => {
  it("should create schema end-to-end", async () => {
    const mockRepo: ISchemaRepository = new InMemorySchemaRepository();
    const mockAI: IAIService = new MockAIService();

    // Test the full flow
  });
});
```

## Extension Points

### Adding a New Data Type

1. Add to `DataType` enum in `lib/types/schema.types.ts`
2. Add casting logic in `ExtractionService.castValue()`
3. Add UI option in `FieldDialog.tsx`

### Adding a New Storage Backend

1. Implement `ISchemaRepository`
2. Swap in API routes
3. No other changes needed

### Adding a New AI Provider

1. Implement `IAIService`
2. Swap in API routes
3. No other changes needed

## Benefits Summary

| Principle | Benefit                                     |
| --------- | ------------------------------------------- |
| SRP       | Easy to understand, maintain, and debug     |
| OCP       | Add features without breaking existing code |
| LSP       | Swap implementations seamlessly             |
| ISP       | Clean, focused interfaces                   |
| DIP       | Testable, flexible, loosely coupled         |

## Conclusion

This architecture ensures:

- **Maintainability**: Changes are isolated
- **Testability**: Services can be mocked
- **Scalability**: New features don't break old ones
- **Flexibility**: Swap implementations easily
