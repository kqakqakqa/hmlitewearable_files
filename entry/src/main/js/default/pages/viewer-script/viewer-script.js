console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    description: "",
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
        try {
          const script = JSON.parse(d.text);
          if (script && script.description) {
            this.description = script.description;
          } else {
            this.errMessage = "脚本格式不正确: 缺少 description";
            console.warn(this.errMessage);
          }
        } catch (e) {
          this.errMessage = "JSON 解析失败: " + e.message;
          console.warn(this.errMessage);
        }
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