console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

export default {
  data: {
    timeBatteryStr: "",
    uiSizes: $app.getImports().uiSizes,
    lf: "\n",
    theme: $app.getImports().memory.theme,
    fontSize: $app.getImports().memory.fontSize,
    turnPageSpeed: $app.getImports().memory.turnPageSpeed,
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
  turnPageSpeedDown() {
    this.turnPageSpeed = Math.max(1, this.turnPageSpeed - 1);
    $app.getImports().memory.turnPageSpeed = this.turnPageSpeed;
    $app.getImports().memory.save("turnPageSpeed");
  },
  turnPageSpeedUp() {
    this.turnPageSpeed = Math.min(30, this.turnPageSpeed + 1);
    $app.getImports().memory.turnPageSpeed = this.turnPageSpeed;
    $app.getImports().memory.save("turnPageSpeed");
  },
}