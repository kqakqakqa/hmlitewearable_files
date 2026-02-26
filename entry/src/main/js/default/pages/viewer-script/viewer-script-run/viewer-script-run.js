console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

let steps;
let isDestroyed = false;
let currentIndex = 0;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    log: "",
  },
  onInit() {
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
          const script = JSON.parse(d.text);
          if (!script) throw new Error("脚本格式不正确");
          if (!script.steps) throw new Error("脚本缺少steps");

          steps = script.steps;
          this.showLog("开始运行");
          setTimeout(this.runNextStep, 100);

        } catch (e) {
          this.showLog("运行失败: " + e.message);
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
  onDestroy() {
    isDestroyed = true;
    console.info("stop running script");
  },
  runNextStep() {
    if (isDestroyed) return;

    if (currentIndex >= steps.length) {
      this.showLog("运行完成");
      return;
    }

    const step = steps[currentIndex++];

    try {
      const funcs = {
        "console.log": p => {
          this.showLog("" + p.params);
          p.success();
        },
        "file.mkdir": p => fileApiCheck(p, $app.getImports().file.mkdir),
        "file.writeText": p => fileApiCheck(p, $app.getImports().file.writeText),
        "file.writeArrayBuffer": p => {
          if (Array.isArray(p.buffer)) {
            p.buffer = new Uint8Array(p.buffer);
          }
          fileApiCheck(p, $app.getImports().file.writeArrayBuffer);
        },
        "file.copy": p => fileApiCheck(p, $app.getImports().file.copy),
        "file.move": p => fileApiCheck(p, $app.getImports().file.move),
        "file.delete": p => fileApiCheck(p, $app.getImports().file.delete),
        "file.rmdir": p => fileApiCheck(p, $app.getImports().file.rmdir),
      };

      const func = funcs[step.call];

      if (typeof func !== 'function') {
        throw new Error("找不到接口: " + step.call);
      }

      const fullParams = {
        fail: (data, code) => {
          if (isDestroyed) return;
          return this.showLog("出现错误: " + step.call + "失败, " + code + " " + data + "\n运行已停止");
        },
        success: () => {
          if (isDestroyed) return;
          setTimeout(this.runNextStep, 100);
        },
      };

      const p = step.params;
      const isObject = (p !== null && typeof p === "object" && !Array.isArray(p));
      if (isObject) {
        for (let key in p) {
          if (key !== "success" && key !== "fail") {
            fullParams[key] = p[key];
          }
        }
      } else { // string, number, array, null
        fullParams.params = p;
      }

      func(fullParams);

    } catch (e) {
      this.showLog("出现错误: " + e.message + "\n运行已停止");
    }

  },
  showLog(msg) {
    console.info("run script: " + msg);
    if (this.log !== "") this.log += "\n";
    this.log += msg;
  },
  onGoBackClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-script/viewer-script" });
  },
  onViewTextClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text" });
  },
}

function fileApiCheck(p, func) {
  const uri = "" + (p.uri || "");
  console.log(uri, uri.indexOf("../"))
  if (uri.indexOf("../") !== -1 || uri.indexOf("..\\") !== -1) {
    p.fail("File or directory not exist", "301");
    return;
  }
  func(p);
};