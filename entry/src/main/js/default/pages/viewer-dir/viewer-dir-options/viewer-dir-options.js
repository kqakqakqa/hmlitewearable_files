console.info("pages/viewer-dir/viewer-dir-options/viewer-dir-options onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    lf: "\n",
    fileName: "",
    failData: "",
    fileInfo_type: "",
    fileInfo_length: "",
    fileInfo_time: "",
  },
  onInit() {
    this.openPath();
  },
  openPath() {
    const path = $app.getImports().memory.paths.join("");
    this.fileName = $app.getImports().memory.paths[$app.getImports().memory.paths.length - 1].split("/")[1];

    console.log("file.get " + path);
    $app.getImports().file.get({
      uri: "internal://app" + path,
      success: f => {
        console.log("path info: " + JSON.stringify(f))

        this.fileInfo_type = f.type;
        this.fileInfo_length = f.type === "file" ? toByteSizeStr(f.length) : "-";
        let ts = f.lastModifiedTime < 1e11 ? f.lastModifiedTime * 1000 : f.lastModifiedTime;
        this.fileInfo_time = f.lastModifiedTime ? getTimeStr(new Date(ts)) : "-";
      },
      fail: this.showFailData,
    });
  },
  showFailData(data, code = undefined) {
    this.failData = code + " " + data;
  },
  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir" });
  },
  onOpenAsTextClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text" });
  },
  onOpenAsImgClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-img/viewer-img" });
  },
  onOpenAsScriptClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-script/viewer-script-warnings/viewer-script-warnings" });
  },
}

function toByteSizeStr(byteLen) {
  if (byteLen < 0) return "-";
  if (byteLen >= 1e6) return +(byteLen / 1e6).toFixed(2) + "MB";
  if (byteLen >= 1e3) return +(byteLen / 1e3).toFixed(2) + "KB";
  return +(byteLen).toFixed(2) + "字节";
}

function getTimeStr(date) {
  var y = date.getFullYear();
  var m = padNum(date.getMonth() + 1);
  var d = padNum(date.getDate());
  var h = padNum(date.getHours());
  var mi = padNum(date.getMinutes());
  var s = padNum(date.getSeconds());
  return y + "-" + m + "-" + d + " " + h + ":" + mi + ":" + s;
}

function padNum(n) { return n < 10 ? "0" + n : n; }