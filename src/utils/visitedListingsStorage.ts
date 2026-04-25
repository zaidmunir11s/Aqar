import { STORAGE_KEYS } from "@/constants/storage";
import { secureGet, secureSet } from "@/utils/secureStore";

type VisitedMap = Record<string, number>;

function safeParseVisited(raw: string | null): VisitedMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: VisitedMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export async function loadVisitedListingIdsSet(
  maxAgeMs: number,
): Promise<Set<number>> {
  const raw = await secureGet(STORAGE_KEYS.visitedListingIdsV1);
  const map = safeParseVisited(raw);
  const now = Date.now();
  const out = new Set<number>();
  for (const [k, ts] of Object.entries(map)) {
    const id = Number(k);
    if (!Number.isFinite(id) || id <= 0) continue;
    if (now - ts <= maxAgeMs) out.add(id);
  }
  return out;
}

export async function markListingVisited(id: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) return;
  const raw = await secureGet(STORAGE_KEYS.visitedListingIdsV1);
  const map = safeParseVisited(raw);
  map[String(id)] = Date.now();
  await secureSet(STORAGE_KEYS.visitedListingIdsV1, JSON.stringify(map));
}
