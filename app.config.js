const withPurchases = require("./plugins/react-native-purchases");

module.exports = {
  expo: {
    name: "iq-night",
    slug: "iq-night",
    version: "1.0.0",
    sdkVersion: "52.0.0",
    ios: {
      bundleIdentifier: "com.iqnight.app",
    },
    plugins: [withPurchases],
    extra: {
      eas: {
        projectId: "04bda34c-5ce2-4edd-804f-f4cdd1cb6c82", // დაამატეთ ეს ხაზი
      },
    },
  },
};
