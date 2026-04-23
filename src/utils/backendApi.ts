import { API_CONFIG } from "@/constants/api";
import { secureGet } from "@/utils/secureStore";
import { STORAGE_KEYS } from "@/constants/storage";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function backendRequest<T>(
  path: string,
  opts?: { method?: HttpMethod; body?: unknown }
): Promise<T> {
  const rawPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath = rawPath.startsWith("/api/") ? rawPath : `/api${rawPath}`;
  const url = `${API_CONFIG.BASE_URL}${normalizedPath}`;
  const token = await secureGet(STORAGE_KEYS.authToken);

  const res = await fetch(url, {
    method: opts?.method ?? "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...API_CONFIG.HEADERS,
      "Content-Type": "application/json",
    },
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}

