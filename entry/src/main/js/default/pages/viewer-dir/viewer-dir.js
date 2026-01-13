console.info("pages/viewer-dir/viewer-dir onInit");

const maxFiles = 7;
let fileCount = 0;

export default {
  data: {
    uiSizes: $app.getImports().UiSizes,
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
  onDestroy() {
  },
  onGoParentClick() {
    $app.getImports().paths.paths.push("\\..");
    this.clearPageData();
    this.openDir();
  },
  onGoBackClick() {
    if ($app.getImports().paths.paths.length > 0) {
      $app.getImports().paths.paths.pop();
      this.clearPageData();
      this.openDir();
    }
  },
  onGoClick(uri) {
    $app.getImports().paths.paths.push("/" + uri.split("/").slice(-1).join(""));
    this.openPath();
  },
  openPath() {
    this.path = $app.getImports().paths.paths.join("");
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
          const fileExts = f.uri.split(".");
          const fileExtsLen = fileExts.length;
          const fileExt = fileExtsLen > 1 ? fileExts[fileExtsLen - 1].toLowerCase() : "";
          const fileSubExt = fileExtsLen > 2 ? fileExts[fileExtsLen - 2].toLowerCase() : "";

          // image
          const isImage = (
            fileExt == "bmp" ||
            fileExt == "jpg" ||
            fileExt == "png" ||
            fileExt == "bin" ||
            fileSubExt == "bmp" ||
            fileSubExt == "jpg" ||
            fileSubExt == "png" ||
            fileSubExt == "bin" // ||
            // f.length > 100000
          );
          if (isImage) {
            return $app.getImports().Router.replace({ uri: "pages/viewer-img/viewer-img" });
          }

          // text
          return $app.getImports().Router.replace({ uri: "pages/viewer-text/viewer-text" });
        }

        return this.showFailData("未知文件类型 " + f.type);
      },
      fail: this.showFailData,
    });
  },
  openDir() {
    this.clearPathData();
    this.failData = "loading";
    this.path = $app.getImports().paths.paths.join("");
    $app.getImports().file.list({
      uri: "internal://app" + this.path,
      success: d2 => {
        fileCount = d2.fileList.length;
        for (let f = $app.getImports().paths.position; f < Math.min($app.getImports().paths.position + maxFiles, fileCount); f++) {
          this.files.push({
            uri: d2.fileList[f].uri.split("/").slice(-1).join(""),
            color: d2.fileList[f].type == 'dir' ? '#ffa' : '#aaf',
          });
        }
        this.hasNext = $app.getImports().paths.position + maxFiles < fileCount;
        this.hasPrev = $app.getImports().paths.position > 0;
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
    $app.getImports().paths.position = 0;
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
    $app.getImports().paths.position = Math.max($app.getImports().paths.position - maxFiles, 0);
    this.openDir();
  },
  onNextPageClick() {
    $app.getImports().paths.position = Math.min($app.getImports().paths.position + maxFiles, fileCount);
    this.openDir();
  },
}