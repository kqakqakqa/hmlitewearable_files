console.info("bundleName.js onImport");

const _this = {
  bundleName: undefined,
  init: onDone => {
    if (_this.bundleName) return onDone();

    $app.getImports().storage.get({
      key: "bundleName",
      default: "",
      success: value => {
        if (value) {
          _this.bundleName = value;
          return onDone();
        }

        const marker = "" + Date.now();
        $app.getImports().storage.set({
          key: "bundleNameMarker",
          value: marker,
          success: () => {
            $app.getImports().file.list({
              uri: "internal://app\\..",
              success: listData => {
                const list = listData.fileList;
                let i = 0;
                function checkBundleName() {
                  console.info("checkBundleName");
                  if (i >= list.length) return onDone();
                  const bundleName = list[i++].uri.split("/").slice(-1)[0];
                  console.info("bundleName " + i + ": " + bundleName);
                  $app.getImports().file.readText({
                    uri: "internal://app\\../" + bundleName + "/kvstore/bundleNameMarker",
                    fail: (data, code) => {
                      setTimeout(checkBundleName, 0);
                    },
                    success: data => {
                      if (data.text === marker) {
                        console.info("match, bundleName: " + bundleName);
                        $app.getImports().storage.set({ key: "bundleName", value: bundleName });
                        $app.getImports().storage.delete({ key: "bundleNameMarker" });
                        _this.bundleName = bundleName
                        return onDone();
                      } else setTimeout(checkBundleName, 0);
                    }
                  });
                }
                checkBundleName();
              }
            });
          }
        });
      }
    });
  },
};

export default _this;