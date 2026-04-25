import { useMemo } from "react";
import type { Property } from "@/types/property";
import { useGetPublicListingsQuery } from "@/redux/api";
import {
  buildMarketListingsQueryArgs,
  computeListingPriceInsights,
  type ListingPriceFilters,
} from "@/utils/listingPriceInsights";

type Kind = "rent" | "sale";

export function usePropertyMarketPriceInsight(
  property: Property,
  kind: Kind,
  options: {
    variant: "default" | "detail";
    filters?: ListingPriceFilters;
  },
) {
  const { variant, filters } = options;

  const queryArgs = useMemo(
    () => buildMarketListingsQueryArgs(property, kind, filters),
    [property, kind, filters],
  );

  const skip = variant === "detail";

  const { data, isLoading, isFetching } = useGetPublicListingsQuery(
    queryArgs,
    { skip },
  );

  const insight = useMemo(
    () =>
      computeListingPriceInsights(data?.listings ?? [], {
        excludeListingId: property.serverListingId,
      }),
    [data?.listings, property.serverListingId],
  );

  return {
    ...insight,
    isLoading: skip ? false : isLoading,
    isFetching: skip ? false : isFetching,
  };
}
