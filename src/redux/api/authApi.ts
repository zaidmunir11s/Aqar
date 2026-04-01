import type {
  BaseQueryFn,
  EndpointBuilder,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { FetchArgs } from "@reduxjs/toolkit/query";
import { baseApi } from "@/redux/api/baseApi";
import { API_ENDPOINTS } from "@/constants/api";

type BaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;
type ApiTagTypes =
  | "User"
  | "Auth"
  | "Property"
  | "Booking"
  | "Order"
  | "Project"
  | "Service";

export interface SignupRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  profileImage?: string;
  [key: string]: unknown;
}

/**
 * Signup API response. `otp` / `verificationCode` must not be returned in production:
 * codes belong in SMS only. The app surfaces them in dev (`__DEV__`) for local testing.
 */
export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
    };
    token: string;
    refreshToken?: string;
    otp?: string;
    verificationCode?: string;
  };
  otp?: string;
  verificationCode?: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
  [key: string]: unknown;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      /** Avatar URL when backend returns it after login */
      profileImageUrl?: string;
    };
    token: string;
    refreshToken?: string;
  };
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  [key: string]: unknown;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
    token: string;
    refreshToken?: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQuery, ApiTagTypes, "api">) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.SIGNUP,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_OTP,
        method: "POST",
        body: {
          phoneNumber: body.phoneNumber,
          otp: body.otp,
          code: body.otp, // many backends expect "code"
        },
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  // Helps with HMR / duplicate imports during development.
  // Without this, RTK Query throws when the same endpointName is injected twice.
  overrideExisting: true,
});

export const { useSignupMutation, useLoginMutation, useVerifyOtpMutation } =
  authApi;
