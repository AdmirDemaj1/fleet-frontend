/**
 * Minimal, cookie-free analytics client.
 * Events go to our own /api/track function, which forwards them to Axiom
 * (the Axiom token never reaches the browser).
 */
const ENDPOINT = '/api/track';
const SESSION_KEY = 'fc_sid';

export type TrackEvent = 'landing_page_view' | 'landing_cta_click';

const analyticsEnabled = (): boolean => {
  if (!import.meta.env.PROD) return false; // no /api/track function in local dev
  if (import.meta.env.VITE_ANALYTICS_ENABLED === 'false') return false;
  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return false; // respect DNT
  return true;
};

/** Random per-tab id (sessionStorage), no cookies, no cross-site identity. */
const getSessionId = (): string => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'unknown';
  }
};

export const track = (event: TrackEvent, props: Record<string, string | undefined> = {}): void => {
  if (!analyticsEnabled()) return;
  const params = new URLSearchParams(window.location.search);
  const payload = {
    event,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get('utm_source') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_campaign: params.get('utm_campaign') ?? undefined,
    sessionId: getSessionId(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    ...props,
  };
  try {
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the page */
  }
};
