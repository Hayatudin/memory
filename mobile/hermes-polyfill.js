// Runtime polyfill for React Native Hermes & Bridgeless environment in Expo
(function (global) {
  // Enable TurboModule legacy interop so NativeModules fallbacks work
  global.RN$TurboInterop = true;

  // Non-destructive fallback for BatchedBridge configuration
  // Uses a getter/setter so native Expo Go can still override it
  if (typeof global.__fbBatchedBridgeConfig === "undefined") {
    var _storedBridgeConfig = undefined;
    Object.defineProperty(global, "__fbBatchedBridgeConfig", {
      configurable: true,
      enumerable: true,
      get: function () {
        return _storedBridgeConfig || { remoteModuleConfig: [] };
      },
      set: function (val) {
        _storedBridgeConfig = val;
      },
    });
  }

  // Fallback TurboModules that may not be exposed by Expo Go on iOS
  var defaultConstants = {
    PlatformConstants: {
      getConstants: function () {
        return {
          forceTouchAvailable: false,
          interfaceIdiom: "phone",
          isTesting: false,
          isDisableAnimations: false,
          osVersion: "17.0",
          reactNativeVersion: { major: 0, minor: 76, patch: 7, prerelease: null },
          systemName: "iOS",
          isMacCatalyst: false,
        };
      },
    },
    SettingsManager: {
      getConstants: function () {
        return { settings: {} };
      },
    },
  };

  // Intercept __turboModuleProxy to guarantee PlatformConstants is always available
  var origTurboProxy = typeof global.__turboModuleProxy === "function" ? global.__turboModuleProxy : null;
  global.__turboModuleProxy = function (name) {
    if (origTurboProxy) {
      try {
        var mod = origTurboProxy(name);
        if (mod != null) return mod;
      } catch (e) {}
    }
    if (defaultConstants[name]) {
      return defaultConstants[name];
    }
    try {
      if (global.nativeModuleProxy && global.nativeModuleProxy[name]) {
        return global.nativeModuleProxy[name];
      }
    } catch (e) {}
    return null;
  };

  if (typeof global.nativeModuleProxy === "object" && global.nativeModuleProxy !== null) {
    if (!global.nativeModuleProxy.PlatformConstants) {
      global.nativeModuleProxy.PlatformConstants = defaultConstants.PlatformConstants;
    }
  }

  // Safe wrapper for Hermes Promise rejection tracking
  if (typeof global.HermesInternal !== "undefined" && global.HermesInternal) {
    var origTracker = global.HermesInternal.enablePromiseRejectionTracker;
    if (typeof origTracker === "function") {
      global.HermesInternal.enablePromiseRejectionTracker = function (opts) {
        try {
          return origTracker.call(global.HermesInternal, opts);
        } catch (e) {
          // Prevent fatal crash during core runtime initialization
        }
      };
    }
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : typeof window !== "undefined"
    ? window
    : this
);
