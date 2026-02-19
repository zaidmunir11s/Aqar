import {
    createApi,
    fetchBaseQuery,
    BaseQueryFn,
  } from "@reduxjs/toolkit/query/react";
  import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../../constants/api";
import { authSessionNotifier } from "../../context/auth-context";
  
  if (__DEV__) {
    console.log("API Base URL:", API_CONFIG.BASE_URL);
  }
  
  const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      const token = await AsyncStorage.getItem("auth_token");
  
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
  