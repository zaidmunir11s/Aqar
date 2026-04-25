export function parseBackendDateMs(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Common formats we see from Prisma/Postgres:
  // - "2026-04-15T11:40:55.083Z" (ISO)
  // - "2026-04-15 11:40:55.083" (space instead of 'T', no timezone)
  // - "2026-04-15 11:40:55.083+00" (space + tz)
  //
  // JS Date parsing is inconsistent across platforms for the non-ISO variants,
  // so normalize first.
  const normalized = s.includes("T") ? s : s.replace(" ", "T");

  // If there is no timezone marker, assume UTC to keep ordering consistent.
  const hasTz = /[zZ]|[+-]\d{2}(:?\d{2})?$/.test(normalized);
  const iso = hasTz ? normalized : `${normalized}Z`;

  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}
