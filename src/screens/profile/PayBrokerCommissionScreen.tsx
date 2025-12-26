import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader, SegmentedControl } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function PayBrokerCommissionScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSegmentChange = (index: number) => {
    console.log("Segment changed to:", index);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Your Deposit Service "
        onBackPress={handleBackPress}
        fontWeightBold={true}
        showRightSide={false}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={wp(8)} color="#1e8ddf" />
        </View>
        <Text style={styles.descriptionText}>
          A service that ensures the safe arrival of{"\n"}the commission to the
          broker by matching{"\n"}all registered official data and passing the
          {"\n"}
          national access verification to ensure the rights{"\n"}of all parties.
        </Text>
        <View style={styles.separator} />
        <View style={styles.segmentedControlContainer}>
          <SegmentedControl
            options={["buy", "Rent"]}
            onValueChange={handleSegmentChange}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: wp(4),
    alignItems: "center",
    paddingTop: hp(3),
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  descriptionText: {
    fontSize: wp(3.4),
    color: "#6b7280",
    textAlign: "center",
    lineHeight: hp(2.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "100%",
    marginBottom: hp(3),
  },
  segmentedControlContainer: {
    width: "100%",
    marginTop: hp(2),
  },
});
