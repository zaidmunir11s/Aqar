// All options for order form modals and selections

// All, First floor, Second floor, then floors 3–20 (18 numeric options)
export const FLOOR_OPTIONS = [
  "All",
  "First floor",
  "Second floor",
  ...Array.from({ length: 18 }, (_, i) => `${i + 3}`),
];

export const AGE_OPTIONS = [
  "All",
  "Less than 1 year",
  ...Array.from({ length: 19 }, (_, i) => `Less than ${i + 2} years`),
];

export const STREET_DIRECTION_OPTIONS = [
  "All",
  "North",
  "East",
  "West",
  "South",
  "Northeast",
  "Southeast",
  "Southwest",
  "Northwest",
  "3 Streets",
  "4 Streets",
];

export const STREET_WIDTH_OPTIONS = [
  "All",
  ...Array.from({ length: 10 }, (_, i) => `More than ${(i + 1) * 5}`),
];

export const STORES_OPTIONS = ["All", "1", "2", "3", "4"];

export const BEDROOM_OPTIONS = ["All", "1", "2", "3", "4", "5", "6+"];

export const LIVING_ROOM_OPTIONS = ["All", "+1", "+2", "+3"];

export const WC_OPTIONS = ["All", "+1", "+2", "+3"];

export const APARTMENT_OPTIONS = ["All", "1", "2", "3", "4"];

export const VILLA_TYPE_OPTIONS = ["Standalone", "Duplex", "Townhouse"];

export const RESIDENTIAL_COMMERCIAL_OPTIONS = ["Residential", "Commercial"];

export const PAYMENT_CHIPS = ["1 Payment", "2 Payment", "4 Payment", "Monthly"];

