# Quick Start Guide

Get AgenticView running in 5 minutes! ⚡

## Prerequisites

- Node.js 20+
- MongoDB Atlas account (free tier works)
- Anthropic API key

---

## 1. Install Dependencies

```bash
cd agentic-view
npm install
npx playwright install chromium
```

---

## 2. Setup Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://your-connection-string
ANTHROPIC_API_KEY=sk-ant-your-api-key
NODE_ENV=development
```

### Get MongoDB URI:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Replace `<password>` and add database name: `/agenticview`

### Get Anthropic API Key:

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Copy key (starts with `sk-ant-`)

---

## 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. Create Your First Schema

### Step 1: Enter URL

```
https://example.com
```

### Step 2: Name Schema

```
Example Website
```

### Step 3: Click Elements

- Hover to highlight
- Click to select
- AI suggests field name
- Confirm or edit

### Step 4: Save

Click "Save Schema" → Get `schema_id`

---

## 5. Use the API

```bash
curl "http://localhost:3000/api/v1/fetch/schema_abc123?url=https://example.com"
```

Response:

```json
{
  "schema_id": "schema_abc123",
  "url": "https://example.com",
  "extracted_at": "2026-02-24T10:35:00Z",
  "data": {
    "title": "Example Domain",
    "description": "This domain is for use in examples"
  }
}
```

---

## Common Issues

### Port 3000 already in use

```bash
# Use different port
PORT=3001 npm run dev
```

### MongoDB connection error

- Check connection string
- Verify IP whitelist (allow 0.0.0.0/0 for development)
- Check database user credentials

### Playwright error

```bash
# Reinstall browsers
npx playwright install chromium --force
```

### AI suggestions not working

- Verify `ANTHROPIC_API_KEY` in `.env.local`
- Check API key is valid
- Ensure you have API credits

---

## Next Steps

- 📖 Read [USAGE_GUIDE.md](./USAGE_GUIDE.md) for detailed usage
- 🏗️ Read [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide

---

## Need Help?

- Check [README.md](./README.md) for full documentation
- Review [SOLID_EXAMPLES.md](./SOLID_EXAMPLES.md) for code examples
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for project overview

---

**That's it! You're ready to create APIs for AI agents.** 🎉
