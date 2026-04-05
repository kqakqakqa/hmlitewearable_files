console.info("pages/viewer_dir/viewer_dir onInit");

const pageLen = 7;
let fileCount = 0;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    mode: $app.getImports().memory.viewDirMode,
    viewPath: "",
    files: [],
    failData: "",
    hasPrev: false,
    hasNext: false,
    showPosStart: "",
  },
  onInit() {
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });
  },
  onReady() {
    this.openDir();
  },
  onShow() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: true });
  },
  onHide() {
    if (this.$refs.bindRotation.rotation) this.$refs.bindRotation.rotation({ focus: false });
  },
  clickGoParent_DelRecent() {
    if (this.mode === "dir") {
      $app.getImports().memory.paths.push("\\..");
      this.clearPageData();
      this.openDir();

    } else if (this.mode === "recent") {

    }
  },

  onGoClick(uri) {
    const correctUri = (this.mode === "dir") ? ("/" + uri.slice(uri.lastIndexOf("/") + 1)) : uri;
    $app.getImports().memory.paths.push(correctUri);
    this.openPath();
  },
  onGoLongpress(uri) {
    const correctUri = (this.mode === "dir") ? ("/" + uri.slice(uri.lastIndexOf("/") + 1)) : uri;
    $app.getImports().memory.paths.push(correctUri);
    $app.getImports().router.replace({ uri: "pages/viewer_dir_options/viewer_dir_options" });
  },
  openPath() {
    this.viewPath = $app.getImports().memory.paths.join("");
    console.log("open path " + this.viewPath);
    $app.getImports().file.get({
      uri: "internal://app" + this.viewPath,
      fail: this.showFailData,
      success: f => {
        console.log("path info: " + JSON.stringify(f));
        // dir
        if (f.type == "dir") {
          this.clearPageData();
          return this.openDir();
        }

        // file
        if (f.type == "file") {
          const fileInfo = JSON.parse(JSON.stringify(f));
          fileInfo.uri = this.viewPath;
          this.addToRecent(fileInfo);

          const fileExts = f.uri.slice(f.uri.lastIndexOf("/") + 1).split(".");
          const fileExtsLen = fileExts.length;
          const fileExt = fileExtsLen > 1 ? fileExts[fileExtsLen - 1].toLowerCase() : "";
          const fileSubExt = fileExtsLen > 2 ? fileExts[fileExtsLen - 2].toLowerCase() : "";

          // no ext
          if (fileExtsLen <= 1 ||
            (fileExtsLen === 2 &&
              fileExt == "mp3" ||
              fileExt == "flac"
            )
          ) {
            return $app.getImports().router.replace({ uri: "pages/viewer_dir_options/viewer_dir_options" });
          }

          // image
          const isImage = (
            fileExt == "bmp" ||
            fileExt == "jpg" ||
            fileExt == "png" ||
            fileExt == "bin" ||
            fileSubExt == "bmp" ||
            fileSubExt == "jpg" ||
            fileSubExt == "png" ||
            fileSubExt == "bin"
          );
          if (isImage) {
            return $app.getImports().router.replace({ uri: "pages/viewer_img/viewer_img" });
          }

          // default, text
          $app.getImports().memory.fileSize = f.length;
          return $app.getImports().router.replace({ uri: "pages/viewer_text/viewer_text" });
        }

        return this.showFailData("未知文件类型 " + f.type);
      },
    });
  },

  openDir() {
    this.clearPathData();
    this.failData = "loading";

    const modeMap = {
      "recent": "internal://app/list_recent.json",
      "favorite": "internal://app/list_favorite.json"
    };

    this.viewPath = $app.getImports().memory.paths.join("");

    if (this.mode === "dir") {
      $app.getImports().file.list({
        uri: "internal://app" + this.viewPath,
        fail: this.showFailData,
        success: this.showDirList, // TODO: 翻页不需要重复list
      });

    } else if (modeMap[this.mode]) {
      $app.getImports().file.readText({
        uri: modeMap[this.mode],
        fail: (data, code) => {
          if (code === 301) {
            this.showDirList({ fileList: [] });
          } else {
            this.showFailData(`${data} (when read ${modeMap[this.mode]})`, code);
          }
        },
        success: d => {
          this.showDirList(JSON.parse(d.text));
        },
      });
    }

  },

  showDirList(d) {
    fileCount = d.fileList.length;
    const thisPagePos = $app.getImports().memory.pathPos;
    const nextPagePos = Math.min(thisPagePos + pageLen, fileCount);
    for (let f = thisPagePos; f < nextPagePos; f++) {
      const fileUri = d.fileList[f].uri;
      const fileName = fileUri.slice(fileUri.lastIndexOf("/") + 1);
      const correctUri = ((this.mode === "dir") ? fileName : fileUri);
      this.files.push({
        name: fileName,
        uri: correctUri,
        color: d.fileList[f].type == 'dir' ? '#ffa' : '#aaf',
      });
    }
    this.hasPrev = thisPagePos > 0;
    this.hasNext = nextPagePos < fileCount;
    this.showPosStart = "" + (thisPagePos + 1) + "/" + fileCount;
    this.failData = "";
  },

  addToRecent(f) {
    const recentUri = "internal://app/list_recent.json";
    const maxLen = 10;

    $app.getImports().file.readText({
      uri: recentUri,
      fail: (data, code) => {
        if (code !== 301) return console.error("read list_recent.json failed: " + code + " " + data);

        // recent不存在
        $app.getImports().file.writeText({
          uri: recentUri,
          text: JSON.stringify({ fileList: [f] })
        });
      },
      success: d => {
        let list = [];
        try {
          list = JSON.parse(d.text).fileList;
        } catch (e) {
          console.error(e);
        }

        // 去重
        let index = -1;
        for (let i = 0; i < list.length; i++) {
          if (list[i].uri === f.uri) {
            index = i;
            break;
          }
        }

        if (index !== -1) {
          list.splice(index, 1);
        }

        // 置顶
        list.unshift(f);

        if (list.length > maxLen) {
          list.length = maxLen;
        }

        // 写回文件
        $app.getImports().file.writeText({
          uri: recentUri,
          text: JSON.stringify({ fileList: list }),
          fail: (data, code) => console.error("save list_recent.json failed: " + code + " " + data),
        });

      },
    });
  },

  clearPathData() {
    this.$refs.bindRotation.scrollTo({ index: 0 });
    this.files = [];
    this.failData = "";
  },
  clearPageData() {
    $app.getImports().memory.pathPos = 0;
    fileCount = 0;
    this.hasPrev = false;
    this.hasNext = false;
    this.showPosStart = "";
  },
  showFailData(data, code = undefined) {
    this.clearPathData();
    this.clearPageData();
    this.failData = code + " " + data + (code === 300 ? "\n(空文件夹)" : "");
  },
  onPrevPageClick() {
    $app.getImports().memory.pathPos = Math.max($app.getImports().memory.pathPos - pageLen, 0);
    this.openDir();
  },
  onNextPageClick() {
    $app.getImports().memory.pathPos = Math.min($app.getImports().memory.pathPos + pageLen, fileCount);
    this.openDir();
  },

  clickBack_Options() {
    if ($app.getImports().memory.paths.length === 0) return $app.getImports().router.replace({ uri: "pages/files_index/files_index" });

    $app.getImports().memory.paths.pop();
    this.clearPageData();
    this.openDir();
  },

  swipeBack(d) {
    if (d.direction === "right") return this.clickBack_Options();
  },
}