import app from "@system.app";
import battery from "@system.battery";
import brightness from "@system.brightness";
// import configuration from "@system.configuration";
import device from "@system.device";
// import fetch from "@system.fetch";
import file from "@system.file";
// import file from "./file.js";
// import geolocation from "@system.geolocation";
// import router from "@system.router";
import router from "./router.js";
// import sensor from "@system.sensor";
import storage from "@system.storage";
// import storage from "./storage.js";
// import vibrator from "@system.vibrator";

import appName from "./appName.js";
import bundleName from "./bundleName.js";
// import headerBar from "./headerBar.js";
import headerTimeBattery from "./headerTimeBattery.js";
import memory from "./memory.js";
import uiSizes from "./uiSizes.js";

const imports = {
  app: app,
  battery: battery,
  brightness: brightness,
  // configuration: configuration,
  device: device,
  // fetch: fetch,
  file: file,
  // geolocation: geolocation,
  router: router,
  // sensor: sensor,
  storage: storage,
  // vibrator: vibrator,

  appName: appName,
  bundleName: bundleName,
  // headerBar: headerBar,
  headerTimeBattery: headerTimeBattery,
  memory: memory,
  uiSizes: uiSizes,

};

const _this = {
  onCreate: () => {
    console.info("app onCreate");
  },
  onDestroy: () => {
    console.info("app onDestroy");
  },
  getImports: () => {
    return imports;
  },
};

export default _this;