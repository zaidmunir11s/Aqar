export type TabType = "ALL" | "For Sale" | "For Rent";

export interface CategoryItem {
  id: string;
  text: string;
}

export const FOR_SALE_CATEGORIES: CategoryItem[] = [
  { id: "sale-1", text: "Villa for sale" },
  { id: "sale-2", text: "Land for sale" },
  { id: "sale-3", text: "Apartment for sale" },
  { id: "sale-4", text: "Building for sale" },
  { id: "sale-5", text: "Small house for sale" },
  { id: "sale-6", text: "Lounge for sale" },
  { id: "sale-7", text: "Farm for sale" },
  { id: "sale-8", text: "Store for sale" },
  { id: "sale-9", text: "Floor for sale" },
];

export const FOR_RENT_CATEGORIES: CategoryItem[] = [
  { id: "rent-1", text: "Apartment for rent" },
  { id: "rent-2", text: "Villa for rent" },
  { id: "rent-3", text: "Big flat for rent" },
  { id: "rent-4", text: "Lounge for rent" },
  { id: "rent-5", text: "Small house for rent" },
  { id: "rent-6", text: "Store for rent" },
  { id: "rent-7", text: "Building for rent" },
  { id: "rent-8", text: "Land for rent" },
  { id: "rent-9", text: "Room for rent" },
  { id: "rent-10", text: "Office for rent" },
  { id: "rent-11", text: "Tent for rent" },
  { id: "rent-12", text: "Warehouse for rent" },
  { id: "rent-13", text: "Chalet for rent" },
];

export const ALL_CATEGORIES: CategoryItem[] = [
  ...FOR_SALE_CATEGORIES,
  ...FOR_RENT_CATEGORIES,
];

export const CATEGORY_TABS: TabType[] = ["ALL", "For Sale", "For Rent"];

/** i18n paths under `listings.propertyTypes.*` for marketing-request ids (`sale-1` … `rent-13`). */
export const MARKETING_REQUEST_CATEGORY_I18N_KEY: Record<string, string> = {
  "sale-1": "listings.propertyTypes.villaForSale",
  "sale-2": "listings.propertyTypes.landForSale",
  "sale-3": "listings.propertyTypes.apartmentForSale",
  "sale-4": "listings.propertyTypes.buildingForSale",
  "sale-5": "listings.propertyTypes.smallHouseForSale",
  "sale-6": "listings.propertyTypes.loungeForSale",
  "sale-7": "listings.propertyTypes.farmForSale",
  "sale-8": "listings.propertyTypes.storeForSale",
  "sale-9": "listings.propertyTypes.floorForSale",
  "rent-1": "listings.propertyTypes.apartmentForRent",
  "rent-2": "listings.propertyTypes.villaForRent",
  "rent-3": "listings.propertyTypes.bigFlatForRent",
  "rent-4": "listings.propertyTypes.loungeForRent",
  "rent-5": "listings.propertyTypes.smallHouseForRent",
  "rent-6": "listings.propertyTypes.storeForRent",
  "rent-7": "listings.propertyTypes.buildingForRent",
  "rent-8": "listings.propertyTypes.landForRent",
  "rent-9": "listings.propertyTypes.roomForRent",
  "rent-10": "listings.propertyTypes.officeForRent",
  "rent-11": "listings.propertyTypes.tentForRent",
  "rent-12": "listings.propertyTypes.warehouseForRent",
  "rent-13": "listings.propertyTypes.chaletForRent",
};

export function getMarketingRequestCategoryTranslationKey(categoryId: string): string {
  return MARKETING_REQUEST_CATEGORY_I18N_KEY[categoryId] ?? "";
}


export const FOR_BOOKING_CATEGORIES: CategoryItem[] = [
  { id: "1", text: "Apartment for booking" },
  { id: "2", text: "Villa for booking" },
  { id: "3", text: "Studio for booking" },
  { id: "4", text: "Chalet / Lounge for booking" },
  { id: "5", text: "Tent for booking" },
  { id: "6", text: "Farm for booking" },
  { id: "7", text: "Hall for booking" },
];
