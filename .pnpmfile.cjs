module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'react-native-webview') {
        pkg.dependencies = {};
        pkg.peerDependencies = {};
        pkg.optionalDependencies = {};
      }
      if (pkg.name === '@react-native-async-storage/async-storage') {
        pkg.optionalDependencies = {};
      }
      return pkg;
    },
  },
};
