import { createServer } from 'node:http';
import { signWebhook, signPayment } from './razorpay.js';

/**
 * A stand-in for Razorpay's Orders API, for local development and tests only (Node). It implements the
 * calls the payments Worker makes (create order, get order), plus a pretend checkout page whose "Pay"
 * button marks the order paid, sends a correctly signed order.paid webhook and returns to the site with
 * the payment id and signature, like Razorpay Checkout's success handler.
 *
 *   const mock = await startMockRazorpay({ keyId: 'rzp_test_mock', keySecret: 'mock_secret', webhookSecret: 'mock_whsec' });
 *   mock.base                         → 'http://127.0.0.1:PORT/v1'   (use as RAZORPAY_BASE)
 *   mock.checkoutUrl(orderId, rpId, webhookUrl, returnUrl) → the pretend checkout page
 */
export async function startMockRazorpay({ keyId, keySecret, webhookSecret }) {
  const orders = new Map();
  let seq = 1000;

  const json = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => resolve(raw));
  });
  const authorised = (req) => req.headers.authorization === `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;

  async function sendWebhook(url, o, paymentId) {
    const raw = JSON.stringify({
      entity: 'event',
      event: 'order.paid',
      payload: {
        payment: { entity: { id: paymentId, order_id: o.id, amount: o.amount, currency: o.currency, status: 'captured' } },
        order: { entity: { ...o } },
      },
      created_at: Math.floor(Date.now() / 1000),
    });
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': await signWebhook(raw, webhookSecret) }, body: raw });
    } catch (e) {
      console.warn('[mock razorpay] webhook failed:', e.message);
    }
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'POST' && url.pathname === '/v1/orders') {
      if (!authorised(req)) return json(res, 401, { error: { code: 'BAD_REQUEST_ERROR', description: 'Authentication failed' } });
      const body = JSON.parse(await readBody(req));
      if (!(body.amount >= 100)) return json(res, 400, { error: { description: 'The amount must be atleast INR 1.00' } });
      const o = { id: `order_mock${seq += 1}`, entity: 'order', amount: body.amount, amount_paid: 0, amount_due: body.amount, currency: body.currency, receipt: body.receipt, notes: body.notes ?? {}, status: 'created', attempts: 0 };
      orders.set(o.id, o);
      return json(res, 200, o);
    }
    const m = /^\/v1\/orders\/([^/]+)$/.exec(url.pathname);
    if (req.method === 'GET' && m) {
      if (!authorised(req)) return json(res, 401, { error: { description: 'Authentication failed' } });
      const o = orders.get(decodeURIComponent(m[1]));
      return o ? json(res, 200, o) : json(res, 400, { error: { description: 'The id provided does not exist' } });
    }
    if (url.pathname === '/checkout') {
      const o = orders.get(url.searchParams.get('rp'));
      if (!o) return json(res, 404, { error: { description: 'order not found' } });
      const back = url.searchParams.get('return');
      if (req.method === 'POST') {
        const action = new URLSearchParams(await readBody(req)).get('action');
        if (action === 'pay') {
          const paymentId = `pay_mock${seq += 1}`;
          Object.assign(o, { status: 'paid', amount_paid: o.amount, amount_due: 0, attempts: o.attempts + 1 });
          await sendWebhook(url.searchParams.get('webhook'), o, paymentId);
          const sig = await signPayment(o.id, paymentId, keySecret);
          res.writeHead(303, { Location: `${back}&payment_id=${paymentId}&signature=${sig}` });
          return res.end();
        }
        Object.assign(o, { status: 'attempted', attempts: o.attempts + 1 });
        res.writeHead(303, { Location: `${back}&cancelled=1` });
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`<!doctype html><meta charset="utf-8"><title>Mock Razorpay checkout</title>
<body style="font-family:system-ui;max-width:420px;margin:60px auto;padding:24px;border:1px solid #ccc;border-radius:12px">
<p style="color:#b45309;font-weight:600">TEST CHECKOUT (mock Razorpay): no real money moves</p>
<h1 style="font-size:22px">Pay ₹${(o.amount / 100).toFixed(2)}</h1><p>Order ${o.receipt}</p>
<form method="post"><button name="action" value="pay" style="padding:10px 18px">Pay ₹${(o.amount / 100).toFixed(2)}</button>
<button name="action" value="cancel" style="padding:10px 18px;margin-left:8px">Cancel</button></form></body>`);
    }
    json(res, 404, { error: { description: 'not found' } });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  return {
    base: `${root}/v1`,
    checkoutUrl: (rpOrderId, webhookUrl, returnUrl) => `${root}/checkout?rp=${encodeURIComponent(rpOrderId)}&webhook=${encodeURIComponent(webhookUrl)}&return=${encodeURIComponent(returnUrl)}`,
    orders,
    close: () => new Promise((r) => server.close(r)),
  };
}
