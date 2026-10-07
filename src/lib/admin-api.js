import "server-only";
import { WEBSITE_ID, COMPANY_ID } from "./catalog-utils";

export const ADMIN_API_BASE_URL = (process.env.ADMIN_API_BASE_URL || process.env.ADMIN_API_URL || "https://admin.rajbiosis.app").replace(/\/+$/, "");

const serverCache = new Map();
const inFlightServer = new Map();
const SERVER_CACHE_TTL_MS = 60000; // 60s server cache

function buildUrl(pathname, params = {}) {
  const url = new URL(`${ADMIN_API_BASE_URL}${String(pathname || "").startsWith("/") ? pathname : `/${pathname}`}`);
  for (const [key, value] of Object.entries({ websiteId: WEBSITE_ID, companyId: COMPANY_ID, ...params })) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

export async function adminFetch(pathname, options = {}, params = {}) {
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const url = buildUrl(pathname, params).toString();

  if (isGet && !options.noCache) {
    const cached = serverCache.get(url);
    if (cached && (Date.now() - cached.timestamp < SERVER_CACHE_TTL_MS)) {
      return cached.data;
    }
    if (inFlightServer.has(url)) {
      return inFlightServer.get(url);
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        cache: "no-store",
        headers: { Accept: "application/json", ...(options.headers || {}) },
      });
      const text = await response.text();
      let body;
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      if (!response.ok || body?.success === false || body?.ok === false) {
        throw new Error(`Admin API ${response.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
      }
      if (isGet) {
        serverCache.set(url, { data: body, timestamp: Date.now() });
      }
      return body;
    } finally {
      inFlightServer.delete(url);
    }
  })();

  if (isGet) {
    inFlightServer.set(url, fetchPromise);
  }

  return fetchPromise;
}

export async function postAdminQuery(endpoint, payload = {}) {
  return adminFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ websiteId: WEBSITE_ID, companyId: COMPANY_ID, ...payload }),
  });
}

export async function fetchCatalogFromAdmin() {
  const j = await adminFetch("/api/catalog");
  const p = j?.products ?? j?.data?.products ?? j?.data ?? j;
  return Array.isArray(p) ? p : [];
}

export function clearServerCache() {
  serverCache.clear();
  inFlightServer.clear();
}
