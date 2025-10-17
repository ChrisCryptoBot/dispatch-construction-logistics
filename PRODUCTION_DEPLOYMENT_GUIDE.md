# Production Deployment Guide 🚀

## Overview
This guide covers deploying your Dispatch SaaS to production with both frontend (Vite/React) and backend (Express) serving from a single domain.

---

## 🏗️ Architecture Options

### Option 1: Single Server Deployment (Recommended for MVP)
```
Domain: yoursaas.com
├── Frontend: / (Vite build served as static files)
├── API: /api/* (Express routes)
└── Assets: /assets/* (Vite build assets)
```

### Option 2: Separate Services (Recommended for Scale)
```
Frontend: app.yoursaas.com (CDN/Vercel/Netlify)
Backend: api.yoursaas.com (Railway/Heroku/DigitalOcean)
```

---

## 🚀 Option 1: Single Server Deployment

### Step 1: Build Frontend
```bash
cd web
npm run build
```
This creates a `dist/` folder with optimized static files.

### Step 2: Configure Express to Serve Frontend
Add to your Express server (`src/index.js`):

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API Routes (before static files)
app.use('/api', apiRoutes);

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../web/dist')));

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
});
```

### Step 3: Environment Variables
Create `.env.production`:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_production_db_url
JWT_SECRET=your_secure_jwt_secret
REDIS_URL=your_production_redis_url
```

### Step 4: Build Scripts
Update root `package.json`:
```json
{
  "scripts": {
    "build": "cd web && npm run build",
    "start": "node src/index.js",
    "deploy": "npm run build && npm start"
  }
}
```

---

## ☁️ Option 2: Separate Services Deployment

### Frontend Deployment (Vercel/Netlify)

#### Vercel Configuration (`vercel.json`):
```json
{
  "builds": [
    {
      "src": "web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.yoursaas.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "web/dist/$1"
    }
  ]
}
```

#### Netlify Configuration (`netlify.toml`):
```toml
[build]
  publish = "web/dist"
  command = "cd web && npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://api.yoursaas.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend Deployment (Railway/Heroku/DigitalOcean)

#### Railway Configuration (`railway.json`):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

#### Docker Configuration (`Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/

# Install dependencies
RUN npm ci --only=production
RUN cd web && npm ci --only=production

# Build frontend
RUN cd web && npm run build

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

---

## 🔧 Production Optimizations

### 1. Database Setup
```bash
# Production database migration
npm run db:deploy

# Seed production data (if needed)
npm run db:seed
```

### 2. Environment Configuration
```javascript
// src/config/index.js
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
```

### 3. Security Headers
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 4. Rate Limiting (Production)
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP',
});

app.use('/api', limiter);
```

---

## 📊 Monitoring & Logging

### 1. Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

### 2. Error Handling
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});
```

### 3. Request Logging
```javascript
import morgan from 'morgan';

app.use(morgan('combined'));
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd web && npm ci
      
      - name: Run tests
        run: |
          npm test
          cd web && npm test
      
      - name: Build frontend
        run: cd web && npm run build
      
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: your-backend-service
```

---

## 🌐 Domain & SSL Setup

### 1. Custom Domain
- **Frontend**: `app.yoursaas.com` or `yoursaas.com`
- **Backend**: `api.yoursaas.com` (if separate services)

### 2. SSL Certificate
- **Vercel/Netlify**: Automatic SSL
- **Railway/Heroku**: Automatic SSL
- **Custom Server**: Use Let's Encrypt with Certbot

### 3. DNS Configuration
```
# Single domain setup
yoursaas.com          A    your-server-ip
*.yoursaas.com        A    your-server-ip

# Separate services setup  
app.yoursaas.com      CNAME your-vercel-domain
api.yoursaas.com      CNAME your-railway-domain
```

---

## 📈 Performance Monitoring

### 1. Application Monitoring
- **Sentry**: Error tracking and performance monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring

### 2. Database Monitoring
- **Prisma Metrics**: Query performance
- **Database logs**: Slow query identification
- **Connection pooling**: Optimize database connections

### 3. Frontend Monitoring
- **Vite Bundle Analyzer**: Optimize bundle size
- **Lighthouse**: Performance audits
- **Core Web Vitals**: User experience metrics

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Production database migrated and seeded
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit performed

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Test user registration/login
- [ ] Verify Load Board functionality
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Test payment processing (if applicable)

### Post-Launch
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Optimize based on usage patterns
- [ ] Plan scaling strategy

---

## 💰 Cost Estimation

### Single Server Deployment
- **VPS**: $10-50/month (DigitalOcean, Linode)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Database**: $0-25/month (planetscale, supabase free tier)
- **Total**: ~$15-75/month

### Separate Services
- **Frontend**: $0-20/month (Vercel/Netlify)
- **Backend**: $5-25/month (Railway/Heroku)
- **Database**: $0-25/month
- **Total**: ~$5-70/month

---

*Production deployment guide completed - Ready for launch! 🚀*
