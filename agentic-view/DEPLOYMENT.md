# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- MongoDB Atlas account and cluster
- Anthropic API key
- Vercel account (recommended) or other hosting platform

---

## Environment Variables

Set these environment variables in your deployment platform:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/agenticview
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=production
```

---

## Deploy to Vercel (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Set Environment Variables

```bash
vercel env add MONGODB_URI
# Paste your MongoDB connection string

vercel env add ANTHROPIC_API_KEY
# Paste your Anthropic API key

vercel env add NODE_ENV
# Enter: production
```

### 4. Deploy

```bash
# Production deployment
vercel --prod

# Or preview deployment
vercel
```

### 5. Configure Function Timeout

The `vercel.json` file is already configured with:

- 30-second timeout for API routes
- Environment variable references

**Important**: Vercel Hobby plan has a 10-second timeout limit. For production use with Playwright, upgrade to Pro plan (60-second timeout).

---

## Deploy to Other Platforms

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install Playwright
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Copy application
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t agenticview .
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e NODE_ENV="production" \
  agenticview
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install && npx playwright install chromium && npm run build`
4. Set start command: `npm start`
5. Add environment variables

---

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Choose a region close to your deployment

### 2. Create Database User

1. Go to Database Access
2. Add New Database User
3. Choose password authentication
4. Save username and password

### 3. Configure Network Access

1. Go to Network Access
2. Add IP Address
3. For development: Allow access from anywhere (0.0.0.0/0)
4. For production: Add your server's IP address

### 4. Get Connection String

1. Go to Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `agenticview`

Example:

```
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/agenticview
```

---

## Anthropic API Setup

### 1. Get API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Go to API Keys
4. Create new API key
5. Copy the key (starts with `sk-ant-`)

### 2. Set API Key

Add to your environment variables:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Post-Deployment Checklist

### 1. Test API Endpoints

```bash
# Test proxy endpoint
curl "https://your-domain.com/api/v1/proxy?url=https://example.com"

# Test AI suggest
curl -X POST "https://your-domain.com/api/v1/ai/suggest" \
  -H "Content-Type: application/json" \
  -d '{"element_html":"<div>Test</div>","element_text":"Test"}'

# Test schema creation
curl -X POST "https://your-domain.com/api/v1/schemas" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Schema",
    "source_url":"https://example.com",
    "fields":[{"name":"test","css_selector":".test","data_type":"string","confidence":0.9}],
    "sample_output":{"test":"value"}
  }'
```

### 2. Monitor Logs

Check deployment logs for errors:

- Vercel: Dashboard → Deployments → View Logs
- Docker: `docker logs <container_id>`

### 3. Test UI

1. Open your deployed URL
2. Enter a test URL
3. Select elements
4. Create a schema
5. Test extraction

---

## Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/v1/proxy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
    ];
  },
};
```

### 2. Optimize Playwright

For production, consider:

- Running Playwright in a separate service
- Using a browser pool
- Implementing request queuing

### 3. Database Indexing

Ensure indexes are created:

```javascript
// In Schema.model.ts
SchemaModelSchema.index({ schema_id: 1 }, { unique: true });
SchemaModelSchema.index({ created_at: -1 });
```

---

## Monitoring

### 1. Error Tracking

Add Sentry or similar:

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Analytics

Add Vercel Analytics:

```bash
npm install @vercel/analytics
```

```javascript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Scaling Considerations

### Current Architecture (MVP)

- ✅ Good for: Demo, MVP, low traffic
- ⚠️ Limitations: Serverless timeout, no browser pooling

### Production Architecture

For high traffic, separate concerns:

```
┌─────────────────┐
│   Next.js App   │  (UI + API Routes)
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐  ┌──▼──────────────┐
│  AI Service     │  │ Scraping Service│
│  (Serverless)   │  │ (Long-running)  │
└─────────────────┘  └─────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│   Claude API    │  │  Playwright     │
└─────────────────┘  │  Browser Pool   │
                     └─────────────────┘
```

Benefits:

- Longer timeouts for scraping
- Browser connection pooling
- Better resource management
- Horizontal scaling

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use secrets management (Vercel Secrets, AWS Secrets Manager)
- ✅ Rotate API keys regularly

### 2. Rate Limiting

Add rate limiting middleware:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return NextResponse.next();
}
```

### 3. Input Validation

- ✅ Validate all user inputs
- ✅ Sanitize URLs
- ✅ Validate CSS selectors
- ✅ Check field names format

### 4. CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://your-domain.com",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,DELETE" },
        ],
      },
    ];
  },
};
```

---

## Troubleshooting

### Issue: Playwright Timeout

**Solution**: Increase timeout in `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Issue: MongoDB Connection Error

**Solution**:

1. Check IP whitelist in MongoDB Atlas
2. Verify connection string
3. Check database user permissions

### Issue: Claude API Rate Limit

**Solution**:

1. Implement request queuing
2. Add retry logic with exponential backoff
3. Cache AI suggestions

---

## Backup and Recovery

### 1. Database Backups

MongoDB Atlas provides automatic backups:

- Configure backup schedule
- Test restore procedure
- Store backups in multiple regions

### 2. Schema Export

Regularly export schemas:

```bash
# Export all schemas
curl "https://your-domain.com/api/v1/schemas" > schemas-backup.json
```

---

## Cost Estimation

### Vercel (Hobby Plan - Free)

- ✅ Unlimited deployments
- ⚠️ 10-second function timeout
- ⚠️ 100GB bandwidth/month

### Vercel (Pro Plan - $20/month)

- ✅ 60-second function timeout
- ✅ 1TB bandwidth/month
- ✅ Priority support

### MongoDB Atlas (Free Tier)

- ✅ 512MB storage
- ✅ Shared cluster
- ⚠️ Limited connections

### Anthropic Claude API

- Pay per token
- ~$0.01 per suggestion
- Estimate: $10-50/month for moderate use

**Total Estimated Cost**: $0-70/month depending on usage

---

## Support

For deployment issues:

- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment](https://nextjs.org/docs/deployment)
- MongoDB Atlas [Support](https://www.mongodb.com/docs/atlas/)

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Test all endpoints
4. ✅ Monitor logs
5. ✅ Set up analytics
6. 🚀 Launch!
