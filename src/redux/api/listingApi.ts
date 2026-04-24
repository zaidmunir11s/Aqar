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

export type PublicListingsQuery = {
  page?: number;
  limit?: number;
  listingType?: "RENT" | "SALE";
  propertyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
};

export type CreateListingRequest = {
  listing: {
    title: string;
    description?: string;
    price: number;
    priceType: "NIGHTLY" | "MONTHLY" | "YEARLY";
    listingType: "RENT" | "SALE";
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    areaUnit: "SQM" | "SQFT";
    latitude: number;
    longitude: number;
    city?: string;
    media?: { url: string; order: number; kind?: "PHOTO" | "VIDEO" }[];
    metadata?: Record<string, unknown>;
  };
  deed?: {
    deedType: "ELECTRONIC" | "OTHER";
    deedNumber?: string;
    ownerIdNumber?: string;
    ownerBirthDate?: string;
    ownerPhone?: string;
  };
};

export type UpdateListingRequest = {
  id: string;
  body: Partial<{
    title: string;
    description: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    city: string;
    status: "PENDING" | "ACTIVE" | "REJECTED" | "ARCHIVED";
  }>;
};

type SuccessEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQuery, ApiTagTypes, "api">) => ({
    getPublicListings: builder.query<
      { listings: ApiListingDto[] },
      PublicListingsQuery | void
    >({
      query: (params) => ({
        url: "/api/listings",
        params: params ?? {},
      }),
      transformResponse: (
        response: SuccessEnvelope<{ listings: ApiListingDto[] }>
      ) => ({
        listings: response?.data?.listings ?? [],
      }),
      providesTags: (result) =>
        result?.listings?.length
          ? [
              ...result.listings.map((l) => ({
                type: "Property" as const,
                id: l.id,
              })),
              { type: "Property", id: "LIST" },
            ]
          : [{ type: "Property", id: "LIST" }],
    }),

    getPublicListingById: builder.query<ApiListingDto, string>({
      query: (id) => `/api/listings/${id}`,
      transformResponse: (response: SuccessEnvelope<ApiListingDto>) => {
        const row = response?.data;
        if (!row) {
          throw new Error("Listing not found");
        }
        return row;
      },
      providesTags: (_result, _err, id) => [{ type: "Property", id }],
    }),

    getMyListings: builder.query<{ listings: ApiListingDto[] }, void>({
      query: () => "/api/listings/my",
      transformResponse: (
        response: SuccessEnvelope<{ listings: ApiListingDto[] }>
      ) => ({
        listings: response?.data?.listings ?? [],
      }),
      providesTags: [{ type: "Property", id: "MINE" }],
    }),

    getNearestListings: builder.query<
      { listings: ApiListingDto[] },
      { lat: number; lng: number; limit?: number }
    >({
      query: ({ lat, lng, limit }) => ({
        url: "/api/listings/nearest",
        params: {
          lat,
          lng,
          ...(limit != null ? { limit } : {}),
        },
      }),
      transformResponse: (
        response: SuccessEnvelope<{ listings: ApiListingDto[] }>
      ) => ({
        listings: response?.data?.listings ?? [],
      }),
    }),

    createListing: builder.mutation<
      ApiListingDto,
      CreateListingRequest
    >({
      query: (body) => ({
        url: "/api/listings",
        method: "POST",
        body,
      }),
      transformResponse: (response: SuccessEnvelope<ApiListingDto>) => {
        const row = response?.data;
        if (!row) {
          throw new Error("Invalid create listing response");
        }
        return row;
      },
      invalidatesTags: [{ type: "Property", id: "LIST" }, { type: "Property", id: "MINE" }],
    }),

    updateListing: builder.mutation<ApiListingDto, UpdateListingRequest>({
      query: ({ id, body }) => ({
        url: `/api/listings/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: SuccessEnvelope<ApiListingDto>) => {
        const row = response?.data;
        if (!row) {
          throw new Error("Invalid update listing response");
        }
        return row;
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: "Property", id: arg.id },
        { type: "Property", id: "LIST" },
        { type: "Property", id: "MINE" },
      ],
    }),

    deleteListing: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/listings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Property", id: arg.id },
        { type: "Property", id: "LIST" },
        { type: "Property", id: "MINE" },
      ],
    }),

    reportListing: builder.mutation<void, { listingId: string; reason: string; details?: string | null }>({
      query: ({ listingId, reason, details }) => ({
        url: `/api/listings/${listingId}/report`,
        method: "POST",
        body: { reason, ...(details != null ? { details } : {}) },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPublicListingsQuery,
  useGetPublicListingByIdQuery,
  useLazyGetPublicListingByIdQuery,
  useGetMyListingsQuery,
  useGetNearestListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useReportListingMutation,
} = listingApi;
