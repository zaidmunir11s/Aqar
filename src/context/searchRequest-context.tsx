import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { backendRequest } from "@/utils/backendApi";

export interface SearchRequestData {
  id: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  onlyAdsWithPhoto: boolean;
  assistFromPartners: boolean;
  orderFormData?: any; // All the form data from NewOrderScreen
  createdAt: string;
}

interface SearchRequestContextType {
  requests: SearchRequestData[];
  addRequest: (
    request: Omit<SearchRequestData, "id" | "createdAt">,
  ) => Promise<void>;
  loadRequests: () => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

const SearchRequestContext = createContext<
  SearchRequestContextType | undefined
>(undefined);

export const SearchRequestProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [requests, setRequests] = useState<SearchRequestData[]>([]);

  const loadRequests = useCallback(async () => {
    try {
      const res = await backendRequest<{
        success: boolean;
        data: { requests: any[] };
      }>("/search-requests");
      const mapped: SearchRequestData[] = (res.data.requests ?? []).map(
        (row: any) => ({
          id: String(row.id),
          category: String(row.category),
          location: {
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
          },
          description: row.description ?? "",
          onlyAdsWithPhoto: Boolean(row.onlyAdsWithPhoto),
          assistFromPartners: Boolean(row.assistFromPartners),
          orderFormData: row.orderFormData ?? undefined,
          createdAt: row.createdAt,
        }),
      );
      setRequests(mapped);
    } catch (error) {
      if (__DEV__) console.error("Error loading requests:", error);
      setRequests([]);
    }
  }, []);

  const addRequest = useCallback(
    async (requestData: Omit<SearchRequestData, "id" | "createdAt">) => {
      try {
        const payload = {
          category: requestData.category,
          latitude: requestData.location.latitude,
          longitude: requestData.location.longitude,
          description: requestData.description ?? "",
          onlyAdsWithPhoto: requestData.onlyAdsWithPhoto ?? false,
          assistFromPartners: requestData.assistFromPartners ?? false,
          orderFormData: requestData.orderFormData ?? null,
        };
        const res = await backendRequest<{
          success: boolean;
          data: { request: any };
        }>("/search-requests", { method: "POST", body: payload });
        const data = res.data.request;
        const newRequest: SearchRequestData = {
          id: String(data.id),
          category: String(data.category),
          location: {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          },
          description: data.description ?? "",
          onlyAdsWithPhoto: Boolean(data.onlyAdsWithPhoto),
          assistFromPartners: Boolean(data.assistFromPartners),
          orderFormData: data.orderFormData ?? undefined,
          createdAt: data.createdAt,
        };
        setRequests((prev) => [newRequest, ...prev]);
      } catch (error) {
        if (__DEV__) console.error("Error saving request:", error);
      }
    },
    [],
  );

  const deleteRequest = useCallback(async (id: string) => {
    try {
      await backendRequest("/search-requests/" + encodeURIComponent(id), {
        method: "DELETE",
      });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      if (__DEV__) console.error("Error deleting request:", error);
    }
  }, []);

  const value = useMemo(
    () => ({ requests, addRequest, loadRequests, deleteRequest }),
    [requests, addRequest, loadRequests, deleteRequest],
  );

  return (
    <SearchRequestContext.Provider value={value}>
      {children}
    </SearchRequestContext.Provider>
  );
};

export const useSearchRequest = () => {
  const context = useContext(SearchRequestContext);
  if (!context) {
    throw new Error(
      "useSearchRequest must be used within SearchRequestProvider",
    );
  }
  return context;
};
