"use client";

import { WEBSITE_ID, COMPANY_ID, makeSlug } from "./catalog-utils";

export const db = { __admin: true };
const qs = (params = {}) => new URLSearchParams({ websiteId: WEBSITE_ID, companyId: COMPANY_ID, ...params }).toString();

const cacheStore = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 60000; // 60 seconds

async function request(path, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === "GET";
  const cacheKey = path;

  if (isGet && !options.noCache) {
    const cached = cacheStore.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const r = await fetch(path, {
        ...options,
        cache: "no-store",
        headers: { Accept: "application/json", ...(options.headers || {}) }
      });
      const text = await r.text();
      let b;
      try { b = text ? JSON.parse(text) : null; } catch { b = text; }
      if (!r.ok || b?.success === false || b?.ok === false) {
        throw new Error(`API ${r.status}: ${typeof b === "string" ? b : JSON.stringify(b)}`);
      }
      if (isGet) {
        cacheStore.set(cacheKey, { data: b, timestamp: Date.now() });
      }
      return b;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export function doc(_db, ...parts) { return { __type: "doc", path: parts.join("/") }; }
export function collection(_db, ...parts) { return { __type: "collection", path: parts.join("/") }; }
export function query(ref, ...constraints) { return { ...ref, constraints }; }
export function limit(n) { return { type: "limit", value: n }; }
export function where(field, op, value) { return { type: "where", field, op, value }; }

export async function getDoc(ref) {
  const parts = String(ref?.path || "").split("/");
  const pages = parts.indexOf("pages");
  const districts = parts.indexOf("districts");

  if (pages >= 0 && parts[pages + 1]) {
    const j = await request(`/api/site-data?${qs({ type: parts[pages + 1], pageType: parts[pages + 1] })}`);
    const data = j?.data ?? j?.page ?? j;
    return { exists: () => !!data, data: () => data || {} };
  }
  if (districts >= 0 && parts[districts + 1]) {
    const j = await request(`/api/site-data?${qs({ type: "district", pageType: "district", district: parts[districts + 1] })}`);
    const data = j?.data ?? j;
    return { exists: () => !!data, data: () => data || {} };
  }
  if (parts.includes("products") || parts.includes("items")) {
    const j = await request(`/api/catalog?${qs()}`);
    const data = { products: j?.products ?? j?.data?.products ?? j?.data ?? [] };
    return { exists: () => true, data: () => data };
  }
  return { exists: () => false, data: () => ({}) };
}

export async function getDocs(ref) {
  const path = String(ref?.path || "");
  if (path.includes("categoryproducts") && path.endsWith("categories")) {
    const j = await request(`/api/catalog?${qs()}`);
    const cats = j?.categories ?? j?.data?.categories ?? [];
    return { empty: !cats.length, docs: cats.map((x, i) => ({ id: x.id || x.slug || `category-${i}`, data: () => x })) };
  }
  const j = await request(`/api/catalog?${qs()}`);
  const products = j?.products ?? j?.data?.products ?? j?.data ?? j;
  const arr = Array.isArray(products) ? products : [];
  return { empty: !arr.length, docs: arr.map((x, i) => ({ id: x.id || x.uid || x.slug || `product-${i}`, data: () => x })) };
}

export async function addDoc(ref, payload = {}) {
  const path = String(ref?.path || "");
  const endpoint = path.includes("productQueries") ? "/api/product-query" : "/api/contact-query";
  return request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ websiteId: WEBSITE_ID, companyId: COMPANY_ID, ...payload })
  });
}

export function onSnapshot(ref, onNext, onError) {
  let stopped = false;
  const run = async () => {
    try {
      const snap = ref?.__type === "doc" ? await getDoc(ref) : await getDocs(ref);
      if (!stopped) onNext(snap);
    } catch (e) {
      if (!stopped && onError) onError(e);
    }
  };
  run();
  const timer = setInterval(run, 60000);
  return () => { stopped = true; clearInterval(timer); };
}

export { makeSlug };

export function subscribeToCatalog(onUpdate, onError) {
  let stopped = false;
  const run = async () => {
    try {
      const response = await request(`/api/catalog?${qs()}`);
      const products = response?.products ?? response?.data?.products ?? response?.data ?? response;
      const snap = {
        empty: !Array.isArray(products) || products.length === 0,
        docs: Array.isArray(products) ? products.map((x, i) => ({ id: x.id || x.uid || x.slug || `product-${i}`, data: () => x })) : []
      };
      if (!stopped) onUpdate(snap);
    } catch (error) {
      if (!stopped && onError) onError(error);
    }
  };
  run();
  const timer = setInterval(run, 60000);
  return () => { stopped = true; clearInterval(timer); };
}
