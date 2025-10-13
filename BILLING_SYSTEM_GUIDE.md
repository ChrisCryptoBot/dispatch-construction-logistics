# 💰 BILLING SYSTEM - COMPLETE GUIDE

## 🎯 **SYSTEM OVERVIEW**

Your SaaS now has a **full-featured billing system** that works **manually** (for now) and is **Stripe-ready** for when you have budget.

---

## 📋 **CURRENT SETUP (MANUAL BILLING)**

### **How It Works:**

```
1. LOAD COMPLETES
   - Driver submits POD
   - Customer approves delivery
   ↓
2. INVOICE AUTO-GENERATED
   - System creates invoice (INV-2025-XXXX)
   - Status: "draft"
   ↓
3. YOU SEND INVOICE
   - Click "Send" button
   - Customer receives email with:
     • Invoice PDF
     • Bank transfer instructions
     • Payment reference number
   ↓
4. CUSTOMER PAYS (Manual)
   - Bank transfer, check, or wire
   - They include invoice number as reference
   ↓
5. YOU MARK AS PAID
   - Check your bank account
   - Click "Mark Paid" in system
   - System records payment
   ↓
6. CARRIER PAYOUT (Manual)
   - System shows you owe carrier 75%
   - You send ACH/wire manually
   - Carrier gets paid
   ↓
7. YOU KEEP 25%
   - Platform fee automatically calculated
   - Tracked in analytics
```

---

## 🖥️ **BILLING PAGE FEATURES**

### **Access:** 
- **Route**: `/billing`
- **Sidebar**: "Billing" menu item
- **Auth**: Admin/Owner access only

### **Tabs:**

#### **1. Invoices Tab** (Main)
**Features:**
- ✅ All invoices in one place
- ✅ Search by invoice #, customer, or load
- ✅ Filter by status (all, draft, sent, pending, paid, overdue)
- ✅ Status badges (color-coded)
- ✅ Quick actions: View, Send, Mark Paid, Download

**Invoice Statuses:**
- **Draft**: Auto-created, not sent yet
- **Sent**: Emailed to customer
- **Pending**: Customer notified, awaiting payment
- **Paid**: Payment received & recorded
- **Overdue**: Past due date
- **Cancelled**: Voided

#### **2. Transactions Tab**
**Tracks:**
- ✅ Customer payments (green)
- ✅ Carrier payouts (orange)
- ✅ Platform fees (blue)
- ✅ Payment methods
- ✅ Timestamps

#### **3. Analytics Tab**
**Metrics:**
- ✅ Total revenue
- ✅ Pending payments
- ✅ Overdue amounts
- ✅ Platform revenue (25%)
- ✅ Carrier payouts (75%)
- ✅ Payment rate (% paid on time)

---

## 📄 **INVOICE STRUCTURE**

### **Auto-Generated Details:**
```
SUPERIOR ONE LOGISTICS
Invoice #INV-2025-0001

Bill To: ABC Construction
Carrier: Texas Haulers LLC
Issue Date: 2025-10-09
Due Date: 2025-10-16 (7 days)

Description: Crushed Limestone - 18.5 tons
Load ID: load-001
Amount: $925.00

TOTAL DUE: $925.00
```

### **Payment Instructions (Included):**
```
Bank: Wells Fargo
Account: ****1234
Routing: 111000025
Reference: INV-2025-0001
```

### **Breakdown (Internal Only):**
**Pro Tier (8% platform fee):**
- Customer pays: **$925**
- Platform keeps: **$74.00** (8%)
- Carrier gets: **$851.00** (92%)

**Basic Tier (6%):** Platform: $55.50, Carrier: $869.50  
**Enterprise Tier (4%):** Platform: $37.00, Carrier: $888.00  
**Accessorials (25%):** Applies only to Layover & Equipment Not Used charges

---

## 💳 **WHEN TO SWITCH TO STRIPE**

### **Stick with Manual If:**
- You have < 10 loads/month
- Customers are happy with bank transfers
- You're comfortable tracking manually
- Cash flow is manageable

### **Switch to Stripe When:**
- You hit 20+ loads/month
- Manual tracking becomes overwhelming
- Customers want instant payment
- You want automated payouts
- You need credit card processing

---

## 🚀 **STRIPE INTEGRATION (FUTURE)**

### **What Changes:**

**Before (Manual):**
```typescript
const handleMarkPaid = (invoice) => {
  // You manually check bank, then click button
  setInvoice({ ...invoice, status: 'paid' })
}
```

**After (Stripe):**
```typescript
const handleProcessPayment = async (invoice) => {
  // Stripe automatically charges customer
  const payment = await stripe.paymentIntents.create({
    amount: invoice.amount * 100,
    customer: invoice.customerId,
    automatic_payment_methods: { enabled: true }
  })
  
  if (payment.status === 'succeeded') {
    setInvoice({ ...invoice, status: 'paid' })
    // Auto-trigger carrier payout
  }
}
```

### **Integration Steps (When Ready):**

1. **Sign up for Stripe** (free)
   - https://stripe.com
   - Complete verification (2-3 days)

2. **Install Stripe SDK**
   ```bash
   npm install @stripe/stripe-js stripe
   ```

3. **Add API keys** (env.example already has placeholders)
   ```
   STRIPE_PUBLIC_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

4. **Replace manual functions with Stripe calls**
   - `handleMarkPaid` → `handleProcessPayment`
   - Add webhook handler for events
   - Update invoice status on success

5. **Test with Stripe Test Mode**
   - Use test cards
   - Verify flow end-to-end
   - Check webhooks

6. **Go Live**
   - Switch to live keys
   - Process first real payment
   - Monitor for 2-3 days

**Estimated Time**: 3-5 days for full integration

---

## 📊 **MANUAL WORKFLOW (DETAILED)**

### **Daily Routine:**

**Morning:**
1. Open billing page (`/billing`)
2. Check "Pending" invoices
3. Check bank account for new transfers
4. Match payments to invoice references
5. Click "Mark Paid" for received payments

**Afternoon:**
1. Check "Overdue" invoices
2. Send reminders to customers
3. Process carrier payouts
4. Update transaction records

**Weekly:**
1. Review analytics tab
2. Check payment rates
3. Follow up on overdue invoices
4. Reconcile with accounting

**Monthly:**
1. Export all transactions
2. Generate financial reports
3. Calculate taxes
4. Review platform revenue

---

## 💡 **BEST PRACTICES**

### **Invoice Management:**
✅ **Send invoices immediately** after delivery approval  
✅ **Include clear payment instructions** in every invoice  
✅ **Set due date to 7 days** (industry standard)  
✅ **Follow up on day 5** if not paid  
✅ **Mark overdue on day 8**  
✅ **Call customer on day 10**  

### **Payment Tracking:**
✅ **Check bank daily** for incoming transfers  
✅ **Match reference numbers** to invoices  
✅ **Mark paid same day** to avoid confusion  
✅ **Keep notes** on partial payments  
✅ **Document disputes** immediately  

### **Carrier Payouts:**
✅ **Pay carriers within 24-48 hours** of receiving payment  
✅ **Use ACH** (cheaper than wire, $0.30 vs $25)  
✅ **Include load ID** in transfer memo  
✅ **Send confirmation email** with details  
✅ **Track payout in system**  

---

## 🔢 **REVENUE CALCULATIONS**

### **Per Load (Pro Tier - 8%):**
```
Customer pays: $1,000
Platform fee (8%): $80
Carrier payout (92%): $920
Your net: $80
```

### **Monthly (Example: 50 loads @ $1K avg, Pro tier):**
```
Total customer revenue: $50,000
Platform revenue (8%): $4,000
Carrier payouts (92%): $46,000
```

### **With Stripe (Future, Pro tier):**
```
Total customer revenue: $50,000
Stripe fees (2.9%): -$1,450
Platform revenue (8%): $4,000
Carrier payouts (92%): $46,000
Your net: $2,550 (5.1% after Stripe fees)
```

### **Tier Comparison (on $1,000 load):**
```
Basic (6%):      You: $60  | Carrier: $940
Pro (8%):        You: $80  | Carrier: $920
Enterprise (4%): You: $40  | Carrier: $960

Accessorials (25%): Only on Layover & Equipment Not Used
```

---

## 📁 **EXPORT & REPORTING**

### **Available Exports:**
- CSV (for Excel/accounting)
- JSON (for integrations)
- PDF (for records)

### **What You Can Export:**
- All invoices
- Filtered invoices
- Transactions
- Analytics data

### **Use Cases:**
- QuickBooks import
- Tax preparation
- Financial reporting
- Audits

---

## 🛡️ **SECURITY & COMPLIANCE**

### **Current Setup:**
✅ **Auth-protected** - Only admins can access  
✅ **Audit trail** - All actions logged  
✅ **Data validation** - Input sanitization  
✅ **Secure routes** - Protected by authentication  

### **With Stripe:**
✅ **PCI DSS** - Stripe handles compliance  
✅ **Encryption** - End-to-end SSL/TLS  
✅ **Tokenization** - No card data stored  
✅ **Fraud detection** - Built-in Stripe Radar  

---

## 📞 **CUSTOMER COMMUNICATION**

### **Invoice Email Template:**
```
Subject: Invoice INV-2025-0001 from Superior One Logistics

Dear [Customer Name],

Thank you for using Superior One Logistics!

Attached is your invoice for Load #load-001 (Crushed Limestone - 18.5 tons).

AMOUNT DUE: $925.00
DUE DATE: October 16, 2025

PAYMENT INSTRUCTIONS:
Bank: Wells Fargo
Account: ****1234
Routing: 111000025
Reference: INV-2025-0001

Please include the invoice number in your payment reference.

Questions? Reply to this email or call (512) 555-0100.

Best regards,
Superior One Logistics Team
```

---

## 🎯 **ROADMAP**

### **Phase 1: NOW (Manual)**
✅ Billing page built  
✅ Invoices auto-generated  
✅ Manual payment tracking  
✅ Carrier payout tracking  
✅ Analytics dashboard  

### **Phase 2: LATER (Stripe)**
⏳ Stripe integration  
⏳ Auto payment processing  
⏳ Auto carrier payouts  
⏳ Credit card support  
⏳ Subscription billing  

### **Phase 3: FUTURE (Advanced)**
⏳ Net-30 terms  
⏳ ACH direct debit (Dwolla)  
⏳ International payments  
⏳ Multi-currency support  
⏳ Automated dunning (late payment reminders)  

---

## 🆘 **TROUBLESHOOTING**

### **"Invoice not generating?"**
- Check if POD was submitted
- Verify customer approved delivery
- Look in browser console for errors
- Check load status is "DELIVERED"

### **"Can't mark as paid?"**
- Ensure invoice status is "sent" or "pending"
- Check you have admin permissions
- Try refreshing the page

### **"Where's my carrier payout info?"**
- Click invoice → See "Carrier Payout" field
- Check transactions tab
- Filter by "carrier_payout"

### **"Customer says they paid but not showing?"**
- Check bank account
- Verify reference number matches
- Look for partial payment
- Check if sent to wrong account

---

## 💰 **COST COMPARISON**

### **Manual (Current):**
- **Setup**: $0
- **Monthly**: $0
- **Per transaction**: $0
- **Your work**: 30-60 min/day

### **Stripe (Future):**
- **Setup**: $0
- **Monthly**: $0
- **Per transaction**: 2.9% + $0.30
- **Your work**: 5 min/day

### **Example (50 loads/month @ $1K avg):**
- **Manual**: $0 fees, but 20+ hours/month of work
- **Stripe**: $1,450/month fees, but 2 hours/month of work

**Your time is worth money - switch when it makes sense!**

---

## ✅ **YOU'RE ALL SET!**

Your billing system is **fully functional** and **production-ready** for manual operations!

**To access:**
1. Log in as admin
2. Click "Billing" in sidebar
3. Start managing invoices!

**When you're ready for Stripe**, the system is already architected to support it - just plug in the API and go! 🚀

