console.info("pages/viewer-script/viewer-script onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    preview: "",
    errMessage: "",
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });

    $app.getImports().file.readText({
      uri: "internal://app" + $app.getImports().memory.paths.join(""),
      fail: (data, code) => {
        this.errMessage = "文件读取失败: " + code + " " + data;
        console.error(this.errMessage);
      },
      success: d => {
        const text = d.text.split("\r\n").join("\n");
        this.preview = text.slice(64) + ((text.length > 64) ? "...（共" + text.length + "字符）" : "");
      },
    });
  },
  onShow() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: true });
  },
  onHide() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: false });
  },
  onRunClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-script/viewer-script-run/viewer-script-run" });
  },
  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir" });
  },
  onViewTextClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text" });
  },
}