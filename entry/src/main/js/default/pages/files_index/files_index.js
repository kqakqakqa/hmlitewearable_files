console.info("pages/files_index/files_index onInit");

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

  onShow() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: true });
  },

  onHide() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: false });
  },

  viewDir(mode) {
    $app.getImports().memory.viewDirMode = mode;
    this.pageTo("viewer_dir");
  },

  pageTo(p) {
    $app.getImports().router.replace({
      uri: "pages/" + p + "/" + p,
    });
  },

  swipeBack(d) {
    if (d.direction === "right") return this.exitApp();
  },

  exitApp() {
    $app.getImports().app.terminate();
  },

}