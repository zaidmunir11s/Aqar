import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SectionHeader from "./SectionHeader";
import { useLocalization } from "@/hooks/useLocalization";

export interface ActivityItemProps {
  onPress?: () => void;
}

/**
 * Activity item component with section header
 */
const ActivityItem = memo<ActivityItemProps>(({ onPress }) => {
  const { t } = useLocalization();
  return (
    <View style={styles.container}>
      <SectionHeader
        title={t("common.activity", { defaultValue: "Activity" })}
        iconName="bar-chart"
      />
    </View>
  );
});

ActivityItem.displayName = "ActivityItem";

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
});

export default ActivityItem;
