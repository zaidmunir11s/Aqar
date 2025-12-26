import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScreenHeader } from "../../components";

type NavigationProp = NativeStackNavigationProp<any>;

export default function AddListingScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSavePress = () => {
    console.log("Save listing");
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Add New Listing"
        onBackPress={handleBackPress}
        showRightSide={false}
        onRightPress={handleSavePress}
        fontWeightBold={true}
        fontSize={wp(4.5)}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Add New Listing</Text>
          <Text style={styles.subtitle}>
            Create a new property listing to share with others
          </Text>
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
  },
  content: {
    paddingVertical: hp(2),
  },
  title: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#111827",
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: wp(4),
    color: "#6b7280",
    marginBottom: hp(3),
  },
});
