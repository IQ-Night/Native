const withPurchases = require("./plugins/react-native-purchases");

module.exports = {
  expo: {
    name: "IQ Night",
    slug: "iq-night",
    version: "1.0.1",
    sdkVersion: "52.0.0",
    icon: "./assets/iqnight-icon.png",
    ios: {
      bundleIdentifier: "com.iqnight.app",
      buildNumber: "1.0.18",
      icon: "./assets/iqnight-icon.png",
      supportsTablet: false,
    },
    splash: {
      image: "./assets/bg.jpg",
      resizeMode: "contain",
      backgroundColor: "#000",
    },
    plugins: [withPurchases],
    extra: {
      eas: {
        projectId: "04bda34c-5ce2-4edd-804f-f4cdd1cb6c82",
      },
    },
  },
};
