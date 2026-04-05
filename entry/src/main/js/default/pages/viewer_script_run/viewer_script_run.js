console.info("pages/viewer_script_run/viewer_script_run onInit");

let _this;
let userScript = "";
let isDestroyed = false;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    log: "",
  },
  onInit() {
    _this = this;

    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });

    $app.getImports().file.readText({
      uri: "internal://app" + $app.getImports().memory.paths.join(""),
      fail: (data, code) => {
        this.showLog("文件读取失败: " + code + " " + data);
      },
      success: d => {
        if (isDestroyed) return;

        try {
          userScript = d.text;
          this.showLog("开始运行");
          this.runScript();

        } catch (e) {
          this.showLog("运行失败: " + e.message);
        }
      },
    });
  },

  onShow() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: true });
  },

  onHide() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: false });
  },

  onDestroy() {
    isDestroyed = true;
    console.info("stop running script");
  },
  runScript() {
    if (isDestroyed) return;

    try {
      const userScriptConsole = {
        log() { _this.showLog([].slice.call(arguments).join(" "), "[DEBUG]"); },
        error() { _this.showLog([].slice.call(arguments).join(" "), "[ERROR]"); },
        warn() { _this.showLog([].slice.call(arguments).join(" "), "[WARN]"); },
        info() { _this.showLog([].slice.call(arguments).join(" "), "[INFO]"); },
      };

      console.log(JSON.stringify(requireNative("system.app")))

      new Function("console", userScript)(userScriptConsole);

    } catch (e) {
      this.showLog("出现错误: " + e.message + "\n运行已停止");
      return;
    }

    this.showLog("运行完成");

  },
  showLog(msg, type) {
    console.info("run script: " + (type ? (type + " ") : "") + msg);
    if (this.log !== "") this.log += "\n";
    this.log += msg;
  },

  onViewTextClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_text/viewer_text" });
  },

  clickBack() {
    $app.getImports().router.replace({
      uri: "pages/viewer_script/viewer_script",
    });
  },

  swipeBack(d) {
    if (d.direction === "right") return this.clickBack();
  },
}