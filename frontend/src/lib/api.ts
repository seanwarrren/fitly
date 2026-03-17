/**
 * Centralized API helper — all backend calls go through here.
 *
 * The base URL comes from the NEXT_PUBLIC_API_BASE_URL env var
 * so it can differ between local dev and production.
 *
 * IMPORTANT: NEXT_PUBLIC_* vars are inlined at BUILD TIME by Next.js.
 * The env var must be set before running `npm run build`.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.error(
    "[fit.ly] NEXT_PUBLIC_API_BASE_URL is not set. " +
      "API calls will fail. Set this env var and rebuild.",
  );
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { method: "POST", body: formData });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
