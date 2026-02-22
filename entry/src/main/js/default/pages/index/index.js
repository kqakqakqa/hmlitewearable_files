console.info("pages/index/index onInit");

export default {
  onInit() {
    initImports(() => {
      $app.getImports().router.replace({
        uri: "pages/viewer-dir/viewer-dir",
        direct: true,
      });
    });
  },
}

function initImports(onAllDone) {
  console.info("initImports");
  const imports = $app.getImports();
  const keys = Object.keys(imports);
  let idx = 0;

  function next() {
    if (idx >= keys.length) {
      console.info("all init done");
      onAllDone(imports);
      return;
    }

    const key = keys[idx++];
    console.info("init " + key);

    if (imports[key].init) {
      let done = false;

      const timer = setTimeout(() => {
        if (!done) {
          console.warn("init " + key + " timeout, skip");
          done = true;
          setTimeout(next, 0);
        }
      }, 3000);

      imports[key].init(() => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          console.info("init " + key + " done");
          setTimeout(next, 0);
        }
      });
    } else {
      console.info("init " + key + " not needed");
      setTimeout(next, 0);
    }
  }

  setTimeout(next, 0);
}