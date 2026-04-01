import React from "react";
import { View } from "react-native";
import VillaForSaleDetailsForm from "./categories/VillaForSaleDetailsForm";
import LandForSaleDetailsForm from "./categories/LandForSaleDetailsForm";
import ApartmentForSaleDetailsForm from "./categories/ApartmentForSaleDetailsForm";
import BuildingForSaleDetailsForm from "./categories/BuildingForSaleDetailsForm";
import SmallHouseForSaleDetailsForm from "./categories/SmallHouseForSaleDetailsForm";
import LoungeForSaleDetailsForm from "./categories/LoungeForSaleDetailsForm";
import FarmForSaleDetailsForm from "./categories/FarmForSaleDetailsForm";
import StoreForSaleDetailsForm from "./categories/StoreForSaleDetailsForm";
import FloorForSaleDetailsForm from "./categories/FloorForSaleDetailsForm";
import ApartmentForRentDetailsForm from "./categories/ApartmentForRentDetailsForm";
import VillaForRentDetailsForm from "./categories/VillaForRentDetailsForm";
import BigFlatForRentDetailsForm from "./categories/BigFlatForRentDetailsForm";
import LoungeForRentDetailsForm from "./categories/LoungeForRentDetailsForm";
import SmallHouseForRentDetailsForm from "./categories/SmallHouseForRentDetailsForm";
import StoreForRentDetailsForm from "./categories/StoreForRentDetailsForm";
import BuildingForRentDetailsForm from "./categories/BuildingForRentDetailsForm";
import LandForRentDetailsForm from "./categories/LandForRentDetailsForm";
import RoomForRentDetailsForm from "./categories/RoomForRentDetailsForm";
import OfficeForRentDetailsForm from "./categories/OfficeForRentDetailsForm";
import TentForRentDetailsForm from "./categories/TentForRentDetailsForm";
import WarehouseForRentDetailsForm from "./categories/WarehouseForRentDetailsForm";
import ChaletForRentDetailsForm from "./categories/ChaletForRentDetailsForm";
import { CategoryFormProps } from "./shared/CategoryFormProps";

interface PropertyDetailsCategoryRendererProps extends CategoryFormProps {
  selectedCategory?: string;
}

export default function PropertyDetailsCategoryRenderer({
  selectedCategory = "",
  submitAttempted = false,
  onValidityChange,
  onFormDataChange,
}: PropertyDetailsCategoryRendererProps): React.JSX.Element {
  switch (selectedCategory) {
    case "sale-1":
      return (
        <VillaForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-2":
      return (
        <LandForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-3":
      return (
        <ApartmentForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-4":
      return (
        <BuildingForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-5":
      return (
        <SmallHouseForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-6":
      return (
        <LoungeForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-7":
      return <FarmForSaleDetailsForm onFormDataChange={onFormDataChange} />;
    case "sale-8":
      return (
        <StoreForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "sale-9":
      return (
        <FloorForSaleDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-1":
      return <ApartmentForRentDetailsForm onFormDataChange={onFormDataChange} />;
    case "rent-2":
      return (
        <VillaForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-3":
      return (
        <BigFlatForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-4":
      return <LoungeForRentDetailsForm onFormDataChange={onFormDataChange} />;
    case "rent-5":
      return (
        <SmallHouseForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-6":
      return (
        <StoreForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-7":
      return (
        <BuildingForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-8":
      return (
        <LandForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-9":
      return <RoomForRentDetailsForm onFormDataChange={onFormDataChange} />;
    case "rent-10":
      return (
        <OfficeForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-11":
      return <TentForRentDetailsForm onFormDataChange={onFormDataChange} />;
    case "rent-12":
      return (
        <WarehouseForRentDetailsForm
          submitAttempted={submitAttempted}
          onValidityChange={onValidityChange}
          onFormDataChange={onFormDataChange}
        />
      );
    case "rent-13":
      return <ChaletForRentDetailsForm onFormDataChange={onFormDataChange} />;
    default:
      return <View />;
  }
}
