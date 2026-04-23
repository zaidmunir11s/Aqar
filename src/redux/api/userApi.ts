import type {
  BaseQueryFn,
  EndpointBuilder,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { FetchArgs } from "@reduxjs/toolkit/query";
import { baseApi } from "@/redux/api/baseApi";
import type { ApiListingDto } from "@/utils/apiListingMapper";

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

export type MeUser = {
  id: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio?: string | null;
  email: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  clerkId?: string | null;
  hasPassword?: boolean;
  hasPhoneNumber?: boolean;
  isSso?: boolean;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio?: string | null;
  createdAt: string;
};

type SuccessEnvelope<T> = {
  success?: boolean;
  data?: T;
};

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQuery, ApiTagTypes, "api">) => ({
    getMe: builder.query<{ user: MeUser }, void>({
      query: () => "/api/me",
      transformResponse: (response: SuccessEnvelope<{ user: MeUser }>) => {
        const user = response?.data?.user;
        if (!user) {
          throw new Error("Not authenticated");
        }
        return { user };
      },
      providesTags: ["User"],
    }),
    updateMe: builder.mutation<{ user: MeUser }, Partial<Pick<MeUser, "firstName" | "lastName" | "email" | "profileImage" | "bio">>>({
      query: (body) => ({
        url: "/api/me",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: SuccessEnvelope<{ user: MeUser }>) => {
        const user = response?.data?.user;
        if (!user) throw new Error("Profile update failed");
        return { user };
      },
      invalidatesTags: ["User"],
    }),
    changeMyPassword: builder.mutation<void, { oldPassword: string; newPassword: string }>({
      query: (body) => ({
        url: "/api/me/password",
        method: "POST",
        body,
      }),
    }),
    requestPhoneChangeOtp: builder.mutation<{ otp?: string }, { phoneNumber: string }>({
      query: (body) => ({
        url: "/api/me/phone/request-otp",
        method: "POST",
        body,
      }),
      transformResponse: (response: SuccessEnvelope<{ otp?: string }>) => response?.data ?? {},
    }),
    confirmPhoneChange: builder.mutation<{ user: MeUser }, { phoneNumber: string; code: string }>({
      query: (body) => ({
        url: "/api/me/phone/confirm",
        method: "POST",
        body,
      }),
      transformResponse: (response: SuccessEnvelope<{ user: MeUser }>) => {
        const user = response?.data?.user;
        if (!user) throw new Error("Phone update failed");
        return { user };
      },
      invalidatesTags: ["User"],
    }),

    getPublicUserById: builder.query<{ user: PublicUser }, string>({
      query: (id) => `/api/users/${encodeURIComponent(id)}`,
      transformResponse: (response: SuccessEnvelope<{ user: PublicUser }>) => {
        const user = response?.data?.user;
        if (!user) throw new Error("User not found");
        return { user };
      },
    }),

    getPublicUserListings: builder.query<{ listings: ApiListingDto[] }, string>({
      query: (id) => `/api/users/${encodeURIComponent(id)}/listings`,
      transformResponse: (
        response: SuccessEnvelope<{ listings: ApiListingDto[] }>
      ) => ({
        listings: response?.data?.listings ?? [],
      }),
      providesTags: [{ type: "Property", id: "LIST" }],
    }),

    hideAdvertiser: builder.mutation<void, { advertiserId: string }>({
      query: ({ advertiserId }) => ({
        url: `/api/me/hidden-advertisers/${encodeURIComponent(advertiserId)}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Property", id: "LIST" }],
    }),

    unhideAdvertiser: builder.mutation<void, { advertiserId: string }>({
      query: ({ advertiserId }) => ({
        url: `/api/me/hidden-advertisers/${encodeURIComponent(advertiserId)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Property", id: "LIST" }],
    }),

    reportAdvertiser: builder.mutation<
      void,
      { advertiserId: string; reason: string; details?: string | null }
    >({
      query: ({ advertiserId, reason, details }) => ({
        url: `/api/advertisers/${encodeURIComponent(advertiserId)}/report`,
        method: "POST",
        body: { reason, ...(details != null ? { details } : {}) },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useChangeMyPasswordMutation,
  useRequestPhoneChangeOtpMutation,
  useConfirmPhoneChangeMutation,
  useGetPublicUserByIdQuery,
  useGetPublicUserListingsQuery,
  useHideAdvertiserMutation,
  useUnhideAdvertiserMutation,
  useReportAdvertiserMutation,
} = userApi;
