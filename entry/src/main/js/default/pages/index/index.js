import router from "../../router.js";

// import appName from "../../appName.js";
import bundleName from "../../bundleName.js";
// import headerBar from "../../headerBar.js";
import headerTimeBattery from "../../headerTimeBattery.js";
import memory from "../../memory.js";
import uiSizes from "../../uiSizes.js";
// import lookupDict from "../../lookupDictV4.js";

console.info("pages/index/index onInit");

const imports = {
  app: requireNative("system.app"),
  battery: requireNative("system.battery"),
  brightness: requireNative("system.brightness"),
  // configuration: requireNative("system.configuration"),
  device: requireNative("system.device"),
  // fetch: requireNative("system.fetch"),
  file: requireNative("system.file"),
  // geolocation: requireNative("system.geolocation"),
  router: router, // requireNative("system.router"),
  // sensor: requireNative("system.sensor"),
  storage: requireNative("system.storage"),
  vibrator: requireNative("system.vibrator"),

  // appName: appName,
  bundleName: bundleName,
  // headerBar: headerBar,
  headerTimeBattery: headerTimeBattery,
  memory: memory,
  uiSizes: uiSizes,
  // lookupDict: lookupDict,
};

export default {
  onInit() {
    $app.setImports(imports);

    initImports(() => router.replace({ uri: "pages/files_index/files_index" }));
  },
}

function initImports(onAllDone) {
  console.info("initImports");
  const imports = $app.getImports();
  const keys = Object.keys(imports);
  let idx = 0;

  function next() {
    if (idx >= keys.length) {
      console.info("all init done");
      onAllDone(imports);
      return;
    }

    const key = keys[idx++];
    console.info("init " + key);

    if (imports[key] && imports[key].init) {
      let done = false;

      const timer = setTimeout(() => {
        if (!done) {
          console.warn("init " + key + " timeout, skip");
          done = true;
          setTimeout(next, 0);
        }
      }, 3000);

      imports[key].init(() => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          console.info("init " + key + " done");
          setTimeout(next, 0);
        }
      });
    } else {
      console.info("init " + key + " not needed");
      setTimeout(next, 0);
    }
  }

  setTimeout(next, 0);
}