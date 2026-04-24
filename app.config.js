const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Config plugin: enable android:largeHeap to reduce OOM crashes on Android
 * when the app hits the default heap limit (e.g. during screen transitions
 * or when many native views are created).
 */
function withAndroidLargeHeap(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];
    if (application?.$) {
      application.$["android:largeHeap"] = "true";
    }
    return config;
  });
}

const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    owner: "zaidmunir_2",
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        ...((appJson.expo.extra && appJson.expo.extra.eas) || {}),
        projectId: "096e7c99-604e-4e14-a083-91257ca48a5e",
      },
    },
    plugins: [...(appJson.expo.plugins || []), withAndroidLargeHeap],
  },
};
