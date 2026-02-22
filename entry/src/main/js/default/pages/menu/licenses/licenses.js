export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    licenses: ["名称：files\n源码：https://github.com/kqakqakqa/hmlitewearable_files\n许可：MIT License"],
  },
  onInit() { },
  swipeBack(data) {
    if (data.direction === "right") return $app.getImports().router.replace({
      uri: "/pages/menu/menu",
    });
  },
}