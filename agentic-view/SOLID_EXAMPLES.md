# SOLID Principles - Practical Examples

This document provides concrete examples of how SOLID principles are applied in AgenticView.

## 1. Single Responsibility Principle (SRP)

### ✅ Good Example: Separate Services

Each service has ONE clear responsibility:

```typescript
// AIService.ts - ONLY handles AI suggestions
export class AIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Call Claude API
    // Parse response
    // Return suggestion
  }
}

// ProxyService.ts - ONLY handles page fetching
export class ProxyService implements IProxyService {
  async fetchPage(url: string): Promise<string> {
    // Launch browser
    // Fetch HTML
    // Return content
  }
}

// SchemaRepository.ts - ONLY handles database operations
export class SchemaRepository implements ISchemaRepository {
  async create(data: CreateSchemaDTO): Promise<Schema> {
    // Save to MongoDB
    // Return saved schema
  }
}
```

### ❌ Bad Example: God Class

```typescript
// DON'T DO THIS
export class SchemaService {
  async createSchema(url: string, fields: any[]) {
    // Fetch page (mixing proxy logic)
    const html = await this.fetchPage(url);

    // Suggest fields (mixing AI logic)
    const suggestions = await this.callClaude(html);

    // Save to database (mixing repository logic)
    await this.saveToMongoDB(fields);

    // Extract data (mixing extraction logic)
    const data = await this.extractData(url, fields);

    return data;
  }
}
```

**Problem**: This class has 4 reasons to change:

1. Page fetching logic changes
2. AI provider changes
3. Database changes
4. Extraction logic changes

---

## 2. Open/Closed Principle (OCP)

### ✅ Good Example: Interface-Based Extension

```typescript
// Define interface
export interface IAIService {
  suggestField(request: AISuggestRequest): Promise<AISuggestion>;
}

// Implementation 1: Claude
export class ClaudeAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Use Claude API
    const response = await this.client.messages.create({...});
    return this.parseResponse(response);
  }
}

// Implementation 2: OpenAI (NEW - no changes to existing code)
export class OpenAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Use OpenAI API
    const response = await this.client.chat.completions.create({...});
    return this.parseResponse(response);
  }
}

// Implementation 3: Local Model (NEW - no changes to existing code)
export class LocalAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    // Use local Ollama
    const response = await fetch('http://localhost:11434/api/generate', {...});
    return this.parseResponse(response);
  }
}
```

**Usage in API route**:

```typescript
// Factory pattern for easy swapping
function createAIService(): IAIService {
  const provider = process.env.AI_PROVIDER || "claude";

  switch (provider) {
    case "openai":
      return new OpenAIService();
    case "local":
      return new LocalAIService();
    default:
      return new ClaudeAIService();
  }
}

export async function POST(request: NextRequest) {
  const aiService = createAIService(); // Swap via env var
  const suggestion = await aiService.suggestField(body);
  return NextResponse.json({ suggestion });
}
```

### ❌ Bad Example: Hardcoded Implementation

```typescript
// DON'T DO THIS
export async function POST(request: NextRequest) {
  // Hardcoded to Claude - can't extend without modifying
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({...});

  // To add OpenAI, you'd have to modify this function
  return NextResponse.json({ message });
}
```

---

## 3. Liskov Substitution Principle (LSP)

### ✅ Good Example: Interchangeable Implementations

```typescript
// Interface contract
export interface ISchemaRepository {
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(schemaId: string): Promise<Schema | null>;
}

// MongoDB implementation
export class MongoSchemaRepository implements ISchemaRepository {
  async create(data: CreateSchemaDTO): Promise<Schema> {
    const schema = new SchemaModel(data);
    return await schema.save();
  }

  async findById(schemaId: string): Promise<Schema | null> {
    return await SchemaModel.findOne({ schema_id: schemaId });
  }
}

// PostgreSQL implementation (can replace MongoDB)
export class PostgresSchemaRepository implements ISchemaRepository {
  async create(data: CreateSchemaDTO): Promise<Schema> {
    const result = await this.pool.query(
      'INSERT INTO schemas (...) VALUES (...)',
      [data.name, data.source_url, ...]
    );
    return result.rows[0];
  }

  async findById(schemaId: string): Promise<Schema | null> {
    const result = await this.pool.query(
      'SELECT * FROM schemas WHERE schema_id = $1',
      [schemaId]
    );
    return result.rows[0] || null;
  }
}

// In-memory implementation (for testing)
export class InMemorySchemaRepository implements ISchemaRepository {
  private schemas: Schema[] = [];

  async create(data: CreateSchemaDTO): Promise<Schema> {
    const schema = { ...data, schema_id: nanoid(), created_at: new Date() };
    this.schemas.push(schema);
    return schema;
  }

  async findById(schemaId: string): Promise<Schema | null> {
    return this.schemas.find(s => s.schema_id === schemaId) || null;
  }
}
```

**All three can be used interchangeably**:

```typescript
function testSchemaCreation(repo: ISchemaRepository) {
  const schema = await repo.create({
    name: "Test Schema",
    source_url: "https://example.com",
    fields: [],
    sample_output: {},
  });

  const found = await repo.findById(schema.schema_id);
  expect(found).toBeDefined();
}

// Works with any implementation
testSchemaCreation(new MongoSchemaRepository());
testSchemaCreation(new PostgresSchemaRepository());
testSchemaCreation(new InMemorySchemaRepository());
```

### ❌ Bad Example: Leaky Abstraction

```typescript
// DON'T DO THIS
export interface ISchemaRepository {
  create(data: CreateSchemaDTO): Promise<Schema>;
  findById(schemaId: string): Promise<Schema | null>;
  getMongoConnection(): mongoose.Connection; // ❌ Exposes MongoDB details
}

// Now PostgreSQL implementation can't implement this interface
// because it doesn't have a MongoDB connection
```

---

## 4. Interface Segregation Principle (ISP)

### ✅ Good Example: Focused Interfaces

```typescript
// Small, focused interfaces
export interface ISchemaReader {
  findById(schemaId: string): Promise<Schema | null>;
  findAll(): Promise<Schema[]>;
}

export interface ISchemaWriter {
  create(data: CreateSchemaDTO): Promise<Schema>;
  update(schemaId: string, data: Partial<Schema>): Promise<Schema | null>;
  delete(schemaId: string): Promise<boolean>;
}

// API route only needs reading
export async function GET(request: NextRequest) {
  const reader: ISchemaReader = new SchemaRepository();
  const schemas = await reader.findAll(); // Only uses read methods
  return NextResponse.json(schemas);
}

// API route only needs writing
export async function POST(request: NextRequest) {
  const writer: ISchemaWriter = new SchemaRepository();
  const schema = await writer.create(body); // Only uses write methods
  return NextResponse.json(schema);
}

// Full repository implements both
export class SchemaRepository implements ISchemaReader, ISchemaWriter {
  // Implements all methods
}
```

### ❌ Bad Example: Fat Interface

```typescript
// DON'T DO THIS
export interface ISchemaService {
  // Read operations
  findById(schemaId: string): Promise<Schema | null>;
  findAll(): Promise<Schema[]>;

  // Write operations
  create(data: CreateSchemaDTO): Promise<Schema>;
  update(schemaId: string, data: Partial<Schema>): Promise<Schema | null>;
  delete(schemaId: string): Promise<boolean>;

  // AI operations
  suggestFields(html: string): Promise<AISuggestion[]>;

  // Extraction operations
  extractData(schema: Schema, url: string): Promise<FetchResult>;

  // Proxy operations
  fetchPage(url: string): Promise<string>;
}

// Problem: A read-only component is forced to depend on write, AI, and proxy methods
```

---

## 5. Dependency Inversion Principle (DIP)

### ✅ Good Example: Depend on Abstractions

```typescript
// High-level module (API route)
export async function POST(request: NextRequest) {
  // Depends on interface, not concrete class
  const aiService: IAIService = createAIService();
  const repository: ISchemaRepository = createSchemaRepository();

  const suggestion = await aiService.suggestField(body);
  const schema = await repository.create({...});

  return NextResponse.json({ schema });
}

// Factory functions (dependency injection)
function createAIService(): IAIService {
  return new AIService(process.env.ANTHROPIC_API_KEY);
}

function createSchemaRepository(): ISchemaRepository {
  return new SchemaRepository();
}
```

**Benefits**:

- Easy to test with mocks
- Easy to swap implementations
- Loose coupling

### ❌ Bad Example: Depend on Concretions

```typescript
// DON'T DO THIS
import { AIService } from '@/lib/services/AIService';
import { SchemaRepository } from '@/lib/repositories/SchemaRepository';

export async function POST(request: NextRequest) {
  // Tightly coupled to concrete classes
  const aiService = new AIService(process.env.ANTHROPIC_API_KEY);
  const repository = new SchemaRepository();

  // Can't swap implementations
  // Hard to test

  const suggestion = await aiService.suggestField(body);
  const schema = await repository.create({...});

  return NextResponse.json({ schema });
}
```

---

## Testing with SOLID

### Unit Testing with Mocks

```typescript
// Mock implementation for testing
class MockAIService implements IAIService {
  async suggestField(request: AISuggestRequest): Promise<AISuggestion> {
    return {
      field_name: "test_field",
      data_type: "string",
      related_fields: [],
    };
  }

  async analyzeDOM(html: string): Promise<string[]> {
    return [".test-selector"];
  }
}

// Test
describe("Schema Creation", () => {
  it("should create schema with AI suggestions", async () => {
    const mockAI: IAIService = new MockAIService();
    const mockRepo: ISchemaRepository = new InMemorySchemaRepository();

    // Test logic using mocks
    const suggestion = await mockAI.suggestField({
      element_html: "<div>Test</div>",
      element_text: "Test",
    });

    expect(suggestion.field_name).toBe("test_field");
  });
});
```

---

## Summary

| Principle | Key Benefit                     | Example in AgenticView                      |
| --------- | ------------------------------- | ------------------------------------------- |
| **SRP**   | Easy to understand and maintain | Separate services for AI, Proxy, Extraction |
| **OCP**   | Extend without modifying        | Add new AI providers via interface          |
| **LSP**   | Swap implementations            | MongoDB → PostgreSQL → In-memory            |
| **ISP**   | Clean, focused contracts        | Separate read/write interfaces              |
| **DIP**   | Testable, flexible              | Depend on IAIService, not AIService         |

## Real-World Scenarios

### Scenario 1: Switch from Claude to OpenAI

**Without SOLID**: Modify 10+ files, risk breaking existing code

**With SOLID**:

1. Create `OpenAIService implements IAIService`
2. Update factory function
3. Done! No other changes needed

### Scenario 2: Add PostgreSQL Support

**Without SOLID**: Rewrite database layer, update all API routes

**With SOLID**:

1. Create `PostgresSchemaRepository implements ISchemaRepository`
2. Update factory function
3. Done! API routes unchanged

### Scenario 3: Add Unit Tests

**Without SOLID**: Hard to test, need real database and AI API

**With SOLID**:

1. Create mock implementations
2. Inject mocks via interfaces
3. Test in isolation

---

This is how SOLID principles make AgenticView maintainable, testable, and scalable! 🚀
