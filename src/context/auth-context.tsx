import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import { STORAGE_KEYS } from "../constants";
import { secureGet, secureSet } from "@/utils/secureStore";
import { API_CONFIG } from "@/constants/api";

/** Notify listeners when backend session is invalidated (e.g. 401 + refresh failed). */
const sessionExpiredListeners: (() => void)[] = [];
export const authSessionNotifier = {
  notifySessionExpired() {
    sessionExpiredListeners.forEach((fn) => fn());
  },
  addListener(fn: () => void) {
    sessionExpiredListeners.push(fn);
    return () => {
      const i = sessionExpiredListeners.indexOf(fn);
      if (i !== -1) sessionExpiredListeners.splice(i, 1);
    };
  },
};

type AuthContextValue = {
  hasBackendSession: boolean;
  isBackendCheckDone: boolean;
  setHasBackendSession: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasBackendSession, setHasBackendSession] = useState(false);
  const [isBackendCheckDone, setBackendCheckDone] = useState(false);
  const { isSignedIn, isLoaded: clerkLoaded, getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;
    secureGet(STORAGE_KEYS.authToken)
      .then((token) => {
        if (!cancelled) {
          setHasBackendSession(!!token);
          setBackendCheckDone(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasBackendSession(false);
          setBackendCheckDone(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Ensure Clerk SSO sessions also have a backend JWT on this device.
  // Without this, public endpoints (like /api/listings) won't receive a userId,
  // so backend-personalized filters (e.g. hidden advertisers) won't apply.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!clerkLoaded || !isSignedIn) return;
      if (hasBackendSession) return;

      const existing = await secureGet(STORAGE_KEYS.authToken).catch(
        () => null,
      );
      if (existing) {
        if (!cancelled) setHasBackendSession(true);
        return;
      }

      const clerkToken =
        (await getToken({ template: "aqar-backend" }).catch(() => null)) ??
        (await getToken().catch(() => null));
      if (!clerkToken) return;

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/oauth`, {
          method: "POST",
          headers: { Authorization: `Bearer ${clerkToken}` },
        });
        const json = await res.json().catch(() => null);
        const backendToken = json?.data?.token;
        if (!res.ok || !backendToken) return;

        await secureSet(STORAGE_KEYS.authToken, backendToken);
        if (!cancelled) setHasBackendSession(true);
      } catch {
        // ignore; UI still works with Clerk-only session for non-personalized public endpoints
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clerkLoaded, getToken, hasBackendSession, isSignedIn]);

  useEffect(() => {
    return authSessionNotifier.addListener(() => setHasBackendSession(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      hasBackendSession,
      isBackendCheckDone,
      setHasBackendSession,
    }),
    [hasBackendSession, isBackendCheckDone],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}

/**
 * Combined auth state: signed in via Clerk (e.g. Google) OR via backend token (phone/password).
 * Use this for navigation and "show Profile vs Login" decisions.
 */
export function useIsAuthenticated(): {
  isAuthenticated: boolean;
  isLoaded: boolean;
} {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { hasBackendSession, isBackendCheckDone } = useAuthContext();

  const isAuthenticated = clerkLoaded && (isSignedIn || hasBackendSession);
  const isLoaded = clerkLoaded && isBackendCheckDone;

  return useMemo(
    () => ({ isAuthenticated, isLoaded }),
    [isAuthenticated, isLoaded],
  );
}
