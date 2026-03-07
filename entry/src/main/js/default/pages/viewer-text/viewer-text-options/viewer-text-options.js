console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

export default {
  data: {
    timeBatteryStr: "",
    uiSizes: $app.getImports().uiSizes,
    theme: $app.getImports().memory.theme,
    fontSize: $app.getImports().memory.fontSize,
    autoPagerSpeed: $app.getImports().memory.autoPagerSpeed,
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });
  },
  onShow() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: true });
  },
  onHide() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: false });
  },
  onGoBackClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text" });
  },
  changeFontSize(v) {
    this.fontSize = v;
    $app.getImports().memory.fontSize = v;
    $app.getImports().memory.save("fontSize");
  },
  changeTheme(v) {
    // 原有逻辑
    this.theme = v;
    $app.getImports().memory.theme = v;
    $app.getImports().memory.save("theme");

    let bgColor = "#000";
    let textColor = "#fff";

    switch (v) {
      case "纯白": {
        bgColor = "#fff";
        textColor = "#000";
        break;
      }
      case "深灰": {
        bgColor = "#333";
        textColor = "#ddd";
        break;
      }
      case "浅灰": {
        bgColor = "#ddd";
        textColor = "#333";
        break;
      }
      case "纯黑":
      default: {
        bgColor = "#000";
        textColor = "#fff";
        break;
      }
    }

    this.bgColor = bgColor;
    this.textColor = textColor;
    $app.getImports().memory.bgColor = bgColor;
    $app.getImports().memory.textColor = textColor;
    $app.getImports().memory.save("bgColor");
    $app.getImports().memory.save("textColor");
  },
  autoPagerSpeedDown() {
    this.autoPagerSpeed = Math.max(1, this.autoPagerSpeed - 1);
    $app.getImports().memory.autoPagerSpeed = this.autoPagerSpeed;
    $app.getImports().memory.save("autoPagerSpeed");
  },
  autoPagerSpeedUp() {
    this.autoPagerSpeed = Math.min(30, this.autoPagerSpeed + 1);
    $app.getImports().memory.autoPagerSpeed = this.autoPagerSpeed;
    $app.getImports().memory.save("autoPagerSpeed");
  },
}