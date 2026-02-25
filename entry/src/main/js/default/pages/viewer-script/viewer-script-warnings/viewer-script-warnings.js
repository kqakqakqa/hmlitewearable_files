console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

const warningTexts = [
  "你正在运行自定义脚本。",
  "自定义脚本可以访问和修改文件。",
  "自定义脚本可能对数据、程序、甚至系统造成不可逆的影响。",
  "本程序不对自定义脚本的内容负责。",
  "如果你不清楚这个自定义脚本的作用，请不要继续！",
];

let continueTimeout;

export default {
  data: {
    timeBatteryStr: "",
    uiSizes: $app.getImports().uiSizes,
    lf: "\n",
    warningText: "",
    continueTimeoutTime: 0,
    warningIndex: 0,
    scriptWarningFinished: $app.getImports().memory.scriptWarningFinished,
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });

    this.nextWarning();
  },
  onShow() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: true });
  },
  onHide() {
    if (this.$refs.mainList.rotation) this.$refs.mainList.rotation({ focus: false });
  },
  onDestroy() {
    clearTimeout(continueTimeout);
    continueTimeout = undefined;
  },
  nextWarning() {
    if (this.scriptWarningFinished) return this.warningText = warningTexts[warningTexts.length - 1];

    this.warningText = warningTexts[this.warningIndex];
    this.startTimer();
  },
  startTimer() {
    this.continueTimeoutTime = 5;
    if (continueTimeout) {
      clearTimeout(continueTimeout);
      continueTimeout = undefined;
    }

    const tick = () => {
      if (this.continueTimeoutTime > 0) {
        continueTimeout = setTimeout(() => {
          this.continueTimeoutTime--;
          tick();
        }, 1000);
      }
    };
    tick();
  },
  onContinueClick() {
    if (this.scriptWarningFinished) return;
    if (this.continueTimeoutTime > 0) return;

    this.warningIndex++;
    if (this.warningIndex >= warningTexts.length) {
      this.scriptWarningFinished = true;
      $app.getImports().memory.scriptWarningFinished = true;
      $app.getImports().memory.save("scriptWarningFinished");
      return;
    }

    this.nextWarning();
  },
  onContinueSwipe(data) {
    if (data.direction === "right" && this.scriptWarningFinished) return $app.getImports().router.replace({ uri: "pages/viewer-script/viewer-script" });
  },
  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir" });
  },
}