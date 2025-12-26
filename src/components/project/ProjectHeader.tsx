import React, { memo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import type { ProjectProperty } from "../../types/property";

export interface ProjectHeaderProps {
  project: ProjectProperty;
}

/**
 * Project header with title and developer info
 */
const ProjectHeader = memo<ProjectHeaderProps>(({ project }) => {
  return (
    <View style={styles.titleSection}>
      <Text style={styles.projectType}>Floor for sale</Text>
      <View style={styles.projectHeader}>
        <Image
          source={{ uri: project.developerLogo }}
          style={styles.developerLogo}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.projectTitle}>{project.projectNameArabic}</Text>
          <Text style={styles.projectAddress}>{project.address}</Text>
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
    marginRight: wp(70),
    fontSize: wp(3.5),
    color: "#374151",
    marginBottom: hp(1),
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  developerLogo: {
    width: wp(20),
    height: wp(20),
    backgroundColor: "#f3f4f6",
    borderRadius: wp(2),
    marginRight: wp(3),
    padding: wp(2),
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
