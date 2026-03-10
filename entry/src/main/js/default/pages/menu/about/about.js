console.info("pages/menu/about/about onInit");

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    versionName: $app.getImports().app.getInfo().versionName,
  },
  onInit() { },
  swipeBack(data) {
    if (data.direction === "right") return $app.getImports().router.replace({
      uri: "/pages/menu/menu",
    });
  },
}