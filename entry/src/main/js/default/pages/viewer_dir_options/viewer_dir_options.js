console.info("pages/viewer_dir_options/viewer_dir_options onInit");

let pathInfo;
let favlist = [];

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,

    fileName: "",
    failData: "",
    fileInfo_type: "",
    fileInfo_length: "",
    fileInfo_time: "",

    isInFavorite: false,
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });

    this.openPath();
    this.checkFavorite();
  },

  onShow() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: true });
  },

  onHide() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: false });
  },

  openPath() {
    const path = $app.getImports().memory.paths.join("");
    this.fileName = path.slice(path.lastIndexOf("/") + 1);

    console.log("file.get " + path);
    $app.getImports().file.get({
      uri: "internal://app" + path,
      success: f => {
        console.log("path info: " + JSON.stringify(f));
        pathInfo = JSON.parse(JSON.stringify(f));
        pathInfo.uri = path;

        this.fileInfo_type = f.type;
        this.fileInfo_length = f.type === "file" ? toByteSizeStr(f.length) : "-";
        let ts = f.lastModifiedTime < 1e11 ? f.lastModifiedTime * 1000 : f.lastModifiedTime;
        this.fileInfo_time = f.lastModifiedTime ? getTimeStr(new Date(ts)) : "-";
      },
      fail: this.showFailData,
    });
  },

  checkFavorite(onDone) {
    const favoriteUri = "internal://app/list_favorite.json";
    const path = $app.getImports().memory.paths.join("");

    $app.getImports().file.readText({
      uri: favoriteUri,
      fail: (data, code) => {
        if (code !== 301) return console.error("read list_recent.json failed: " + code + " " + data);

        // favorite不存在
        favlist.length = 0;
        this.isInFavorite = false;
        return onDone && onDone(-1);
      },
      success: d => {
        try {
          favlist = JSON.parse(d.text).fileList;
        } catch (e) {
          console.error(e);
        }

        for (let i = 0; i < favlist.length; i++) {
          if (favlist[i].uri === path) {
            this.isInFavorite = true;
            return onDone && onDone(i);
          }
        }

        this.isInFavorite = false;
        return onDone && onDone(-1);

      },
    });
  },

  switchFavorite() {
    const favoriteUri = "internal://app/list_favorite.json";
    const maxLen = 100;

    this.checkFavorite(index => {
      // 添加 / 删除
      if (index === -1) {
        favlist.unshift(pathInfo);
        if (favlist.length > maxLen) favlist.length = maxLen;

      } else {
        favlist.splice(index, 1);

      }

      // 写回文件
      $app.getImports().file.writeText({
        uri: favoriteUri,
        text: JSON.stringify({ fileList: favlist }),
        fail: (data, code) => console.error("save list_favorite.json failed: " + code + " " + data),
        success: () => this.isInFavorite = !this.isInFavorite,
      });
    });

  },

  showFailData(data, code = undefined) {
    this.failData = code + " " + data;
  },

  onOpenAsTextClick() {
    if (pathInfo) $app.getImports().memory.fileSize = pathInfo.length;
    return $app.getImports().router.replace({ uri: "pages/viewer_text/viewer_text" });
  },
  onOpenAsImgClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_img/viewer_img" });
  },
  onOpenAsScriptClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_script_warnings/viewer_script_warnings" });
  },

  clickBack() {
    $app.getImports().memory.paths.pop();
    $app.getImports().router.replace({
      uri: "pages/viewer_dir/viewer_dir",
    });
  },

  swipeBack(d) {
    if (d.direction === "right") return this.clickBack();
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
  return y + "-" + m + "-" + d + "\n" + h + ":" + mi + ":" + s;
}

function padNum(n) { return n < 10 ? "0" + n : n; }