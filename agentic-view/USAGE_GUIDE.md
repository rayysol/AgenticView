# AgenticView - Usage Guide

## Quick Start

### 1. Setup Environment

```bash
# Clone the repository
cd agentic-view

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://your-connection-string
ANTHROPIC_API_KEY=your-claude-api-key
NODE_ENV=development
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Creating Your First Schema

### Step 1: Enter Website URL

1. Paste a website URL (e.g., `https://example.com/product/123`)
2. Click "Load Page"
3. Wait for the page to load in the inspector

### Step 2: Name Your Schema

Enter a descriptive name for your schema:

- ✅ Good: "Amazon Product Page"
- ✅ Good: "CoinGecko Crypto Price"
- ❌ Bad: "Schema 1"

### Step 3: Select Elements

1. **Hover** over elements in the page - they will highlight
2. **Click** on an element to select it
3. A dialog will appear with AI suggestions
4. **Review** the suggested field name and data type
5. **Edit** if needed
6. Click "Add Field"

**Tips**:

- Start with the most important fields (e.g., product name, price)
- Use descriptive field names in snake_case (e.g., `product_price`, `stock_status`)
- Check the confidence score - higher is better

### Step 4: Review Schema Preview

The right panel shows a live JSON preview of your schema:

```json
{
  "schema_version": "1.0",
  "name": "Amazon Product Page",
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
      "data_type": "currency",
      "confidence": 0.88,
      "currency_hint": "USD"
    }
  ]
}
```

### Step 5: Save or Export

**Save to Database**:

- Click "Save Schema"
- You'll receive a `schema_id` (e.g., `schema_abc123`)
- Use this ID to call the API

**Export as JSON**:

- Click "Export"
- Downloads a JSON file
- Share with your team or import later

---

## Using the API

### Endpoint: Live Data Extraction

Once you've saved a schema, your AI agent can call:

```bash
GET /api/v1/fetch/{schema_id}?url={target_url}
```

### Example Request

```bash
curl "http://localhost:3000/api/v1/fetch/schema_abc123?url=https://amazon.com/dp/B08N5WRWNW"
```

### Example Response

```json
{
  "schema_id": "schema_abc123",
  "url": "https://amazon.com/dp/B08N5WRWNW",
  "extracted_at": "2026-02-24T10:35:00Z",
  "data": {
    "product_name": "Running Shoes Pro X",
    "price": 129.99,
    "in_stock": true,
    "rating": 4.5
  }
}
```

---

## API Reference

### 1. Proxy Endpoint

Fetch and process HTML for iframe display.

```
GET /api/v1/proxy?url={encoded_url}
```

**Query Parameters**:

- `url` (required): Target URL (URL-encoded)

**Response**: Processed HTML

---

### 2. AI Suggest

Get AI-powered field suggestions.

```
POST /api/v1/ai/suggest
```

**Request Body**:

```json
{
  "element_html": "<div class=\"product-price\">$129.99</div>",
  "element_text": "$129.99",
  "parent_context": "<div class=\"product-info\">...</div>",
  "current_fields": ["product_name"]
}
```

**Response**:

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

---

### 3. Create Schema

Save a new schema to the database.

```
POST /api/v1/schemas
```

**Request Body**:

```json
{
  "name": "Amazon Product Page",
  "source_url": "https://amazon.com/dp/B08N5WRWNW",
  "fields": [
    {
      "name": "product_name",
      "css_selector": "#productTitle",
      "data_type": "string",
      "confidence": 0.94
    }
  ],
  "sample_output": {
    "product_name": "Running Shoes Pro X"
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "schema_id": "schema_abc123",
    "name": "Amazon Product Page",
    "created_at": "2026-02-24T10:30:00Z",
    ...
  }
}
```

---

### 4. Get Schema

Retrieve a saved schema.

```
GET /api/v1/schemas/{schema_id}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "schema_id": "schema_abc123",
    "name": "Amazon Product Page",
    "fields": [...],
    ...
  }
}
```

---

### 5. List All Schemas

Get all saved schemas.

```
GET /api/v1/schemas
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "schema_id": "schema_abc123",
      "name": "Amazon Product Page",
      ...
    },
    {
      "schema_id": "schema_def456",
      "name": "CoinGecko Price",
      ...
    }
  ]
}
```

---

### 6. Delete Schema

Delete a schema.

```
DELETE /api/v1/schemas/{schema_id}
```

**Response**:

```json
{
  "success": true,
  "message": "Schema deleted successfully"
}
```

---

### 7. Export Schema

Download schema as JSON file.

```
GET /api/v1/schemas/{schema_id}/export
```

**Response**: JSON file download

---

### 8. Live Extraction (Main Endpoint for AI Agents)

Extract data from a target URL using a saved schema.

```
GET /api/v1/fetch/{schema_id}?url={target_url}
```

**Query Parameters**:

- `url` (required): Target page URL (URL-encoded)

**Response**:

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

## Data Types

AgenticView supports 5 data types:

| Type       | Description   | Example Input   | Example Output         |
| ---------- | ------------- | --------------- | ---------------------- |
| `string`   | Text content  | "Running Shoes" | "Running Shoes"        |
| `number`   | Numeric value | "42"            | 42                     |
| `currency` | Price/money   | "$129.99"       | 129.99                 |
| `date`     | Date/time     | "2026-02-24"    | "2026-02-24T00:00:00Z" |
| `boolean`  | True/false    | "In Stock"      | true                   |

### Type Casting Rules

#### Currency

- Removes currency symbols: `$`, `€`, `£`, `¥`
- Removes commas: `1,234.56` → `1234.56`
- Returns number: `129.99`

#### Boolean

- True values: "true", "yes", "1", "in stock", "available", "active"
- False values: everything else

#### Date

- Parses common date formats
- Returns ISO 8601 string

---

## Error Handling

### Common Errors

#### 400 Bad Request

```json
{
  "success": false,
  "error": "INVALID_URL",
  "message": "URL parameter is required"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "SCHEMA_NOT_FOUND",
  "message": "Schema does not exist"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "IFRAME_BLOCKED",
  "message": "This website does not allow embedding in an iframe",
  "suggestion": "Try a different website or use Playwright mode"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "AI_SUGGEST_FAILED",
  "message": "Unable to call Claude API for suggestions",
  "fallback": "User can manually enter the field name and data type"
}
```

---

## Best Practices

### Schema Design

1. **Start Simple**: Begin with 3-5 core fields
2. **Test Early**: Test extraction on multiple pages
3. **Use Stable Selectors**: Prefer IDs over classes
4. **Descriptive Names**: Use clear, descriptive field names

### Field Selection

1. **Hover First**: Hover to see what will be selected
2. **Check Confidence**: Higher confidence = more reliable
3. **Review Selector**: Check if the CSS selector is stable
4. **Test Multiple Pages**: Ensure selector works across similar pages

### API Usage

1. **Cache Results**: Don't call the API repeatedly for the same URL
2. **Handle Errors**: Always check `success` field in response
3. **Rate Limiting**: Implement rate limiting in your agent
4. **Monitor Failures**: Log failed extractions for debugging

---

## Troubleshooting

### Issue: Page Won't Load

**Symptoms**: Blank iframe or error message

**Solutions**:

1. Check if the website blocks iframes (X-Frame-Options)
2. Try a different website
3. Check your internet connection
4. Verify the URL is correct

### Issue: AI Suggestions Not Working

**Symptoms**: No suggestions appear in dialog

**Solutions**:

1. Check `ANTHROPIC_API_KEY` in `.env.local`
2. Verify API key is valid
3. Check Claude API quota
4. Review browser console for errors

### Issue: Extraction Returns Null

**Symptoms**: `data` field contains `null` values

**Solutions**:

1. Check if the CSS selector is still valid
2. Test on the original source URL
3. Website may have changed its structure
4. Try re-creating the schema

### Issue: MongoDB Connection Error

**Symptoms**: "Database operation failed"

**Solutions**:

1. Check `MONGODB_URI` in `.env.local`
2. Verify MongoDB Atlas cluster is running
3. Check IP whitelist in MongoDB Atlas
4. Verify database user credentials

---

## Advanced Usage

### Using with Python

```python
import requests

schema_id = "schema_abc123"
target_url = "https://example.com/product/123"

response = requests.get(
    f"http://localhost:3000/api/v1/fetch/{schema_id}",
    params={"url": target_url}
)

data = response.json()
print(data["data"]["product_name"])
print(data["data"]["price"])
```

### Using with JavaScript/Node.js

```javascript
const schemaId = "schema_abc123";
const targetUrl = "https://example.com/product/123";

const response = await fetch(
  `http://localhost:3000/api/v1/fetch/${schemaId}?url=${encodeURIComponent(targetUrl)}`,
);

const data = await response.json();
console.log(data.data.product_name);
console.log(data.data.price);
```

### Batch Extraction

```bash
# Extract from multiple URLs
for url in url1 url2 url3; do
  curl "http://localhost:3000/api/v1/fetch/schema_abc123?url=$url"
done
```

---

## Support

For issues, questions, or feature requests:

- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [SOLID_EXAMPLES.md](./SOLID_EXAMPLES.md) for code examples
- Open an issue on GitHub

---

## Next Steps

1. ✅ Create your first schema
2. ✅ Test extraction on multiple pages
3. ✅ Integrate with your AI agent
4. 🚀 Deploy to production (see [README.md](./README.md))
