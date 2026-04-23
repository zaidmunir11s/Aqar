export const API_CONFIG = {
  BASE_URL:
    // process.env.EXPO_PUBLIC_API_BASE_URL ||
    // // "https://aqar-backend-xm31.vercel.app",
    // "http://localhost:3000",
    "http://192.168.50.69:3000",
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
