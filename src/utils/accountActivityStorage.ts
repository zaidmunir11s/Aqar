import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

export type AccountProfileMeta = {
  phoneDigits: string;
  createdAtMs: number;
};

function normalizePhone(d: string): string {
  return d.replace(/\D/g, "");
}

/** Call after successful auth with the logged-in phone (digits). Preserves createdAt for same phone; new phone gets a new createdAt. */
export async function syncAccountProfileMetaOnAuth(phoneDigits: string): Promise<void> {
  const d = normalizePhone(phoneDigits);
  if (d.length === 0) return;
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.accountProfileMeta);
  let existing: AccountProfileMeta | null = null;
  if (raw) {
    try {
      const p = JSON.parse(raw) as AccountProfileMeta;
      if (p && typeof p.phoneDigits === "string" && typeof p.createdAtMs === "number") {
        existing = p;
      }
    } catch {
      existing = null;
    }
  }
  if (existing?.phoneDigits === d) {
    return;
  }
  const next: AccountProfileMeta = { phoneDigits: d, createdAtMs: Date.now() };
  await AsyncStorage.setItem(STORAGE_KEYS.accountProfileMeta, JSON.stringify(next));
}

export async function getAccountProfileMeta(): Promise<AccountProfileMeta | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.accountProfileMeta);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as AccountProfileMeta;
    if (p && typeof p.phoneDigits === "string" && typeof p.createdAtMs === "number") {
      return p;
    }
  } catch {
    return null;
  }
  return null;
}

export async function touchLastActiveAt(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.lastActiveAtMs, String(Date.now()));
}

export async function getLastActiveAtMs(): Promise<number | null> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.lastActiveAtMs);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function formatProfileSinceDate(createdAtMs: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(createdAtMs));
  } catch {
    return new Date(createdAtMs).toLocaleDateString();
  }
}

export function formatProfileLastSeen(
  lastActiveMs: number,
  locale: string,
  nowLabel: string
): string {
  const diffSec = Math.floor((Date.now() - lastActiveMs) / 1000);
  if (diffSec < 60) {
    return nowLabel;
  }
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (diffSec < 3600) {
      return rtf.format(-Math.floor(diffSec / 60), "minute");
    }
    if (diffSec < 86400) {
      return rtf.format(-Math.floor(diffSec / 3600), "hour");
    }
    if (diffSec < 86400 * 7) {
      return rtf.format(-Math.floor(diffSec / 86400), "day");
    }
    return rtf.format(-Math.floor(diffSec / (86400 * 7)), "week");
  } catch {
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
    return `${Math.floor(diffSec / 86400)}d`;
  }
}
