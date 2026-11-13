/**
 * Vercel serverless function: receives anonymous landing-page events from the
 * browser and forwards them to Axiom.
 *
 * The Axiom token lives ONLY in server-side environment variables, so it is
 * never shipped to the browser.
 *
 * Required env vars (Vercel -> Project -> Settings -> Environment Variables):
 *   AXIOM_TOKEN      Ingest-only API token scoped to the dataset below
 *   AXIOM_DATASET    Dataset name, e.g. "fleet-landing"
 * Optional:
 *   AXIOM_URL        Defaults to https://api.axiom.co (EU edge: https://eu-central-1.aws.edge.axiom.co)
 *   ANALYTICS_SALT   Extra secret mixed into the visitor hash
 */
import { createHash } from 'crypto';

type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  end: () => void;
  setHeader: (k: string, v: string) => void;
};

const ALLOWED_EVENTS = new Set(['landing_page_view', 'landing_cta_click']);
const MAX_STR = 300;

const header = (req: Req, name: string): string => {
  const v = req.headers[name];
  return (Array.isArray(v) ? v[0] : v) ?? '';
};

const clip = (v: unknown, max = MAX_STR): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v.slice(0, max) : undefined;

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python-requests/i;

function parseUserAgent(ua: string) {
  const browser = /edg\//i.test(ua) ? 'Edge'
    : /chrome|crios/i.test(ua) ? 'Chrome'
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari'
    : 'Other';
  const os = /windows/i.test(ua) ? 'Windows'
    : /android/i.test(ua) ? 'Android'
    : /iphone|ipad|ios/i.test(ua) ? 'iOS'
    : /mac os/i.test(ua) ? 'macOS'
    : /linux/i.test(ua) ? 'Linux'
    : 'Other';
  const device = /mobile|iphone|android/i.test(ua) ? 'mobile' : /ipad|tablet/i.test(ua) ? 'tablet' : 'desktop';
  return { browser, os, device };
}

/** Daily-rotating, salted hash: lets us count unique visitors per day without storing IPs. */
function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256')
    .update(`${process.env.ANALYTICS_SALT ?? ''}|${day}|${ip}|${ua}`)
    .digest('hex')
    .slice(0, 24);
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const token = process.env.AXIOM_TOKEN;
  const dataset = process.env.AXIOM_DATASET;
  if (!token || !dataset) {
    // Misconfigured: don't break the page, just report.
    return res.status(503).json({ ok: false, error: 'analytics_not_configured' });
  }

  // Same-origin only (the browser sends Origin on POST).
  const origin = header(req, 'origin');
  const host = header(req, 'host');
  if (origin && host && new URL(origin).host !== host) {
    return res.status(403).json({ ok: false });
  }

  const ua = header(req, 'user-agent');
  if (!ua || BOT_RE.test(ua)) {
    return res.status(204).end();
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as Record<string, unknown> | undefined;
  const event = clip(body?.event, 40);
  if (!body || !event || !ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ ok: false });
  }

  const ip = header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip');
  const { browser, os, device } = parseUserAgent(ua);
  const decode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

  const record = {
    _time: new Date().toISOString(),
    event,
    app: 'fleet-frontend',
    page: clip(body.path, 200),
    referrer: clip(body.referrer, 300),
    utm_source: clip(body.utm_source, 100),
    utm_medium: clip(body.utm_medium, 100),
    utm_campaign: clip(body.utm_campaign, 100),
    cta: clip(body.cta, 60),
    session_id: clip(body.sessionId, 64),
    visitor: visitorHash(ip, ua),
    country: header(req, 'x-vercel-ip-country') || undefined,
    region: decode(header(req, 'x-vercel-ip-country-region')) || undefined,
    city: decode(header(req, 'x-vercel-ip-city')) || undefined,
    browser,
    os,
    device,
    language: clip(body.language, 20),
    timezone: clip(body.timezone, 60),
    screen: clip(body.screen, 20),
    env: process.env.VERCEL_ENV ?? 'unknown',
  };

  try {
    const base = (process.env.AXIOM_URL ?? 'https://api.axiom.co').replace(/\/$/, '');
    // Regional edge domains use /v1/ingest/{dataset}; api.axiom.co uses /v1/datasets/{dataset}/ingest.
    const ds = encodeURIComponent(dataset);
    const path = base.includes('.edge.axiom.co') ? `/v1/ingest/${ds}` : `/v1/datasets/${ds}/ingest`;
    const r = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([record]),
    });
    if (!r.ok) return res.status(502).json({ ok: false });
    return res.status(202).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false });
  }
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s); } catch { return undefined; }
}
