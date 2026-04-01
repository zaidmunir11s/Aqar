import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  addRequest: (request: Omit<SearchRequestData, "id" | "createdAt">) => Promise<void>;
  loadRequests: () => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

const SearchRequestContext = createContext<SearchRequestContextType | undefined>(undefined);

const STORAGE_KEY = "@search_requests";

export const SearchRequestProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<SearchRequestData[]>([]);

  const loadRequests = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        setRequests([]);
      }
    } catch (error) {
      if (__DEV__) console.error("Error loading requests:", error);
    }
  }, []);

  const addRequest = useCallback(async (requestData: Omit<SearchRequestData, "id" | "createdAt">) => {
    try {
      const newRequest: SearchRequestData = {
        ...requestData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      let updatedRequests: SearchRequestData[] = [];
      setRequests((prev) => {
        updatedRequests = [newRequest, ...prev];
        return updatedRequests;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    } catch (error) {
      if (__DEV__) console.error("Error saving request:", error);
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      let updatedRequests: SearchRequestData[] = [];
      setRequests((prev) => {
        updatedRequests = prev.filter((r) => r.id !== id);
        return updatedRequests;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    } catch (error) {
      if (__DEV__) console.error("Error deleting request:", error);
    }
  }, []);

  const value = useMemo(
    () => ({ requests, addRequest, loadRequests, deleteRequest }),
    [requests, addRequest, loadRequests, deleteRequest]
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
    throw new Error("useSearchRequest must be used within SearchRequestProvider");
  }
  return context;
};
