console.info("pages/viewer_script/viewer_script onInit");

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
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: true });
  },

  onHide() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: false });
  },

  onRunClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_script_run/viewer_script_run" });
  },

  onViewTextClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_text/viewer_text" });
  },

  clickBack() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({
      uri: "pages/viewer_dir/viewer_dir",
    });
  },

  swipeBack(d) {
    if (d.direction === "right") return this.clickBack();
  },
}