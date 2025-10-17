# Staging Verification — 2025-10-17T01-58-06Z

- Port: 3000
- Health: OK (>=1 probe returned 200)

## stdout (tail)
```
🚀 Dispatch Construction Logistics API running on port 3000
📊 Health check: http://localhost:3000/health
📈 Metrics: http://localhost:3000/metrics
🔧 API docs: http://localhost:3000/
🏗️  Equipment matcher: http://localhost:3000/api/dispatch
🛡️  Rate limiting: 100 req/15min (Auth: 5 req/15min)
⚡ Features: optimized=false, compression=true, metrics=true
🚀 Starting background workers...
✅ 1 worker(s) initialized
  - email-notifications started

🕐 Starting background cron jobs...
  ✅ Daily Insurance Check (2 AM)
  ✅ Daily Insurance Alerts (3 AM)
  ✅ Weekly FMCSA Re-verification (Sunday 1 AM)
  ✅ Daily Performance Score Update (4 AM)
  ✅ Hourly Recurring Load Processing
🎉 All background jobs started!

✅ Redis connected successfully
✅ Redis ready for operations
[GET] /health - 200 (4ms)
[GET] /health - 200 (0ms)
[GET] / - 404 (1ms)
[GET] / - 200 (1ms)
[GET] /metrics - 200 (2ms)
[GET] /health - 200 (1ms)
[GET] /health - 200 (0ms)
[GET] / - 200 (9ms)
[GET] /metrics - 200 (0ms)
🔐 Auth Middleware Debug:
  - NODE_ENV: staging
  - Token received: none
  - Is dev token: undefined
❌ No token provided
[GET] /my-loads - 401 (3ms)
🔐 Auth Middleware Debug:
  - NODE_ENV: staging
  - Token received: none
  - Is dev token: undefined
❌ No token provided
[GET] /loads - 401 (2ms)
🔐 Auth Middleware Debug:
  - NODE_ENV: staging
  - Token received: none
  - Is dev token: undefined
❌ No token provided
[POST] /bid - 401 (2ms)

```

## stderr (tail)
```

```
