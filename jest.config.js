module.exports = {
  preset: 'react-native',
  // react-native-gesture-handler's native module isn't present under Jest, so
  // requiring it (App wraps the tree in GestureHandlerRootView) throws without
  // the mocks it ships for exactly this purpose.
  setupFiles: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    // Mocks NetInfo, whose native module App reaches through the OfflineGate.
    './jest.setup.js',
  ],
  // The react-native preset's default is
  // `node_modules/(?!(@react-native|react-native)/)`, i.e. transform nothing
  // in node_modules but React Native itself. That is too narrow here:
  // babel-preset-expo rewrites every `react-native-vector-icons/X` import to
  // `@expo/vector-icons/X` (see babel-preset-expo/build/index.js), and those
  // files ship untranspiled ESM — so App.test.tsx, which renders the whole
  // tree, died on `SyntaxError: Cannot use import statement outside a module`
  // the moment it reached the tab bar's icons. The other suites passed only
  // because none of them imports a screen.
  //
  // The icon sets also import their own .ttf, which the react-native preset's
  // asset transformer doesn't cover (it handles images), so Jest tried to
  // parse a font as JavaScript. See jest/asset-file-mock.js.
  moduleNameMapper: {
    '\\.(ttf|otf|woff2?|eot)$': '<rootDir>/jest/asset-file-mock.js',
    // Deliberately NOT mapping @expo/vector-icons to a single stub. It looks
    // tempting — it would keep the expo-font/expo-asset/expo-modules-core
    // import chain and its unlinked-native-module warnings out of the run —
    // but babel-preset-expo rewrites `react-native-vector-icons/<Set>` to
    // `@expo/vector-icons/<Set>` inside test files too, so one stub collapses
    // every set onto a single resolved module. Suites that mock several sets
    // to distinct host types (gradiant-header-send.test.tsx) then have all of
    // them resolve to whichever mock was registered last, and assertions that
    // look an icon up by type match the wrong element.
  },
  // Listed by package rather than disabling the ignore wholesale, so Jest
  // isn't made to transform all of node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        // React Native itself and the react-native-* ecosystem. Several of
        // this app's native modules publish untranspiled sources —
        // react-native-image-picker ships src/index.ts, gesture-handler and
        // reanimated ship ESM — so listing them one by one just moves the
        // failure to the next import.
        '(jest-)?react-native.*',
        '@react-native(-community)?/.*',
        // `expo` itself, plus the expo-* packages @expo/vector-icons reaches
        // through (expo-font, and what that pulls in) — all published as ESM.
        'expo(nent)?',
        'expo-.*',
        '@expo(nent)?/.*',
        '@unimodules/.*',
        'unimodules',
        '@react-navigation/.*',
      ].join('|') +
      ')/)',
  ],
};
