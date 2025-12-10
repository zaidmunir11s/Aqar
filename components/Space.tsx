import { View } from "react-native";

import React, { FC } from "react";

import { scale, verticalScale } from "react-native-size-matters";

interface ISpaceProps {
  orientation?: "vertical" | "horizontal";

  value?: number;
}

const Space: FC<ISpaceProps> = ({ orientation = "vertical", value }) => {
  if (orientation === "horizontal") {
    return <View style={{ width: value ? scale(value) : scale(16) }} />;
  }

  return (
    <View
      style={{ height: value ? verticalScale(value) : verticalScale(16) }}
    />
  );
};

export default Space;
