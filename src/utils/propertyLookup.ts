import type { Property } from "../types/property";
import { getPublishedListings } from "./publishedListingsStore";

let propertyByIdMap: Map<number, Property> | null = null;

const apiListingById = new Map<number, Property>();
const apiListingByServerId = new Map<string, Property>();

function buildPropertyMap(): Map<number, Property> {
  if (propertyByIdMap) return propertyByIdMap;
  propertyByIdMap = new Map();
  return propertyByIdMap;
}

/**
 * Register listings returned from the API so detail screens can resolve by id or server UUID.
 */
export function registerApiListingProperties(properties: Property[]): void {
  for (const p of properties) {
    apiListingById.set(p.id, p);
    if (p.serverListingId) {
      apiListingByServerId.set(p.serverListingId, p);
    }
  }
}

export function clearApiListingProperties(): void {
  apiListingById.clear();
  apiListingByServerId.clear();
}

export function getPropertyByServerListingId(
  serverId: string
): Property | undefined {
  return apiListingByServerId.get(serverId);
}

/**
 * O(1) lookup for property by ID. Uses in-memory Map cache (lazy-initialized).
 */
export function getPropertyById(id: number): Property | undefined {
  const published = getPublishedListings().find((p) => p.id === id);
  if (published) return published;
  const fromApi = apiListingById.get(id);
  if (fromApi) return fromApi;
  return buildPropertyMap().get(id);
}
