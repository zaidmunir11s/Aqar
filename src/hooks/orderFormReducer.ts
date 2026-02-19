/**
 * useReducer for order form - replaces 80+ useState with batched updates.
 * Each dispatch batches; category reset is a single update instead of 80+ setState calls.
 */
export type RentPeriod = "Yearly" | "Monthly" | null;

export interface OrderFormState {
  category: string;
  showCategoryModal: boolean;

  // Apartment for rent
  rentPeriod: RentPeriod;
  selectedPayment: string | null;
  fromPrice: string;
  toPrice: string;
  priceFrom: string;
  priceTo: string;
  selectedPaymentType: string | null;
  selectedBedroom: string | null;
  selectedLivingRoom: string | null;
  selectedWc: string | null;
  floor: string;
  showFloorModal: boolean;
  age: string;
  showAgeModal: boolean;
  furnished: boolean;
  carEntrance: boolean;
  airConditioned: boolean;
  privateRoof: boolean;
  apartmentInVilla: boolean;
  twoEntrances: boolean;
  specialEntrances: boolean;
  showStreetDirectionModal: boolean;
  showStreetWidthModal: boolean;
  showStoresModal: boolean;

  // Villa for sale
  villaPriceFrom: string;
  villaPriceTo: string;
  selectedApartment: string | null;
  streetDirection: string;
  areaFrom: string;
  areaTo: string;
  streetWidth: string;
  stairs: boolean;
  selectedVillaType: string | null;
  driverRoom: boolean;
  maidRoom: boolean;
  pool: boolean;
  villaFurnished: boolean;
  kitchen: boolean;
  villaCarEntrance: boolean;
  basement: boolean;
  nearBus: boolean;
  nearMetro: boolean;

  // Land for sale
  landPriceFrom: string;
  landPriceTo: string;
  selectedLandType: string | null;
  landAreaFrom: string;
  landAreaTo: string;
  landStreetDirection: string;
  landStreetWidth: string;

  // Apartment for sale
  apartmentSalePriceFrom: string;
  apartmentSalePriceTo: string;
  apartmentSaleAreaFrom: string;
  apartmentSaleAreaTo: string;
  apartmentSaleCarEntrance: boolean;
  apartmentSalePrivateRoof: boolean;
  apartmentSaleInVilla: boolean;
  apartmentSaleTwoEntrances: boolean;
  apartmentSaleSpecialEntrances: boolean;

  // Building for sale
  buildingPriceFrom: string;
  buildingPriceTo: string;
  buildingApartments: string | null;
  selectedBuildingType: string | null;
  buildingStreetDirection: string;
  stores: string;
  buildingAreaFrom: string;
  buildingAreaTo: string;

  // Small house for sale
  smallHousePriceFrom: string;
  smallHousePriceTo: string;
  smallHouseStreetDirection: string;
  smallHouseAreaFrom: string;
  smallHouseAreaTo: string;
  smallHouseStreetWidth: string;
  smallHouseFurnished: boolean;
  tent: boolean;

  // Lounge for sale
  loungePriceFrom: string;
  loungePriceTo: string;
  loungeAreaFrom: string;
  loungeAreaTo: string;
  loungeStreetWidth: string;

  // Farm for sale
  farmPriceFrom: string;
  farmPriceTo: string;
  farmAreaFrom: string;
  farmAreaTo: string;

  // Store for sale
  storePriceFrom: string;
  storePriceTo: string;
  storeAreaFrom: string;
  storeAreaTo: string;
  storeStreetWidth: string;

  // Floor for sale
  floorSalePriceFrom: string;
  floorSalePriceTo: string;
  floorSaleAreaFrom: string;
  floorSaleAreaTo: string;
  floorSaleCarEntrance: boolean;

  // Villa for rent
  villaRentPriceFrom: string;
  villaRentPriceTo: string;
  villaRentStreetDirection: string;
  villaRentAreaFrom: string;
  villaRentAreaTo: string;
  villaRentStreetWidth: string;
  villaRentStairs: boolean;
  villaRentAirConditioned: boolean;
  villaRentRentPeriod: RentPeriod | null;

  // Big flat for rent
  bigFlatPriceFrom: string;
  bigFlatPriceTo: string;
  bigFlatAreaFrom: string;
  bigFlatAreaTo: string;
  bigFlatRentPeriod: RentPeriod | null;
  bigFlatCarEntrance: boolean;
  bigFlatAirConditioned: boolean;
  bigFlatInVilla: boolean;
  bigFlatTwoEntrances: boolean;
  bigFlatSpecialEntrances: boolean;

  // Lounge for rent
  loungeRentPriceFrom: string;
  loungeRentPriceTo: string;
  loungeRentAreaFrom: string;
  loungeRentAreaTo: string;
  loungeRentRentPeriod: RentPeriod | null;
  loungeRentPool: boolean;
  footballPitch: boolean;
  volleyballCourt: boolean;
  loungeRentTent: boolean;
  loungeRentKitchen: boolean;
  playground: boolean;
  familySection: boolean;

  // Small house for rent
  smallHouseRentPriceFrom: string;
  smallHouseRentPriceTo: string;
  smallHouseRentStreetDirection: string;
  smallHouseRentAreaFrom: string;
  smallHouseRentAreaTo: string;
  smallHouseRentStreetWidth: string;
  smallHouseRentFurnished: boolean;
  smallHouseRentTent: boolean;
  smallHouseRentKitchen: boolean;

  // Store for rent
  storeRentPriceFrom: string;
  storeRentPriceTo: string;
  storeRentAreaFrom: string;
  storeRentAreaTo: string;
  storeRentStreetWidth: string;

  // Building for rent
  buildingRentPriceFrom: string;
  buildingRentPriceTo: string;
  buildingRentApartments: string | null;
  selectedBuildingRentType: string | null;
  buildingRentStreetDirection: string;
  buildingRentStores: string;
  buildingRentAreaFrom: string;
  buildingRentAreaTo: string;
  buildingRentStreetWidth: string;

  // Land for rent
  landRentStreetDirection: string;
  landRentAreaFrom: string;
  landRentAreaTo: string;
  landRentStreetWidth: string;
  selectedLandRentType: string | null;

  // Room for rent
  roomRentPriceFrom: string;
  roomRentPriceTo: string;
  roomRentRentPeriod: RentPeriod | null;
  roomRentKitchen: boolean;

  // Office for rent
  officeRentPriceFrom: string;
  officeRentPriceTo: string;
  officeRentAreaFrom: string;
  officeRentAreaTo: string;
  officeRentStreetWidth: string;
  officeRentFurnished: boolean;

  // Tent for rent
  tentRentRentPeriod: RentPeriod | null;
  tentRentPriceFrom: string;
  tentRentPriceTo: string;

  // Warehouse for rent
  warehouseRentPriceFrom: string;
  warehouseRentPriceTo: string;
  warehouseRentAreaFrom: string;
  warehouseRentAreaTo: string;
  warehouseRentStreetWidth: string;

  // Chalet for rent
  chaletRentPriceFrom: string;
  chaletRentPriceTo: string;
  chaletRentAreaFrom: string;
  chaletRentAreaTo: string;
  chaletRentRentPeriod: RentPeriod | null;
  chaletRentPool: boolean;
  chaletFootballPitch: boolean;
  chaletVolleyballCourt: boolean;
  chaletRentTent: boolean;
  chaletRentKitchen: boolean;
  chaletPlayground: boolean;

  // Other
  otherPriceFrom: string;
  otherPriceTo: string;
  otherAreaFrom: string;
  otherAreaTo: string;
}

const empty = "";
const emptyBool = false;
const emptyNull: string | null = null;
const emptyRentPeriod: RentPeriod | null = null;

export const initialOrderFormState: OrderFormState = {
  category: empty,
  showCategoryModal: false,
  rentPeriod: emptyRentPeriod,
  selectedPayment: emptyNull,
  fromPrice: empty,
  toPrice: empty,
  priceFrom: empty,
  priceTo: empty,
  selectedPaymentType: emptyNull,
  selectedBedroom: emptyNull,
  selectedLivingRoom: emptyNull,
  selectedWc: emptyNull,
  floor: empty,
  showFloorModal: false,
  age: empty,
  showAgeModal: false,
  furnished: emptyBool,
  carEntrance: emptyBool,
  airConditioned: emptyBool,
  privateRoof: emptyBool,
  apartmentInVilla: emptyBool,
  twoEntrances: emptyBool,
  specialEntrances: emptyBool,
  showStreetDirectionModal: false,
  showStreetWidthModal: false,
  showStoresModal: false,
  villaPriceFrom: empty,
  villaPriceTo: empty,
  selectedApartment: emptyNull,
  streetDirection: empty,
  areaFrom: empty,
  areaTo: empty,
  streetWidth: empty,
  stairs: emptyBool,
  selectedVillaType: emptyNull,
  driverRoom: emptyBool,
  maidRoom: emptyBool,
  pool: emptyBool,
  villaFurnished: emptyBool,
  kitchen: emptyBool,
  villaCarEntrance: emptyBool,
  basement: emptyBool,
  nearBus: emptyBool,
  nearMetro: emptyBool,
  landPriceFrom: empty,
  landPriceTo: empty,
  selectedLandType: emptyNull,
  landAreaFrom: empty,
  landAreaTo: empty,
  landStreetDirection: empty,
  landStreetWidth: empty,
  apartmentSalePriceFrom: empty,
  apartmentSalePriceTo: empty,
  apartmentSaleAreaFrom: empty,
  apartmentSaleAreaTo: empty,
  apartmentSaleCarEntrance: emptyBool,
  apartmentSalePrivateRoof: emptyBool,
  apartmentSaleInVilla: emptyBool,
  apartmentSaleTwoEntrances: emptyBool,
  apartmentSaleSpecialEntrances: emptyBool,
  buildingPriceFrom: empty,
  buildingPriceTo: empty,
  buildingApartments: emptyNull,
  selectedBuildingType: emptyNull,
  buildingStreetDirection: empty,
  stores: empty,
  buildingAreaFrom: empty,
  buildingAreaTo: empty,
  smallHousePriceFrom: empty,
  smallHousePriceTo: empty,
  smallHouseStreetDirection: empty,
  smallHouseAreaFrom: empty,
  smallHouseAreaTo: empty,
  smallHouseStreetWidth: empty,
  smallHouseFurnished: emptyBool,
  tent: emptyBool,
  loungePriceFrom: empty,
  loungePriceTo: empty,
  loungeAreaFrom: empty,
  loungeAreaTo: empty,
  loungeStreetWidth: empty,
  farmPriceFrom: empty,
  farmPriceTo: empty,
  farmAreaFrom: empty,
  farmAreaTo: empty,
  storePriceFrom: empty,
  storePriceTo: empty,
  storeAreaFrom: empty,
  storeAreaTo: empty,
  storeStreetWidth: empty,
  floorSalePriceFrom: empty,
  floorSalePriceTo: empty,
  floorSaleAreaFrom: empty,
  floorSaleAreaTo: empty,
  floorSaleCarEntrance: emptyBool,
  villaRentPriceFrom: empty,
  villaRentPriceTo: empty,
  villaRentStreetDirection: empty,
  villaRentAreaFrom: empty,
  villaRentAreaTo: empty,
  villaRentStreetWidth: empty,
  villaRentStairs: emptyBool,
  villaRentAirConditioned: emptyBool,
  villaRentRentPeriod: emptyRentPeriod,
  bigFlatPriceFrom: empty,
  bigFlatPriceTo: empty,
  bigFlatAreaFrom: empty,
  bigFlatAreaTo: empty,
  bigFlatRentPeriod: emptyRentPeriod,
  bigFlatCarEntrance: emptyBool,
  bigFlatAirConditioned: emptyBool,
  bigFlatInVilla: emptyBool,
  bigFlatTwoEntrances: emptyBool,
  bigFlatSpecialEntrances: emptyBool,
  loungeRentPriceFrom: empty,
  loungeRentPriceTo: empty,
  loungeRentAreaFrom: empty,
  loungeRentAreaTo: empty,
  loungeRentRentPeriod: emptyRentPeriod,
  loungeRentPool: emptyBool,
  footballPitch: emptyBool,
  volleyballCourt: emptyBool,
  loungeRentTent: emptyBool,
  loungeRentKitchen: emptyBool,
  playground: emptyBool,
  familySection: emptyBool,
  smallHouseRentPriceFrom: empty,
  smallHouseRentPriceTo: empty,
  smallHouseRentStreetDirection: empty,
  smallHouseRentAreaFrom: empty,
  smallHouseRentAreaTo: empty,
  smallHouseRentStreetWidth: empty,
  smallHouseRentFurnished: emptyBool,
  smallHouseRentTent: emptyBool,
  smallHouseRentKitchen: emptyBool,
  storeRentPriceFrom: empty,
  storeRentPriceTo: empty,
  storeRentAreaFrom: empty,
  storeRentAreaTo: empty,
  storeRentStreetWidth: empty,
  buildingRentPriceFrom: empty,
  buildingRentPriceTo: empty,
  buildingRentApartments: emptyNull,
  selectedBuildingRentType: emptyNull,
  buildingRentStreetDirection: empty,
  buildingRentStores: empty,
  buildingRentAreaFrom: empty,
  buildingRentAreaTo: empty,
  buildingRentStreetWidth: empty,
  landRentStreetDirection: empty,
  landRentAreaFrom: empty,
  landRentAreaTo: empty,
  landRentStreetWidth: empty,
  selectedLandRentType: emptyNull,
  roomRentPriceFrom: empty,
  roomRentPriceTo: empty,
  roomRentRentPeriod: emptyRentPeriod,
  roomRentKitchen: emptyBool,
  officeRentPriceFrom: empty,
  officeRentPriceTo: empty,
  officeRentAreaFrom: empty,
  officeRentAreaTo: empty,
  officeRentStreetWidth: empty,
  officeRentFurnished: emptyBool,
  tentRentRentPeriod: emptyRentPeriod,
  tentRentPriceFrom: empty,
  tentRentPriceTo: empty,
  warehouseRentPriceFrom: empty,
  warehouseRentPriceTo: empty,
  warehouseRentAreaFrom: empty,
  warehouseRentAreaTo: empty,
  warehouseRentStreetWidth: empty,
  chaletRentPriceFrom: empty,
  chaletRentPriceTo: empty,
  chaletRentAreaFrom: empty,
  chaletRentAreaTo: empty,
  chaletRentRentPeriod: emptyRentPeriod,
  chaletRentPool: emptyBool,
  chaletFootballPitch: emptyBool,
  chaletVolleyballCourt: emptyBool,
  chaletRentTent: emptyBool,
  chaletRentKitchen: emptyBool,
  chaletPlayground: emptyBool,
  otherPriceFrom: empty,
  otherPriceTo: empty,
  otherAreaFrom: empty,
  otherAreaTo: empty,
};

export type OrderFormAction =
  | { type: "SET"; payload: { key: keyof OrderFormState; value: OrderFormState[keyof OrderFormState] } }
  | { type: "RESET_AND_SELECT_CATEGORY"; payload: string };

export function orderFormReducer(state: OrderFormState, action: OrderFormAction): OrderFormState {
  switch (action.type) {
    case "SET": {
      const { key, value } = action.payload;
      if (state[key] === value) return state;
      return { ...state, [key]: value };
    }
    case "RESET_AND_SELECT_CATEGORY": {
      return {
        ...initialOrderFormState,
        category: action.payload,
        showCategoryModal: false,
        showFloorModal: false,
        showAgeModal: false,
        showStreetDirectionModal: false,
        showStreetWidthModal: false,
        showStoresModal: false,
      };
    }
    default:
      return state;
  }
}
