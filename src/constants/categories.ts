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


export const FOR_BOOKING_CATEGORIES: CategoryItem[] = [
  { id: "1", text: "Apartment for booking" },
  { id: "2", text: "Villa for booking" },
  { id: "3", text: "Studio for booking" },
  { id: "4", text: "Chalet / Lounge for booking" },
  { id: "5", text: "Tent for booking" },
  { id: "6", text: "Farm for booking" },
  { id: "7", text: "Hall for booking" },
];
