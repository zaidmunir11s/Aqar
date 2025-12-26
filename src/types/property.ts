// Property type definitions

export type PropertyType =
  | "apartment"
  | "villa"
  | "big_flat"
  | "lounge"
  | "small_house"
  | "store"
  | "building"
  | "land"
  | "room"
  | "office"
  | "tent"
  | "warehouse"
  | "furnished_apartment"
  | "chalet"
  | "floor"
  | "farm"
  | "other"
  | "studio"
  | "hall";

export type ListingType = "rent" | "sale" | "daily";
export type UsageType = "family" | "single";
export type BookingType = "daily" | "monthly";
export type UnitStatus = "available" | "sold" | "reserved";

export interface ProjectUnit {
  unitNumber: string;
  area: number;
  price: number;
  status: UnitStatus;
}

export interface ProjectFloor {
  floorNumber: number;
  units: ProjectUnit[];
}

export interface ProjectDetails {
  unitCount: number;
  minArea: number;
  maxArea: number;
  minPrice: number;
  maxPrice: number;
  availableStatus: string;
  readyStatus: string;
  floors: ProjectFloor[];
}

export interface BaseProperty {
  id: number;
  lat: number;
  lng: number;
  type: PropertyType;
  listingType: ListingType;
  verified?: boolean;
  favorite?: boolean;
  highlighted?: boolean;
  area: number;
  usage: UsageType;
  bedrooms: number;
  livingRooms: number;
  restrooms: number;
  estateAge: number;
  address: string;
  city: string;
  images?: string[];
  description?: string;
  features?: string[]; // Property features (e.g., "Furnished", "Pool", "Car Entrance")
}

export interface RentSaleProperty extends BaseProperty {
  price: string;
}

export interface DailyProperty extends BaseProperty {
  dailyPrice: number;
  monthlyPrice: number;
  bookingType: BookingType;
}

export interface ProjectProperty extends BaseProperty {
  price: string;
  isProject: true;
  markerColor: string;
  projectName: string;
  projectNameArabic: string;
  developerName: string;
  developerLogo: string;
  projectFeatures: string[];
  projectDetails: ProjectDetails;
}

export type Property = RentSaleProperty | DailyProperty | ProjectProperty;

export interface FilterOption {
  id: string;
  label: string;
  type: PropertyType | null;
}
