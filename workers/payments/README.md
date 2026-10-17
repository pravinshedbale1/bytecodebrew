# Payments Worker (Cashfree)

Sells premium. The site calls this Cloudflare Worker to start a payment; Cashfree's checkout takes the
money; the Worker confirms the payment and writes `entitlements/{email}` in Firestore, which unlocks
premium on every device within seconds.

- `POST /pay/order` `{ planId, phone }` (signed in) — reads the price from `plans/{planId}`, records
  `orders/{orderId}`, creates the Cashfree order, returns the `payment_session_id`.
- `POST /pay/verify` `{ orderId }` (signed in) — called when the buyer returns to `/premium`.
- `POST /pay/webhook` — Cashfree's notification (HMAC signature checked).

The order status is always re-read from Cashfree, the paid amount must match the order, and each order
is applied exactly once (atomic claim + `orderIds` on the entitlement), even when the webhook and the
buyer's return arrive at the same time. Paying again extends access from the current expiry.

## One-time setup

1. **Cashfree account** — sign up at <https://merchant.cashfree.com>. In *Developers → API keys* copy the
   **test (sandbox)** App ID and Secret key. Production keys appear after KYC.
2. **Firebase service account** — Firebase console → *Project settings → Service accounts → Generate new
   private key*. Keep the JSON file private; it lets the Worker record payments.
3. **Publish the Firestore rules** (plans, orders, expiry): `npx firebase-tools deploy --only firestore:rules --project bytecodebrew-53f0c`
4. **Secrets and deploy**:
   ```bash
   cd workers/payments
   npx wrangler@4 secret put CASHFREE_APP_ID
   npx wrangler@4 secret put CASHFREE_SECRET_KEY
   npx wrangler@4 secret put FIREBASE_SERVICE_ACCOUNT      # paste the whole JSON on one line
   npx wrangler@4 deploy
   ```
5. **Plans** — sign in as the admin, open `/admin → Plans and prices`, create a plan (price in ₹,
   duration). It appears on `/premium` immediately.

## Testing with the sandbox

With `CASHFREE_ENV = "sandbox"` no real money moves. Use Cashfree's test methods from their docs
(for example the test UPI ID `testsuccess@gocash`, or the listed test cards). After paying you return
to `/premium?order_id=…`, premium switches on, and the payment shows on `/admin → Payments`.

## Going live

After KYC: replace the two Cashfree secrets with production keys, set `CASHFREE_ENV = "production"` in
`wrangler.toml`, whitelist `bytecodebrew.com` in the Cashfree dashboard (required for production
checkout), and deploy again.

## Local development

`npm run emulators` and `npm run dev:emulator` serve this same code at `/api/pay` with a mock Cashfree:
"Pay" on its test checkout page marks the order paid and sends a signed webhook. No keys needed.

To use the real Cashfree sandbox locally (Firestore stays on the emulator), put the test keys in
`workers/payments/.dev.vars` (git-ignored):

```
CASHFREE_APP_ID=TEST…
CASHFREE_SECRET_KEY=cfsk_ma_test_…
```

and run `CASHFREE_SANDBOX=1 npm run dev:emulator`. On Cashfree's sandbox checkout, choose Test Wallet,
then on the simulator enter OTP 111000 and pick SUCCESS. Cashfree cannot call a localhost webhook, so
locally the payment is confirmed when you return to `/premium` (in production both paths run).
