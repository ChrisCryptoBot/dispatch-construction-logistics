# TEST_131: Recurring Load Schedule

## 📋 **Test Information**
- **Feature**: Automated Recurring Load Posting
- **Priority**: 🟢 MEDIUM
- **Endpoint**: `POST /api/templates/:id/schedule`
- **Authentication**: Required (Customer)
- **Dependencies**: TEST_130 (Template created)

---

## 📝 **Test Cases**

### **Test Case 131.1: Create Recurring Schedule**

**Request:**
```http
POST http://localhost:3000/api/templates/{templateId}/schedule
Authorization: Bearer {customerToken}
Content-Type: application/json

{
  "cronExpr": "0 6 * * 1-5"
}
```

**Cron Expression:** `0 6 * * 1-5` = 6 AM, Monday-Friday

**Expected Response:**
```json
{
  "success": true,
  "schedule": {
    "id": "schedule-123",
    "cronExpr": "0 6 * * 1-5",
    "nextRunAt": "2025-01-16T06:00:00Z",
    "active": true
  }
}
```

**Expected Side Effects:**
- ✅ RecurringSchedule created
- ✅ nextRunAt calculated (next Mon-Fri 6 AM)
- ✅ Will auto-post load at scheduled time

---

### **Test Case 131.2: Recurring Schedule Executes**

**Setup:**
- Wait for nextRunAt time OR manually trigger via cron job

**Expected:**
- ✅ New load created automatically
- ✅ Load status = POSTED
- ✅ Schedule.lastRunAt updated
- ✅ Schedule.nextRunAt recalculated

**Check Console:**
```
✅ Recurring load created: load-789 from template Weekly Gravel Delivery
```

---

### **Test Case 131.3: Common Cron Expressions**

| Expression | Meaning | Use Case |
|------------|---------|----------|
| `0 6 * * 1-5` | 6 AM Mon-Fri | Weekday deliveries |
| `0 6 * * 1` | 6 AM every Monday | Weekly delivery |
| `0 6 1,15 * *` | 6 AM 1st & 15th | Bi-monthly |
| `0 * * * *` | Every hour | High-frequency shuttle |

---

## ✅ **Success Criteria**

- [ ] Schedule created successfully
- [ ] Cron expression stored
- [ ] Next run time calculated
- [ ] Recurring loads auto-post
- [ ] Schedule updates after each run
- [ ] Can deactivate schedule

**Result:** PASS / FAIL

**Notes:**


