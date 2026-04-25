// react-native.config.js
module.exports = {
  dependencies: {
    "@react-native-async-storage/async-storage": {
      platforms: {
        android: {
          codegenConfig: null,
        },
      },
    },
    "@solana-mobile/mobile-wallet-adapter-protocol": {
      platforms: {
        android: {
          codegenConfig: null,
        },
      },
    },
  },
};
