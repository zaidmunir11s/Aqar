import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface LanguageConverterProps {
  language?: "english" | "arabic";
  onPress?: () => void;
}

const LanguageConverter: React.FC<LanguageConverterProps> = ({
  language = "english",
  onPress,
}) => {
  // Show the language you'll switch TO (opposite of current)
  const languageText = language === "english" ? "العربية" : "English";
  const rightBubbleChar = language === "english" ? "ε" : "ع";

  const isEnglish = language === "english";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isEnglish && (
        <Text style={[styles.languageText, styles.languageTextLeft]}>
          {languageText}
        </Text>
      )}
      <View style={styles.bubblesContainer}>
        {/* Left bubble (A) - tail on the left, behind, slightly above */}
        <View style={styles.leftBubble}>
          <Ionicons
            name="chatbubble-sharp"
            size={wp(7)}
            color={COLORS.primary}
            style={styles.bubbleIcon}
          />
          <View style={styles.leftBubbleText}>
            <Text style={styles.bubbleText}>A</Text>
          </View>
        </View>
        {/* Right bubble (ε) - tail on the right, in front, slightly below */}
        <View style={styles.rightBubble}>
          <Ionicons
            name="chatbubble-sharp"
            size={wp(7)}
            color={COLORS.primary}
            style={styles.rightBubbleIcon}
          />
          <View style={styles.rightBubbleText}>
            <Text style={styles.bubbleText}>{rightBubbleChar}</Text>
          </View>
        </View>
      </View>
      {!isEnglish && (
        <Text style={[styles.languageText, styles.languageTextRight]}>
          {languageText}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  bubblesContainer: {
    width: wp(12),
    height: wp(9.5),
    position: "relative",
  },
  bubbleIcon: {
    position: "absolute",
  },
  rightBubbleIcon: {
    position: "absolute",
    transform: [{ scaleX: -1 }], // Flip horizontally so tail is on the right
  },
  leftBubble: {
    position: "absolute",
    left: 0,
    top: -wp(1.5),
    zIndex: 1,
    width: wp(9),
    height: wp(9),
    alignItems: "center",
    justifyContent: "center",
  },
  rightBubble: {
    position: "absolute",
    left: wp(3.2),
    top: wp(0.8),
    zIndex: 2,
    width: wp(9),
    height: wp(9),
    alignItems: "center",
    justifyContent: "center",
  },
  leftBubbleText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: wp(0.5),
  },
  rightBubbleText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: wp(0.5),
  },
  bubbleText: {
    color:"#fff",
    fontSize: wp(3.5),
    fontWeight: "500",
  },
  languageText: {
    color: COLORS.primary,
    fontSize: wp(6),
    fontWeight: "700",
  },
  languageTextLeft: {
    marginRight: wp(2.5),
  },
  languageTextRight: {
    marginLeft: wp(2.5),
  },
});

export default LanguageConverter;
