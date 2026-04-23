import {
    createApi,
    fetchBaseQuery,
    BaseQueryFn,
  } from "@reduxjs/toolkit/query/react";
  import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_CONFIG } from "../../constants/api";
import { STORAGE_KEYS } from "../../constants";
import { authSessionNotifier } from "../../context/auth-context";
import { secureGet, secureMultiRemove } from "@/utils/secureStore";
  
  const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await secureGet(STORAGE_KEYS.authToken);
  
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
  
      Object.entries(API_CONFIG.HEADERS).forEach(([key, value]) => {
        headers.set(key, value);
      });
  
      return headers;
    },
    timeout: API_CONFIG.TIMEOUT,
  });
  
  const baseQueryWithInterceptors: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
  
    if (result.error) {
      const { status, data } = result.error;
  
      if (status === 401) {
        // Backend does not expose a refresh endpoint in this project.
        // On auth failure, clear tokens and route through the existing
        // "session expired" flow.
        await secureMultiRemove([
          STORAGE_KEYS.authToken,
          STORAGE_KEYS.refreshToken,
          STORAGE_KEYS.loggedInPhoneNumber,
          STORAGE_KEYS.loggedInDisplayName,
          STORAGE_KEYS.loggedInProfileImageUri,
          STORAGE_KEYS.accountProfileMeta,
          STORAGE_KEYS.lastActiveAtMs,
        ]);
        authSessionNotifier.notifySessionExpired();
      }
  
      if (__DEV__) {
        if (status === 403) {
          console.warn("Access forbidden:", data);
        }
        if (status === 500) {
          console.error("Server error:", data);
        }
        if (status === "FETCH_ERROR" || status === "PARSING_ERROR") {
          console.error("Network error:", result.error);
        }
      }
    }
  
    return result;
  };
  
  export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithInterceptors,
    tagTypes: [
      "User",
      "Auth",
      "Property",
      "Booking",
      "Order",
      "Project",
      "Service",
    ],
    endpoints: () => ({}),
  });
  