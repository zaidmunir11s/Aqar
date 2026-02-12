module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          reanimated: true,
        },
      ],
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
