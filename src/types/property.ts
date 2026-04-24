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
export type PropertyDetailItem = {
  type: "value" | "toggle";
  label: string;
  value?: string;
  icon?: string;
  enabled?: boolean;
};

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
  /** Backend listing UUID when loaded from API (for refetch / favorites). */
  serverListingId?: string;
  /** Human-facing sequence number for published listings. */
  listingId?: number;
  /** ISO timestamp when listing was created. */
  createdAt?: string;
  /** ISO timestamp when listing was last updated. */
  updatedAt?: string;
  categoryLabel?: string;
  categoryId?: string;
  commissionText?: string;
  videoUris?: string[];
  /** Extra fields from API `Listing.metadata` (marketing flow, etc.). */
  listingMetadata?: Record<string, unknown>;
  /** Backend listing status when loaded from API (e.g. ACTIVE/PENDING/ARCHIVED). */
  listingStatus?: string;
  detailsItems?: PropertyDetailItem[];
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
  /** Optional per-image description lines aligned by index with `images`. */
  imageCaptions?: string[];
  description?: string;
  features?: string[]; // Property features (e.g., "Furnished", "Pool", "Car Entrance")
  advertiserName?: string; // Property owner/advertiser name
  advertiserId?: string | number; // Property owner/advertiser ID
  advertiserPhone?: string; // Contact phone (e.g. +966xxxxxxxxx)
  /** Optional second line under name (e.g. reviews). Omit to hide that row. */
  advertiserSubtitle?: string;
  /** User moved listing to archive (profile “Archived ads”). */
  isArchived?: boolean;
}

/** Rent listing payment schedule (e.g. yearly + accepted installment options). */
export type RentPaymentFrequencyId =
  | "yearly"
  | "semiAnnual"
  | "quarterly"
  | "monthly";

export interface RentPaymentScheduleRow {
  frequency: RentPaymentFrequencyId;
  /** Left column: contract/annual reference amount in SAR. */
  primaryAmountSar: number;
  /** Right column: amount per installment (omit for yearly-only row). */
  installmentAmountSar?: number;
}

export interface RentSaleProperty extends BaseProperty {
  price: string;
  /** When set (e.g. from publish flow), overrides computed defaults on details. */
  rentPaymentSchedule?: RentPaymentScheduleRow[];
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
