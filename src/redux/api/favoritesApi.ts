import type {
  BaseQueryFn,
  EndpointBuilder,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query";
import { baseApi } from "@/redux/api/baseApi";
import type { ApiListingDto } from "@/utils/apiListingMapper";

type BaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
type ApiTagTypes =
  | "User"
  | "Auth"
  | "Property"
  | "Booking"
  | "Order"
  | "Project"
  | "Service";

type FavoriteRow = {
  userId: string;
  listingId: string;
  createdAt?: string;
  listing?: ApiListingDto;
};

type SuccessEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder: EndpointBuilder<BaseQuery, ApiTagTypes, "api">) => ({
    getMyFavorites: builder.query<{ favorites: FavoriteRow[] }, void>({
      query: () => "/api/favorites",
      transformResponse: (
        response: SuccessEnvelope<{ favorites: FavoriteRow[] }>,
      ) => ({
        favorites: response?.data?.favorites ?? [],
      }),
      providesTags: [{ type: "Property", id: "FAVORITES" }],
    }),

    addFavorite: builder.mutation<void, { listingId: string }>({
      query: ({ listingId }) => ({
        url: `/api/favorites/${listingId}`,
        method: "POST",
      }),
      async onQueryStarted({ listingId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          favoritesApi.util.updateQueryData(
            "getMyFavorites",
            undefined,
            (draft) => {
              const exists = draft.favorites.some(
                (f) => f.listingId === listingId,
              );
              if (!exists) {
                draft.favorites.unshift({
                  userId: "me",
                  listingId,
                  createdAt: new Date().toISOString(),
                });
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeFavorite: builder.mutation<void, { listingId: string }>({
      query: ({ listingId }) => ({
        url: `/api/favorites/${listingId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ listingId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          favoritesApi.util.updateQueryData(
            "getMyFavorites",
            undefined,
            (draft) => {
              draft.favorites = draft.favorites.filter(
                (f) => f.listingId !== listingId,
              );
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMyFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
