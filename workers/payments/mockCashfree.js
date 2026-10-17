import { createServer } from 'node:http';
import { signWebhook } from './cashfree.js';

/**
 * A stand-in for Cashfree's PG API, for local development and tests only (Node). It implements the
 * calls the payments Worker makes (create order, get order), plus a pretend checkout page whose "Pay"
 * button marks the order PAID, sends a correctly signed webhook and redirects back like Cashfree does.
 *
 *   const mock = await startMockCashfree({ secret: 'mock_secret' });
 *   mock.base            → 'http://127.0.0.1:PORT/pg'   (use as CASHFREE_BASE)
 *   mock.checkoutUrl(id) → the pretend checkout page for an order
 */
export async function startMockCashfree({ secret }) {
  const orders = new Map();
  let base = '';

  const json = (res, status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => resolve(raw));
  });
  const view = (o) => ({ order_id: o.order_id, cf_order_id: o.cf_order_id, order_amount: o.order_amount, order_currency: o.order_currency, order_status: o.order_status });

  async function sendWebhook(o) {
    const raw = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      event_time: new Date().toISOString(),
      data: {
        order: { order_id: o.order_id, order_amount: o.order_amount, order_currency: o.order_currency },
        payment: { cf_payment_id: `pay_${o.cf_order_id}`, payment_status: 'SUCCESS', payment_amount: o.order_amount },
      },
    });
    const ts = String(Date.now());
    try {
      await fetch(o.order_meta.notify_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-timestamp': ts, 'x-webhook-signature': await signWebhook(raw, ts, secret) },
        body: raw,
      });
    } catch (e) {
      console.warn('[mock cashfree] webhook failed:', e.message);
    }
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'POST' && url.pathname === '/pg/orders') {
      if (req.headers['x-client-secret'] !== secret) return json(res, 401, { message: 'authentication Failed' });
      const body = JSON.parse(await readBody(req));
      if (!body.customer_details?.customer_phone) return json(res, 400, { message: 'customer_details.customer_phone : is missing in the request' });
      const o = { ...body, cf_order_id: String(orders.size + 1000), order_status: 'ACTIVE' };
      orders.set(o.order_id, o);
      return json(res, 200, { ...view(o), payment_session_id: `session_mock_${o.order_id}` });
    }
    const m = /^\/pg\/orders\/([^/]+)$/.exec(url.pathname);
    if (req.method === 'GET' && m) {
      const o = orders.get(decodeURIComponent(m[1]));
      return o ? json(res, 200, view(o)) : json(res, 404, { message: 'order not found' });
    }
    if (url.pathname === '/checkout') {
      const o = orders.get(url.searchParams.get('order_id'));
      if (!o) return json(res, 404, { message: 'order not found' });
      const back = o.order_meta.return_url.replace('{order_id}', o.order_id);
      if (req.method === 'POST') {
        const action = new URLSearchParams(await readBody(req)).get('action');
        if (action === 'pay') {
          o.order_status = 'PAID';
          await sendWebhook(o);
        }
        res.writeHead(303, { Location: back });
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`<!doctype html><meta charset="utf-8"><title>Mock Cashfree checkout</title>
<body style="font-family:system-ui;max-width:420px;margin:60px auto;padding:24px;border:1px solid #ccc;border-radius:12px">
<p style="color:#b45309;font-weight:600">TEST CHECKOUT — no real money moves</p>
<h1 style="font-size:22px">Pay ₹${o.order_amount}</h1><p>${o.order_note ?? ''}</p><p>Order ${o.order_id}</p>
<form method="post"><button name="action" value="pay" style="padding:10px 18px">Pay ₹${o.order_amount}</button>
<button name="action" value="cancel" style="padding:10px 18px;margin-left:8px">Cancel</button></form></body>`);
    }
    json(res, 404, { message: 'not found' });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  base = `${root}/pg`;
  return {
    base,
    checkoutUrl: (orderId) => `${root}/checkout?order_id=${encodeURIComponent(orderId)}`,
    orders,
    close: () => new Promise((r) => server.close(r)),
  };
}
