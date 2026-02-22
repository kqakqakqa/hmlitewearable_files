import router from "@system.router";

console.info("router.js onImport");

const _this = {
  /**
   *
   * @param {Object} d
   * @param {string} d.uri
   * @param {Object} [d.params]
   * @param {boolean} [d.direct]
   *
   */
  replace(d) {
    const params = d.params || {};
    const replace = {
      uri: d.uri,
      params: params,
    };
    router.replace(
      d.direct ?
        replace :
        { uri: "/pages/router/router", params: replace }
    );
  },
}

export default _this;