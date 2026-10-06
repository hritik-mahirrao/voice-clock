import { registerPlugin, Capacitor } from '@capacitor/core';

const NativeTimerPlugin = registerPlugin('NativeTimer');

let webInterval = null;
let webListeners = [];

export const NativeTimer = Capacitor.isNativePlatform() ? NativeTimerPlugin : {
  start: async ({ ms }) => {
    if (webInterval) clearInterval(webInterval);
    webInterval = setInterval(() => {
      webListeners.forEach(fn => fn());
    }, ms);
  },
  stop: async () => {
    if (webInterval) {
      clearInterval(webInterval);
      webInterval = null;
    }
  },
  addListener: async (eventName, callback) => {
    if (eventName === 'onTick') {
      webListeners.push(callback);
      return {
        remove: async () => {
          webListeners = webListeners.filter(fn => fn !== callback);
        }
      };
    }
  }
};
