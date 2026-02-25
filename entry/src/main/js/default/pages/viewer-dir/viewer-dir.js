console.info("pages/viewer-dir/viewer-dir onInit");

const maxFiles = 7;
let fileCount = 0;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    path: "",
    files: [],
    failData: "",
    hasPrev: false,
    hasNext: false,
  },
  onInit() {
  },
  onReady() {
    this.openDir();
  },
  onShow() {
    if (this.$refs.fileList.rotation) this.$refs.fileList.rotation({ focus: true });
  },
  onHide() {
    if (this.$refs.fileList.rotation) this.$refs.fileList.rotation({ focus: false });
  },
  onGoParentClick() {
    $app.getImports().memory.paths.push("\\..");
    this.clearPageData();
    this.openDir();
  },
  onGoBackClick() {
    if ($app.getImports().memory.paths.length === 0) return $app.getImports().router.replace({ uri: "pages/menu/menu" });

    $app.getImports().memory.paths.pop();
    this.clearPageData();
    this.openDir();
  },
  onGoClick(uri) {
    $app.getImports().memory.paths.push("/" + uri.slice(uri.lastIndexOf("/") + 1));
    this.openPath();
  },
  onGoLongpress(uri) {
    $app.getImports().memory.paths.push("/" + uri.slice(uri.lastIndexOf("/") + 1));
    $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir-options/viewer-dir-options" });
  },
  openPath() {
    this.path = $app.getImports().memory.paths.join("");
    console.log("open path " + this.path);
    $app.getImports().file.get({
      uri: "internal://app" + this.path,
      success: f => {
        console.log("path info: " + JSON.stringify(f))
        // dir
        if (f.type == "dir") {
          this.clearPageData();
          return this.openDir();
        }

        // file
        if (f.type == "file") {
          const fileExts = f.uri.slice(f.uri.lastIndexOf("/") + 1).split(".");
          const fileExtsLen = fileExts.length;
          const fileExt = fileExtsLen > 1 ? fileExts[fileExtsLen - 1].toLowerCase() : "";
          const fileSubExt = fileExtsLen > 2 ? fileExts[fileExtsLen - 2].toLowerCase() : "";

          // no ext, json
          if (fileExtsLen <= 1 ||
            fileExt == "json" ||
            fileSubExt == "json"
          ) {
            return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir-options/viewer-dir-options" });
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
            return $app.getImports().router.replace({ uri: "pages/viewer-img/viewer-img" });
          }

          // default, text
          return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text" });
        }

        return this.showFailData("未知文件类型 " + f.type);
      },
      fail: this.showFailData,
    });
  },
  openDir() {
    this.clearPathData();
    this.failData = "loading";
    this.path = $app.getImports().memory.paths.join("");
    $app.getImports().file.list({
      uri: "internal://app" + this.path,
      success: d2 => {
        fileCount = d2.fileList.length;
        for (let f = $app.getImports().memory.position; f < Math.min($app.getImports().memory.position + maxFiles, fileCount); f++) {
          this.files.push({
            uri: d2.fileList[f].uri.slice(d2.fileList[f].uri.lastIndexOf("/") + 1),
            color: d2.fileList[f].type == 'dir' ? '#ffa' : '#aaf',
          });
        }
        this.hasNext = $app.getImports().memory.position + maxFiles < fileCount;
        this.hasPrev = $app.getImports().memory.position > 0;
        this.failData = "";
      },
      fail: this.showFailData
    });
  },
  clearPathData() {
    this.$refs.fileList.scrollTo({ index: 0 });
    this.files = [];
    this.failData = "";
  },
  clearPageData() {
    $app.getImports().memory.position = 0;
    fileCount = 0;
    this.hasPrev = false;
    this.hasNext = false;
  },
  showFailData(data, code = undefined) {
    this.clearPathData();
    this.clearPageData();
    this.failData = code + " " + data + (code == 300 ? "\n(可能是空文件夹)" : "");
  },
  onPrevPageClick() {
    $app.getImports().memory.position = Math.max($app.getImports().memory.position - maxFiles, 0);
    this.openDir();
  },
  onNextPageClick() {
    $app.getImports().memory.position = Math.min($app.getImports().memory.position + maxFiles, fileCount);
    this.openDir();
  },
}