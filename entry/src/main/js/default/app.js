const imports = {};

export default {

  onCreate() {
    console.info("app.js onCreate");
  },

  onDestroy() {
    console.info("app.js onDestroy");
  },

  setImports(o) {
    for (const k in o) {
      imports[k] = o[k];
    }
  },

  getImports() {
    return imports;
  },

};