# Payments Worker (Razorpay)

Sells premium. The site asks this Cloudflare Worker to start a payment; Razorpay Checkout (a pop-up on
`/premium`) takes the money; the Worker confirms the payment with Razorpay and writes
`entitlements/{email}` in Firestore, which unlocks premium on every device within seconds.

- `POST /pay/order` `{ planId }` (signed in): reads the price from `plans/{planId}`, records
  `orders/{orderId}`, creates the Razorpay order (our order id is its `receipt`) and returns what
  Checkout needs.
- `POST /pay/verify` `{ orderId, paymentId?, signature? }` (signed in): called by Checkout's success
  handler. The signature must be valid when sent, but premium is only granted after Razorpay itself
  reports the order as `paid` for the full amount.
- `POST /pay/webhook`: Razorpay's `order.paid` / `payment.captured` events (signature checked). This
  covers buyers who close the tab before the success handler runs.

Each order is applied exactly once (atomic claim + `orderIds` on the entitlement), even when the webhook
and the buyer's confirmation arrive together. Paying again extends access from the current expiry.

## One-time setup

1. **Razorpay account**: sign up at <https://dashboard.razorpay.com>, complete KYC and add the website
   (`https://bytecodebrew.com`; the contact, terms, privacy, refund and delivery pages are already live).
2. **API keys**: Dashboard → *Account & Settings → API Keys*. Generate **Test** keys first
   (`rzp_test_…`); **Live** keys (`rzp_live_…`) appear once the account is activated.
3. **Payment capture**: *Account & Settings → Payment capture* must be **Automatic** (the default), so a
   successful payment marks the order `paid`.
4. **Webhook**: *Account & Settings → Webhooks → Add new webhook*
   - URL: `https://bytecodebrew-payments.bytecodebrew.workers.dev/pay/webhook`
   - Secret: any long random string (you'll store it as `RAZORPAY_WEBHOOK_SECRET`)
   - Events: `order.paid` and `payment.captured`
   Test and live mode have separate webhooks; add it in both.
5. **Secrets and deploy**:
   ```bash
   cd workers/payments
   npx wrangler@4 secret put RAZORPAY_KEY_ID
   npx wrangler@4 secret put RAZORPAY_KEY_SECRET
   npx wrangler@4 secret put RAZORPAY_WEBHOOK_SECRET
   npx wrangler@4 deploy
   ```
   `FIREBASE_SERVICE_ACCOUNT` is already set from the Cashfree setup. The old `CASHFREE_*` secrets can be
   deleted with `npx wrangler@4 secret delete CASHFREE_APP_ID` (and `CASHFREE_SECRET_KEY`).
6. **Plans**: `/admin → Plans and prices` (unchanged).

## Testing with test keys

With `rzp_test_…` keys no real money moves. In Checkout use Razorpay's test methods, for example UPI
`success@razorpay` or the test cards in Razorpay's docs. After paying, `/premium` confirms the order,
premium switches on, and the payment shows on `/admin → Payments` and in the Razorpay dashboard (test mode).

## Going live

Replace the two key secrets with the live keys, add the webhook in live mode with its secret, and deploy
again. Nothing in the code changes: live or test follows the key.

## Local development

`npm run emulators` and `npm run dev:emulator` serve this same code at `/api/pay` with a mock Razorpay:
"Pay" on its pretend checkout page marks the order paid, sends a signed `order.paid` webhook and returns
to `/premium` with a valid payment signature. No keys needed.

To use real Razorpay test mode locally (Firestore stays on the emulator), put the **test** keys in
`workers/payments/.dev.vars` (git-ignored):

```
RAZORPAY_KEY_ID=rzp_test_…
RAZORPAY_KEY_SECRET=…
```

and run `RAZORPAY_TEST=1 npm run dev:emulator`. Razorpay can't call a localhost webhook, so locally the
success handler's confirmation applies premium.
