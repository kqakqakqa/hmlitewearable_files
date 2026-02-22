console.info("pages/menu/menu onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });
  },
  clickAbout() {
    $app.getImports().router.replace({
      uri: "pages/menu/about/about",
    });
  },
  clickLicenses() {
    $app.getImports().router.replace({
      uri: "pages/menu/licenses/licenses",
    });
  },
  clickBack() {
    $app.getImports().router.replace({
      uri: "/pages/viewer-dir/viewer-dir",
    });
  },
  swipeBack(data) {
    if (data.direction === "right") return this.clickBack();
  },
  nullFn() { },
  exitApp() {
    $app.getImports().app.terminate();
  },
}