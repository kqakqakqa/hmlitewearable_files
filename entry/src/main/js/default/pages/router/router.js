console.info("pages/router/router onInit");

export default {
  data: {
    uri: "",
    params: {},
  },
  onInit() {
    $app.getImports().router.replace({
      uri: this.uri,
      params: this.params,
      direct: true,
    });
  },
}