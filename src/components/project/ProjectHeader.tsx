import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { ProjectProperty } from "../../types/property";
import { useLocalization } from "../../hooks/useLocalization";
import { translateAddress } from "../../utils/addressTranslation";

export interface ProjectHeaderProps {
  project: ProjectProperty;
}

/**
 * Project header with title and developer info
 */
const ProjectHeader = memo<ProjectHeaderProps>(({ project }) => {
  const { t, isRTL } = useLocalization();

  // RTL-aware styles
  const rtlStyles = useMemo(
    () => ({
      projectType: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
        alignSelf: (isRTL ? "flex-end" : "flex-start") as "flex-start" | "flex-end",
      },
      projectHeader: {
        flexDirection: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
      },
      logoContainer: {
        marginRight: isRTL ? 0 : wp(3),
        marginLeft: isRTL ? wp(3) : 0,
      },
      projectTitle: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
      projectAddress: {
        textAlign: (isRTL ? "right" : "left") as "left" | "right",
      },
    }),
    [isRTL]
  );

  const translatedAddress = useMemo(
    () => translateAddress(project.address, t),
    [project.address, t]
  );

  return (
    <View style={styles.titleSection}>
      <Text style={[styles.projectType, rtlStyles.projectType]}>
        {t("projects.floorForSale")}
      </Text>
      <View style={[styles.projectHeader, rtlStyles.projectHeader]}>
        {project.developerLogo && (
          <View style={[styles.logoContainer, rtlStyles.logoContainer]}>
        <Image
          source={{ uri: project.developerLogo }}
          style={styles.developerLogo}
              resizeMode="cover"
        />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.projectTitle, rtlStyles.projectTitle]}>
            {project.projectNameArabic}
          </Text>
          <Text style={[styles.projectAddress, rtlStyles.projectAddress]}>
            {translatedAddress}
          </Text>
        </View>
      </View>
    </View>
  );
});

ProjectHeader.displayName = "ProjectHeader";

const styles = StyleSheet.create({
  titleSection: {
    backgroundColor: "#fff",
    padding: wp(4),
  },
  projectType: {
    backgroundColor: "#d0d7e1",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    fontSize: wp(3.5),
    color: "#374151",
    marginBottom: hp(1),
    borderRadius: wp(1),
    overflow: "hidden",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: wp(20),
    height: wp(20),
    maxWidth: wp(20),
    maxHeight: wp(20),
    backgroundColor: "#f3f4f6",
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  developerLogo: {
    width: "100%",
    height: "100%",
  },
  projectTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp(0.5),
  },
  projectAddress: {
    fontSize: wp(3.3),
    color: "#6b7280",
    lineHeight: hp(2.5),
  },
});

export default ProjectHeader;
