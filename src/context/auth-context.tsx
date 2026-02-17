import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";

const AUTH_TOKEN_KEY = "auth_token";

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

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(AUTH_TOKEN_KEY).then((token) => {
      if (!cancelled) {
        setHasBackendSession(!!token);
        setBackendCheckDone(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return authSessionNotifier.addListener(() => setHasBackendSession(false));
  }, []);

  const value: AuthContextValue = {
    hasBackendSession,
    isBackendCheckDone,
    setHasBackendSession,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
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

  return { isAuthenticated, isLoaded };
}
