console.info("pages/viewer-img/viewer-img onInit");

let clickTimeout = null;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    // uiRefresh: true,
    showTitle: true,
    fileName: "",
    imgCopyName: "",
    imgScale: 1,
  },
  onInit() {
    this.openPath();
  },
  openPath() {
    this.fileName = $app.getImports().memory.paths[$app.getImports().memory.paths.length - 1].split("/")[1];
    const fileExts = this.fileName.split(".");
    const fileExtsLen = fileExts.length;
    const fileExt = fileExtsLen > 1 ? fileExts[fileExtsLen - 1].toLowerCase() : "";
    const fileSubExt = fileExtsLen > 2 ? fileExts[fileExtsLen - 2].toLowerCase() : "";
    const isExtImg = (
      fileExt === "bmp" ||
      fileExt === "jpg" ||
      fileExt === "png" ||
      fileExt === "bin"
    );
    const isSubExtImg = (
      fileSubExt === "bmp" ||
      fileSubExt === "jpg" ||
      fileSubExt === "png" ||
      fileSubExt === "bin"
    );

    // image
    this.imgCopyName = Date.now() + "." + ((isExtImg && fileExt) || (isSubExtImg && fileSubExt) || "bin");
    const imgDir = "internal://app\\..\\../run/" + $app.getImports().bundleName.bundleName + "/assets/js/default/viewer-img";
    $app.getImports().file.rmdir({
      uri: imgDir,
      recursive: true,
      complete: () => {
        $app.getImports().file.mkdir({
          uri: imgDir,
          complete: () => {
            $app.getImports().file.copy({
              srcUri: "internal://app" + $app.getImports().memory.paths.join(""),
              dstUri: imgDir + "/" + this.imgCopyName,
              // complete: () => {
              //   this.uiRefresh = false;
              //   setTimeout(() => {
              //     this.uiRefresh = true;
              //   }, 50);
              // },
            });
          }
        });
      },
    });
  },
  nullFn() { },
  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir" });
  },
  onImgClick() {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      this.onImgDoubleClick();
    } else {
      clickTimeout = setTimeout(() => {
        clickTimeout = null;
        this.onImgSingleClick();
      }, 250);
    }
  },
  onImgSingleClick() {
    this.showTitle = !this.showTitle;
  },
  onImgDoubleClick() {
    this.imgScale = (this.imgScale >= 4) ? 1 : (this.imgScale * 2);
    this.uiRefresh = false;
    setTimeout(() => {
      this.uiRefresh = true;
    }, 50);
    console.log("imgScale: " + this.imgScale);
  },
}