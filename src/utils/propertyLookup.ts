import type { Property } from "../types/property";
import { PROPERTY_DATA } from "../data/propertyData";

let propertyByIdMap: Map<number, Property> | null = null;

function buildPropertyMap(): Map<number, Property> {
  if (propertyByIdMap) return propertyByIdMap;
  propertyByIdMap = new Map();
  for (const p of PROPERTY_DATA) {
    propertyByIdMap.set(p.id, p);
  }
  return propertyByIdMap;
}

/**
 * O(1) lookup for property by ID. Uses in-memory Map cache (lazy-initialized).
 */
export function getPropertyById(id: number): Property | undefined {
  return buildPropertyMap().get(id);
}
