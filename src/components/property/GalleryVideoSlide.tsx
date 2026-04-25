import React, { memo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

type Props = {
  uri: string;
  width: number;
  height: number;
};

const GalleryVideoSlide = memo(function GalleryVideoSlide({
  uri,
  width,
  height,
}: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={[styles.wrap, { width, height }]}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls
        contentFit="contain"
        {...(Platform.OS === "android"
          ? { surfaceType: "textureView" as const }
          : {})}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#000",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default GalleryVideoSlide;
