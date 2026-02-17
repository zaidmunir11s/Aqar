import {
    createApi,
    fetchBaseQuery,
    BaseQueryFn,
  } from "@reduxjs/toolkit/query/react";
  import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../../constants/api";
import { authSessionNotifier } from "../../context/auth-context";
  
  // Log the base URL for debugging
  console.log("API Base URL:", API_CONFIG.BASE_URL);
  
  const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      const token = await AsyncStorage.getItem("auth_token");
  
      console.log("Request Interceptor - Token:", token || "No token found");
  
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
        const refreshToken = await AsyncStorage.getItem("refresh_token");
  
        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: "/api/auth/refresh",
              method: "POST",
              body: { refreshToken },
            },
            api,
            extraOptions
          );
  
          if (refreshResult.data) {
            const newToken = (refreshResult.data as { token: string }).token;
            await AsyncStorage.setItem("auth_token", newToken);
  
            result = await baseQuery(args, api, extraOptions);
          } else {
            await AsyncStorage.multiRemove(["auth_token", "refresh_token"]);
            authSessionNotifier.notifySessionExpired();
          }
        } else {
          await AsyncStorage.removeItem("auth_token");
          authSessionNotifier.notifySessionExpired();
        }
      }
  
      if (status === 403) {
        console.warn("Access forbidden:", data);
      }
  
      if (status === 500) {
        console.error("Server error:", data);
      }
  
      if (status === "FETCH_ERROR" || status === "PARSING_ERROR") {
        console.error("Network error:", result.error);
        console.error("Attempted URL:", API_CONFIG.BASE_URL);
        console.error(
          "Full error details:",
          JSON.stringify(result.error, null, 2)
        );
      }
    }
  
    if (result.data) {
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
  