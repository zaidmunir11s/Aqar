export const STORAGE_KEYS = {
  authToken: "auth_token",
  refreshToken: "refresh_token",
  /** Digits only, Saudi national without spaces (9 digits starting with 5, same as login field). */
  loggedInPhoneNumber: "logged_in_phone_number",
  /** Full display name from signup / login (persisted for profile + login welcome UI). */
  loggedInDisplayName: "logged_in_display_name",
  /** Local `file://` or remote `https://` profile photo from signup / API. */
  loggedInProfileImageUri: "logged_in_profile_image_uri",
  /**
   * JSON `{ phoneDigits, createdAtMs }` — "since" date for profile; reset when a different phone signs in.
   */
  accountProfileMeta: "account_profile_meta",
  /** Last app activity timestamp (ms) for "last seen" on profile ads. */
  lastActiveAtMs: "last_active_at_ms",
  /** JSON map of visited listing ids -> lastVisitedAtMs. */
  visitedListingIdsV1: "visited_listing_ids_v1",
  /** Monotonic sequence for local in-app published listings (fallback only). */
  localPublishedSequenceV1: "local_published_sequence_v1",
} as const;
