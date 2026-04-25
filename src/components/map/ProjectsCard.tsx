import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useLocalization } from "../../hooks/useLocalization";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export interface ProjectsCardProps {
  projectCount: number;
  onPress: () => void;
  showBelow?: boolean;
}

/**
 * Projects card component shown on sale tab
 */
const ProjectsCard = memo<ProjectsCardProps>(
  ({ projectCount, onPress, showBelow = false }) => {
    const { t, isRTL } = useLocalization();
    const insets = useSafeAreaInsets();
    const { top } = insets;
    // RTL-aware styles
    const rtlStyles = useMemo(
      () => ({
        projectsCard: {
          left: isRTL ? undefined : wp(4),
          right: isRTL ? wp(4) : undefined,
          flexDirection: (isRTL ? "row-reverse" : "row") as
            | "row"
            | "row-reverse",
        },
        projectIconContainer: {
          marginRight: isRTL ? 0 : wp(3),
          marginLeft: isRTL ? wp(3) : 0,
        },
      }),
      [isRTL],
    );

    return (
      <TouchableOpacity
        style={[
          showBelow ? styles.projectsCardBelow : styles.projectsCard,
          rtlStyles.projectsCard,
          { top: hp(17) + top },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View
          style={[styles.projectIconContainer, rtlStyles.projectIconContainer]}
        >
          <Ionicons name="business" size={wp(8)} color="#d97706" />
        </View>
        <View>
          <Text style={styles.projectTitle}>{t("listings.projects")}</Text>
          <Text style={styles.projectSubtitle}>
            {projectCount} {t("listings.projectsAvailable")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

ProjectsCard.displayName = "ProjectsCard";

const styles = StyleSheet.create({
  projectsCard: {
    position: "absolute",
    left: wp(4),
    backgroundColor: "#fff",
    padding: wp(3.5),
    borderRadius: wp(4),
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 8 },
    }),
    zIndex: 80,
  },
  projectsCardBelow: {
    position: "absolute",
    top: hp(27),
    left: wp(4),
    backgroundColor: "#fff",
    padding: wp(3.5),
    borderRadius: wp(4),
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 8 },
    }),
    zIndex: 70,
  },
  projectIconContainer: {
    backgroundColor: "#fffbeb",
    padding: wp(2.5),
    borderRadius: wp(3),
  },
  projectTitle: {
    fontWeight: "bold",
    fontSize: wp(4),
    color: "#333",
  },
  projectSubtitle: {
    color: "#666",
    fontSize: wp(3.3),
    marginTop: hp(0.2),
  },
});

export default ProjectsCard;
