// Reads a Skyline QR share link. Mirrors ShareLink.kt and the identity in skylineqr-core, so the
// page shows the same city code the app does.
(function (root) {
  const TIMES = ['Now', 'Dawn', 'Day', 'Dusk', 'Night'];
  const WEATHERS = ['Clear', 'Rain', 'Haze', 'Storm'];
  const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const TRACKING = new Set(['_ga', '_gl', 'fbclid', 'gclid', 'msclkid']);

  /** The city in a page's query string, or null if it holds none this page can read. */
  function decode(search) {
    const value = new URLSearchParams(search).get('c');
    if (!value) return null;
    let binary;
    try {
      binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (e) {
      return null;
    }
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    if (bytes.length < 4 || bytes[0] !== 1) return null;
    const packed = bytes[2];
    let url;
    try {
      url = new URL(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(3)));
    } catch (e) {
      return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return {
      url: url.href,
      generatorVersion: bytes[1],
      scope: packed >> 7 ? 'url' : 'site',
      time: TIMES[(packed >> 2) & 7] || 'Now',
      weather: WEATHERS[packed & 3],
    };
  }

  function fnv1a(text) {
    let h = 0x811c9dc5 | 0;
    for (const b of new TextEncoder().encode(text)) {
      h ^= b;
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /** Crockford-style base 32, lowest bits first, six characters: the app's city code. */
  function code(seed) {
    let v = seed >>> 0;
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += ALPHABET[v & 31];
      v >>>= 5;
    }
    return out;
  }

  function isTracking(key) {
    return key.startsWith('utm_') || TRACKING.has(key);
  }

  function identityKey(link, scope) {
    const u = new URL(link);
    if (scope === 'site') return 'site:' + u.hostname.replace(/^www\./, '');
    const keyOf = (p) => p.split('=')[0];
    const kept = u.search
      .slice(1)
      .split('&')
      .filter((p) => p && !isTracking(keyOf(p).toLowerCase()))
      .sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : keyOf(a) > keyOf(b) ? 1 : 0));
    return 'url:' + u.protocol + '//' + u.host + u.pathname + (kept.length ? '?' + kept.join('&') : '');
  }

  function cityCode(link, scope) {
    return code(fnv1a('skylineqr:' + identityKey(link, scope)));
  }

  const api = { decode, cityCode };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Skyline = api;
})(this);
