/* Propline server: accounts, plans, bet sync, gated data, Stripe.
   Runs as one Netlify Function on /api/*. Storage: Netlify Blobs (store "propline").
   Env: STRIPE_SECRET_KEY (sk_test_… or sk_live_…), STRIPE_WEBHOOK_SECRET (whsec_…). Both optional:
   The owner (first account created) always switches plans for free; without a Stripe key nobody else can pay yet. */
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";
import DATA from "./slates.mjs";

export const config = { path: "/api/*" };

export const PLANS = {
  starter: { name: "Starter", price: 299, rank: 1 },
  plus:    { name: "Plus",    price: 699, rank: 2 },
  pro:     { name: "Pro",     price: 1299, rank: 3 },
};
const COOKIE = "pl_s", DAYS = 90;
const store = () => getStore({ name: "propline", consistency: "strong" });
const env = k => (globalThis.Netlify?.env?.get?.(k)) ?? process.env[k];
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store", ...h } });
const err = (msg, s = 400) => json({ error: msg }, s);
const normEmail = e => String(e || "").trim().toLowerCase();
const validEmail = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);
const b64u = b => Buffer.from(b).toString("base64url");

async function secret(S) {
  let c = await S.get("config", { type: "json" });
  if (!c || !c.secret) { c = { ...(c || {}), secret: crypto.randomBytes(32).toString("hex") }; await S.setJSON("config", c); }
  return c;
}
const sign = (data, key) => crypto.createHmac("sha256", key).update(data).digest("base64url");
async function makeCookie(S, email) {
  const { secret: key } = await secret(S);
  const body = b64u(JSON.stringify({ e: email, x: Date.now() + DAYS * 864e5 }));
  return `${COOKIE}=${body}.${sign(body, key)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${DAYS * 86400}`;
}
const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
async function session(req, S) {
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [body, mac] = m[1].split(".");
  if (!body || !mac) return null;
  const { secret: key } = await secret(S), good = sign(body, key);
  if (good.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(mac))) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p.x > Date.now() ? p.e : null; } catch { return null; }
}
const getUser = (S, email) => S.get("user:" + email, { type: "json" });
const putUser = (S, u) => S.setJSON("user:" + u.email, u);
const hashPw = (pw, salt) => new Promise((ok, no) => crypto.scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => e ? no(e) : ok(k.toString("hex"))));

function activeTier(u) {
  if (!u) return null;
  if (u.preview && PLANS[u.preview]) return u.preview;          // owner switching plans for free
  if (u.tier && PLANS[u.tier] && ["active", "trialing", "past_due"].includes(u.status)) return u.tier;
  return null;
}
async function me(S, u) {
  const c = await secret(S);
  return { email: u.email, tier: activeTier(u), status: u.status || null, owner: c.owner === u.email, payments: !!env("STRIPE_SECRET_KEY"),
    test: String(env("STRIPE_SECRET_KEY") || "").startsWith("sk_test_"), billing: !!u.customer, plans: PLANS };
}

/* Stripe over plain HTTPS, no SDK */
function form(o, pre = "", out = []) {
  for (const [k, v] of Object.entries(o)) {
    const key = pre ? `${pre}[${k}]` : k;
    if (v && typeof v === "object") form(v, key, out); else if (v != null) out.push(encodeURIComponent(key) + "=" + encodeURIComponent(v));
  }
  return out.join("&");
}
async function stripe(path, body, method) {
  const r = await fetch("https://api.stripe.com/v1/" + path, { method: method || (body ? "POST" : "GET"),
    headers: { authorization: "Bearer " + env("STRIPE_SECRET_KEY"), "content-type": "application/x-www-form-urlencoded" }, body: body ? form(body) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "Stripe error");
  return j;
}
async function priceFor(tier) {          // one monthly price per plan, found by lookup key or created once
  const key = "propline_" + tier + "_monthly", found = await stripe("prices?lookup_keys[]=" + key + "&active=true");
  if (found.data?.length) return found.data[0].id;
  const p = await stripe("prices", { currency: "eur", unit_amount: PLANS[tier].price, lookup_key: key, recurring: { interval: "month" }, product_data: { name: "Propline " + PLANS[tier].name } });
  return p.id;
}
function applySub(u, sub) {
  u.sub = sub.id; u.customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id; u.status = sub.status;
  const t = sub.metadata?.tier; if (PLANS[t]) u.tier = t;
  if (["canceled", "incomplete_expired", "unpaid"].includes(sub.status)) u.tier = null;
}
function verifyStripe(raw, header, whsec) {
  const parts = Object.fromEntries((header || "").split(",").map(x => x.split("=")));
  const sigs = (header || "").split(",").filter(x => x.startsWith("v1=")).map(x => x.slice(3));
  if (!parts.t || !sigs.length || Math.abs(Date.now() / 1000 - +parts.t) > 300) return false;
  const good = crypto.createHmac("sha256", whsec).update(parts.t + "." + raw).digest("hex");
  return sigs.some(s => s.length === good.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good)));
}

export default async (req) => {
  const url = new URL(req.url), route = url.pathname.replace(/^\/api\//, ""), S = store(), M = req.method;
  try {
    if (route === "stripe-webhook" && M === "POST") {
      const raw = await req.text(), whsec = env("STRIPE_WEBHOOK_SECRET");
      if (!whsec || !verifyStripe(raw, req.headers.get("stripe-signature"), whsec)) return err("Bad signature", 400);
      const ev = JSON.parse(raw), o = ev.data?.object || {};
      if (ev.type?.startsWith("customer.subscription.")) {
        const email = normEmail(o.metadata?.email), u = email && await getUser(S, email);
        if (u && (!u.sub || u.sub === o.id || ev.type === "customer.subscription.created")) { applySub(u, o); await putUser(S, u); }
      }
      return json({ ok: true });
    }
    if (M === "POST") {                                   // same-site requests only
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).host !== url.host) return err("Wrong origin", 403);
    }
    if ((route === "register" || route === "login") && M === "POST") {
      const b = await req.json().catch(() => ({})), email = normEmail(b.email), pw = String(b.password || "");
      if (!validEmail(email)) return err("Type a valid email");
      if (pw.length < 8 || pw.length > 200) return err("Password needs at least 8 characters");
      let u = await getUser(S, email);
      if (route === "register") {
        if (u) return err("There's already an account with this email. Sign in instead.", 409);
        const salt = crypto.randomBytes(16).toString("hex");
        u = { email, salt, hash: await hashPw(pw, salt), created: Date.now(), tier: null, status: null };
        await putUser(S, u);
        const c = await secret(S); if (!c.owner) { c.owner = email; await S.setJSON("config", c); }
      } else {
        if (!u) return err("Email or password is wrong", 401);
        if (u.lockUntil && u.lockUntil > Date.now()) return err("Too many tries. Wait 15 minutes.", 429);
        const h = await hashPw(pw, u.salt);
        if (!crypto.timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(u.hash, "hex"))) {
          u.fails = (u.fails || 0) + 1; if (u.fails >= 10) { u.lockUntil = Date.now() + 15 * 6e4; u.fails = 0; }
          await putUser(S, u); return err("Email or password is wrong", 401);
        }
        if (u.fails || u.lockUntil) { u.fails = 0; u.lockUntil = 0; await putUser(S, u); }
      }
      return json(await me(S, u), 200, { "set-cookie": await makeCookie(S, email) });
    }
    if (route === "logout" && M === "POST") return json({ ok: true }, 200, { "set-cookie": clearCookie });

    const email = await session(req, S), u = email && await getUser(S, email);
    if (route === "data.js") {
      const t = activeTier(u);
      return new Response(t ? DATA : "window.LOCKED=1;", { status: t ? 200 : 401, headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "private, no-store" } });
    }
    if (!u) return err("Sign in first", 401);
    if (route === "me" && M === "GET") return json(await me(S, u));
    if (route === "bets" && M === "GET") return json((await S.get("bets:" + email, { type: "json" })) || { bets: [], del: [], at: 0 });
    if (route === "bets" && M === "PUT") {
      const b = await req.json().catch(() => null);
      if (!b || !Array.isArray(b.bets) || b.bets.length > 5000) return err("Bad bets");
      const rec = { bets: b.bets, del: (Array.isArray(b.del) ? b.del : []).slice(-5000), at: Date.now() };
      await S.setJSON("bets:" + email, rec); return json({ at: rec.at });
    }
    if (route === "checkout" && M === "POST") {
      const { tier } = await req.json().catch(() => ({}));
      if (!PLANS[tier]) return err("Pick a plan");
      const c = await secret(S);
      if (c.owner === email) { u.preview = tier; await putUser(S, u); return json({ preview: true }); }
      if (!env("STRIPE_SECRET_KEY")) return err("Payments are not open yet", 503);
      const price = await priceFor(tier);
      if (u.sub && activeTier(u)) {                         // already paying: switch plan with proration
        const sub = await stripe("subscriptions/" + u.sub);
        const upd = await stripe("subscriptions/" + u.sub, { items: { 0: { id: sub.items.data[0].id, price } }, proration_behavior: "create_prorations", metadata: { email, tier } });
        applySub(u, upd); await putUser(S, u); return json({ switched: true });
      }
      const origin = url.origin;
      const s = await stripe("checkout/sessions", { mode: "subscription", line_items: { 0: { price, quantity: 1 } }, client_reference_id: email,
        ...(u.customer ? { customer: u.customer } : { customer_email: email }), subscription_data: { metadata: { email, tier } }, metadata: { email, tier },
        success_url: origin + "/?checkout=done&session_id={CHECKOUT_SESSION_ID}", cancel_url: origin + "/?checkout=cancel", allow_promotion_codes: "true" });
      return json({ url: s.url });
    }
    if (route === "checkout-verify" && M === "POST") {
      const { session_id } = await req.json().catch(() => ({}));
      if (!/^cs_[A-Za-z0-9_]+$/.test(session_id || "")) return err("Bad session");
      const s = await stripe("checkout/sessions/" + session_id + "?expand[]=subscription");
      if (s.client_reference_id !== email) return err("Not your checkout", 403);
      if (s.status === "complete" && s.subscription) { applySub(u, s.subscription); await putUser(S, u); }
      return json(await me(S, u));
    }
    if (route === "portal" && M === "POST") {
      if (!u.customer) return err("No billing yet");
      const p = await stripe("billing_portal/sessions", { customer: u.customer, return_url: url.origin + "/" });
      return json({ url: p.url });
    }
    if (route === "password" && M === "POST") {
      const b = await req.json().catch(() => ({})), old = String(b.old || ""), pw = String(b.password || "");
      if (pw.length < 8) return err("Password needs at least 8 characters");
      if (!crypto.timingSafeEqual(Buffer.from(await hashPw(old, u.salt), "hex"), Buffer.from(u.hash, "hex"))) return err("Current password is wrong", 401);
      u.salt = crypto.randomBytes(16).toString("hex"); u.hash = await hashPw(pw, u.salt); await putUser(S, u); return json({ ok: true });
    }
    if (route === "delete" && M === "POST") {
      const b = await req.json().catch(() => ({}));
      if (!crypto.timingSafeEqual(Buffer.from(await hashPw(String(b.password || ""), u.salt), "hex"), Buffer.from(u.hash, "hex"))) return err("Password is wrong", 401);
      if (u.sub && env("STRIPE_SECRET_KEY")) { try { await stripe("subscriptions/" + u.sub, null, "DELETE"); } catch {} }
      await S.delete("user:" + email); await S.delete("bets:" + email);
      return json({ ok: true }, 200, { "set-cookie": clearCookie });
    }
    return err("Not found", 404);
  } catch (e) {
    console.error(e); return err(e.message || "Server error", 500);
  }
};
