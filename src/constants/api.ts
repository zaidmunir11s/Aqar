import { Platform } from "react-native";

const isAndroid = Platform.OS === "android";

const DEV_API_BASE_URL = isAndroid
  ? "http://10.0.2.2:3000"
  : "http://localhost:3000";

export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "https://aqar-backend-xm31.vercel.app",
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
  },
} as const;
