import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MapView from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, ListingFooter, ToggleSwitch } from "../../../../components";
import { COLORS, RIYADH_REGION } from "@/constants";

type NavigationProp = NativeStackNavigationProp<any>;

interface RouteParams {
  orderFormData?: any;
}

export default function ChooseLocationScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const mapRef = useRef<MapView>(null);

  // Selected location - tracks the center coordinate of the map
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: RIYADH_REGION.latitude,
    longitude: RIYADH_REGION.longitude,
  });

  // Toggle states: true = ON (thumb left), false = OFF (thumb right)
  const [onlyAdsWithPhoto, setOnlyAdsWithPhoto] = useState(false);
  const [assistFromPartners, setAssistFromPartners] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNextPress = () => {
    navigation.navigate("Description", {
      selectedLocation,
      onlyAdsWithPhoto,
      assistFromPartners,
      orderFormData: params.orderFormData,
    });
  };

  // Handle map region change (when user pans/zooms)
  // The marker is fixed at center visually, but we track the center coordinate
  // This ensures we always know the exact location the user is pointing at
  const handleRegionChangeComplete = (newRegion: typeof RIYADH_REGION) => {
    // Update selected location to match the center of the map
    // This is the location that will be used for property search
    setSelectedLocation({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ScreenHeader
        title="New Order"
        onBackPress={handleBackPress}
        fontWeightBold
        fontSize={wp(4.5)}
      />

      <View style={styles.content}>
        {/* Choose Location Title */}
        <Text style={styles.sectionTitle}>Choose location</Text>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={RIYADH_REGION}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
            mapType="standard"
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          />
          {/* Fixed Center Marker - Always at center of viewport */}
          <View style={styles.centerMarkerContainer} pointerEvents="none">
            <MaterialIcons
              name="my-location"
              size={wp(8)}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Toggle Options */}
        <View style={styles.togglesContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>only ads with photo</Text>
            <ToggleSwitch
              value={onlyAdsWithPhoto}
              onValueChange={setOnlyAdsWithPhoto}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              I would like the assist from Aqar application partners in the field research
            </Text>
            <ToggleSwitch
              value={assistFromPartners}
              onValueChange={setAssistFromPartners}
            />
          </View>
        </View>
      </View>

      {/* Footer */}
      <ListingFooter
        currentStep={2}
        totalSteps={3}
        onBackPress={handleBackPress}
        onNextPress={handleNextPress}
        showBack={true}
        showNext={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.3),
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  mapContainer: {
    width: "100%",
    height: hp(50),
    borderRadius: wp(2),
    overflow: "hidden",
    marginBottom: hp(3),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    // backgroundColor: COLORS.white,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  centerMarkerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  togglesContainer: {

    // marginTop: hp(1),
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
    // paddingVertical: hp(1.5),
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.border,
  },
  toggleLabel: {
    flex: 1,
    fontSize: wp(4),
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginRight: wp(3),
  },
});

