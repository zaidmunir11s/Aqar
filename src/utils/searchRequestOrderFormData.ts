export function buildSearchRequestOrderFormData(form: any): any {
  const orderFormData: any = {
    category: form.category,
    selectedBedroom: form.selectedBedroom,
    selectedLivingRoom: form.selectedLivingRoom,
    selectedWc: form.selectedWc,
    floor: form.floor,
    age: form.age,
    nearBus: form.nearBus,
    nearMetro: form.nearMetro,
  };

  if (form.isApartmentForRent) {
    Object.assign(orderFormData, {
      rentPeriod: form.rentPeriod,
      apartmentRentTenant: form.apartmentRentTenant,
      fromPrice: form.fromPrice,
      toPrice: form.toPrice,
      priceFrom: form.priceFrom,
      priceTo: form.priceTo,
      furnished: form.furnished,
      carEntrance: form.carEntrance,
      airConditioned: form.airConditioned,
      privateRoof: form.privateRoof,
      apartmentInVilla: form.apartmentInVilla,
      twoEntrances: form.twoEntrances,
      specialEntrances: form.specialEntrances,
    });
  } else if (form.isVillaForSale) {
    Object.assign(orderFormData, {
      villaPriceFrom: form.villaPriceFrom,
      villaPriceTo: form.villaPriceTo,
      selectedApartment: form.selectedApartment,
      streetDirection: form.streetDirection,
      areaFrom: form.areaFrom,
      areaTo: form.areaTo,
      streetWidth: form.streetWidth,
      stairs: form.stairs,
      selectedVillaType: form.selectedVillaType,
      driverRoom: form.driverRoom,
      maidRoom: form.maidRoom,
      pool: form.pool,
      villaFurnished: form.villaFurnished,
      kitchen: form.kitchen,
      villaCarEntrance: form.villaCarEntrance,
      basement: form.basement,
    });
  } else if (form.isLandForSale) {
    Object.assign(orderFormData, {
      landPriceFrom: form.landPriceFrom,
      landPriceTo: form.landPriceTo,
      selectedLandType: form.selectedLandType,
      landAreaFrom: form.landAreaFrom,
      landAreaTo: form.landAreaTo,
      landStreetDirection: form.landStreetDirection,
      landStreetWidth: form.landStreetWidth,
    });
  } else if (form.isApartmentForSale) {
    Object.assign(orderFormData, {
      apartmentSalePriceFrom: form.apartmentSalePriceFrom,
      apartmentSalePriceTo: form.apartmentSalePriceTo,
      apartmentSaleAreaFrom: form.apartmentSaleAreaFrom,
      apartmentSaleAreaTo: form.apartmentSaleAreaTo,
      apartmentSaleCarEntrance: form.apartmentSaleCarEntrance,
      apartmentSalePrivateRoof: form.apartmentSalePrivateRoof,
      apartmentSaleInVilla: form.apartmentSaleInVilla,
      apartmentSaleTwoEntrances: form.apartmentSaleTwoEntrances,
      apartmentSaleSpecialEntrances: form.apartmentSaleSpecialEntrances,
    });
  } else if (form.isBuildingForSale) {
    Object.assign(orderFormData, {
      buildingPriceFrom: form.buildingPriceFrom,
      buildingPriceTo: form.buildingPriceTo,
      buildingApartments: form.buildingApartments,
      selectedBuildingType: form.selectedBuildingType,
      buildingStreetDirection: form.buildingStreetDirection,
      stores: form.stores,
      buildingAreaFrom: form.buildingAreaFrom,
      buildingAreaTo: form.buildingAreaTo,
      streetWidth: form.streetWidth,
    });
  } else if (form.isSmallHouseForSale) {
    Object.assign(orderFormData, {
      smallHousePriceFrom: form.smallHousePriceFrom,
      smallHousePriceTo: form.smallHousePriceTo,
      smallHouseStreetDirection: form.smallHouseStreetDirection,
      smallHouseAreaFrom: form.smallHouseAreaFrom,
      smallHouseAreaTo: form.smallHouseAreaTo,
      smallHouseStreetWidth: form.smallHouseStreetWidth,
      smallHouseFurnished: form.smallHouseFurnished,
      tent: form.tent,
    });
  } else if (form.isLoungeForSale) {
    Object.assign(orderFormData, {
      loungePriceFrom: form.loungePriceFrom,
      loungePriceTo: form.loungePriceTo,
      loungeAreaFrom: form.loungeAreaFrom,
      loungeAreaTo: form.loungeAreaTo,
      loungeStreetWidth: form.loungeStreetWidth,
    });
  } else if (form.isFarmForSale) {
    Object.assign(orderFormData, {
      farmPriceFrom: form.farmPriceFrom,
      farmPriceTo: form.farmPriceTo,
      farmAreaFrom: form.farmAreaFrom,
      farmAreaTo: form.farmAreaTo,
    });
  } else if (form.isStoreForSale) {
    Object.assign(orderFormData, {
      storePriceFrom: form.storePriceFrom,
      storePriceTo: form.storePriceTo,
      storeAreaFrom: form.storeAreaFrom,
      storeAreaTo: form.storeAreaTo,
      storeStreetWidth: form.storeStreetWidth,
    });
  } else if (form.isFloorForSale) {
    Object.assign(orderFormData, {
      floorSalePriceFrom: form.floorSalePriceFrom,
      floorSalePriceTo: form.floorSalePriceTo,
      floorSaleAreaFrom: form.floorSaleAreaFrom,
      floorSaleAreaTo: form.floorSaleAreaTo,
      floorSaleCarEntrance: form.floorSaleCarEntrance,
    });
  } else if (form.isVillaForRent) {
    Object.assign(orderFormData, {
      villaRentRentPeriod: form.villaRentRentPeriod,
      villaRentPriceFrom: form.villaRentPriceFrom,
      villaRentPriceTo: form.villaRentPriceTo,
      villaRentStreetDirection: form.villaRentStreetDirection,
      villaRentAreaFrom: form.villaRentAreaFrom,
      villaRentAreaTo: form.villaRentAreaTo,
      villaRentStreetWidth: form.villaRentStreetWidth,
      villaRentStairs: form.villaRentStairs,
      villaRentAirConditioned: form.villaRentAirConditioned,
      selectedVillaType: form.selectedVillaType,
      driverRoom: form.driverRoom,
      maidRoom: form.maidRoom,
      pool: form.pool,
      villaFurnished: form.villaFurnished,
      kitchen: form.kitchen,
      villaCarEntrance: form.villaCarEntrance,
      basement: form.basement,
    });
  } else if (form.isBigFlatForRent) {
    Object.assign(orderFormData, {
      bigFlatRentPeriod: form.bigFlatRentPeriod,
      bigFlatPriceFrom: form.bigFlatPriceFrom,
      bigFlatPriceTo: form.bigFlatPriceTo,
      bigFlatAreaFrom: form.bigFlatAreaFrom,
      bigFlatAreaTo: form.bigFlatAreaTo,
      bigFlatCarEntrance: form.bigFlatCarEntrance,
      bigFlatAirConditioned: form.bigFlatAirConditioned,
      bigFlatInVilla: form.bigFlatInVilla,
      bigFlatTwoEntrances: form.bigFlatTwoEntrances,
      bigFlatSpecialEntrances: form.bigFlatSpecialEntrances,
    });
  } else if (form.isLoungeForRent) {
    Object.assign(orderFormData, {
      loungeRentRentPeriod: form.loungeRentRentPeriod,
      loungeRentPriceFrom: form.loungeRentPriceFrom,
      loungeRentPriceTo: form.loungeRentPriceTo,
      loungeRentAreaFrom: form.loungeRentAreaFrom,
      loungeRentAreaTo: form.loungeRentAreaTo,
      loungeRentPool: form.loungeRentPool,
      footballPitch: form.footballPitch,
      volleyballCourt: form.volleyballCourt,
      loungeRentTent: form.loungeRentTent,
      loungeRentKitchen: form.loungeRentKitchen,
      playground: form.playground,
      familySection: form.familySection,
    });
  } else if (form.isSmallHouseForRent) {
    Object.assign(orderFormData, {
      smallHouseRentPriceFrom: form.smallHouseRentPriceFrom,
      smallHouseRentPriceTo: form.smallHouseRentPriceTo,
      smallHouseRentStreetDirection: form.smallHouseRentStreetDirection,
      smallHouseRentAreaFrom: form.smallHouseRentAreaFrom,
      smallHouseRentAreaTo: form.smallHouseRentAreaTo,
      smallHouseRentStreetWidth: form.smallHouseRentStreetWidth,
      smallHouseRentFurnished: form.smallHouseRentFurnished,
      smallHouseRentTent: form.smallHouseRentTent,
      smallHouseRentKitchen: form.smallHouseRentKitchen,
    });
  } else if (form.isStoreForRent) {
    Object.assign(orderFormData, {
      storeRentPriceFrom: form.storeRentPriceFrom,
      storeRentPriceTo: form.storeRentPriceTo,
      storeRentAreaFrom: form.storeRentAreaFrom,
      storeRentAreaTo: form.storeRentAreaTo,
      storeRentStreetWidth: form.storeRentStreetWidth,
    });
  } else if (form.isBuildingForRent) {
    Object.assign(orderFormData, {
      buildingRentPriceFrom: form.buildingRentPriceFrom,
      buildingRentPriceTo: form.buildingRentPriceTo,
      buildingRentApartments: form.buildingRentApartments,
      selectedBuildingRentType: form.selectedBuildingRentType,
      buildingRentStreetDirection: form.buildingRentStreetDirection,
      buildingRentStores: form.buildingRentStores,
      buildingRentAreaFrom: form.buildingRentAreaFrom,
      buildingRentAreaTo: form.buildingRentAreaTo,
      buildingRentStreetWidth: form.buildingRentStreetWidth,
    });
  } else if (form.isLandForRent) {
    Object.assign(orderFormData, {
      selectedLandRentType: form.selectedLandRentType,
      landRentStreetDirection: form.landRentStreetDirection,
      landRentAreaFrom: form.landRentAreaFrom,
      landRentAreaTo: form.landRentAreaTo,
      landRentStreetWidth: form.landRentStreetWidth,
    });
  } else if (form.isRoomForRent) {
    Object.assign(orderFormData, {
      roomRentRentPeriod: form.roomRentRentPeriod,
      roomRentPriceFrom: form.roomRentPriceFrom,
      roomRentPriceTo: form.roomRentPriceTo,
      roomRentKitchen: form.roomRentKitchen,
    });
  } else if (form.isOfficeForRent) {
    Object.assign(orderFormData, {
      officeRentPriceFrom: form.officeRentPriceFrom,
      officeRentPriceTo: form.officeRentPriceTo,
      officeRentAreaFrom: form.officeRentAreaFrom,
      officeRentAreaTo: form.officeRentAreaTo,
      officeRentStreetWidth: form.officeRentStreetWidth,
      officeRentFurnished: form.officeRentFurnished,
    });
  } else if (form.isTentForRent) {
    Object.assign(orderFormData, {
      tentRentRentPeriod: form.tentRentRentPeriod,
      tentRentPriceFrom: form.tentRentPriceFrom,
      tentRentPriceTo: form.tentRentPriceTo,
      familySection: form.familySection,
    });
  } else if (form.isWarehouseForRent) {
    Object.assign(orderFormData, {
      warehouseRentPriceFrom: form.warehouseRentPriceFrom,
      warehouseRentPriceTo: form.warehouseRentPriceTo,
      warehouseRentAreaFrom: form.warehouseRentAreaFrom,
      warehouseRentAreaTo: form.warehouseRentAreaTo,
      warehouseRentStreetWidth: form.warehouseRentStreetWidth,
    });
  } else if (form.isChaletForRent) {
    Object.assign(orderFormData, {
      chaletRentRentPeriod: form.chaletRentRentPeriod,
      chaletRentPriceFrom: form.chaletRentPriceFrom,
      chaletRentPriceTo: form.chaletRentPriceTo,
      chaletRentAreaFrom: form.chaletRentAreaFrom,
      chaletRentAreaTo: form.chaletRentAreaTo,
      chaletRentPool: form.chaletRentPool,
      chaletFootballPitch: form.chaletFootballPitch,
      chaletVolleyballCourt: form.chaletVolleyballCourt,
      chaletRentTent: form.chaletRentTent,
      chaletRentKitchen: form.chaletRentKitchen,
      chaletPlayground: form.chaletPlayground,
      familySection: form.familySection,
    });
  } else if (form.isOther) {
    Object.assign(orderFormData, {
      otherPriceFrom: form.otherPriceFrom,
      otherPriceTo: form.otherPriceTo,
      otherAreaFrom: form.otherAreaFrom,
      otherAreaTo: form.otherAreaTo,
    });
  }

  return orderFormData;
}
