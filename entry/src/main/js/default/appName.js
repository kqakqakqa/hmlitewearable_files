console.info("appName.js onImport");

const _this = {
  appName: undefined,
  init: onDone => {
    if (_this.appName) return onDone();

    $app.getImports().bundleName.init(() => {
      _this.getAppName($app.getImports().bundleName.bundleName, appName => {
        _this.appName = appName;
        return onDone();
      });
    });
  },
  getAppName: (bundleName, onDone) => {
    const bundleRunDirUri = "internal://app\\..\\../run/" + bundleName + "/assets";
    $app.getImports().file.list({
      uri: bundleRunDirUri,
      success: data => {
        const bundleEntryDirUri = bundleRunDirUri + "/" + data.fileList[0].uri;
        // const iconUri = bundleEntryDirUri + "/resources/base/media/icon.bin";
        const resIndexUri = bundleEntryDirUri + "/resources.index";
        $app.getImports().file.readArrayBuffer({
          uri: resIndexUri,
          success: data => {
            // u32  recordSize // 不含自身 4 字节
            // u32  resType
            // u32  id
            // u16  valueSize
            // u8[] value      // len = valueSize
            // u16  nameSize
            // u8[] name       // len = nameSize
            const arr = data.buffer;
            const len = arr.length;

            let readAppNamePos;
            let readAppNameLen;
            for (let off = 0; off + 16 < len; off++) {
              const recordSize = arr[off] | (arr[off + 1] << 8) | (arr[off + 2] << 16) | (arr[off + 3] << 24);
              const off_end = off + 4 + recordSize;
              if (recordSize < 12 || off_end > len) continue;

              const off_valueSize = off + 12;
              const off_value = off + 14;
              const valueSize = arr[off_valueSize] | (arr[off_valueSize + 1] << 8);

              const off_nameSize = off + valueSize + 14;
              const off_name = off + valueSize + 16;
              if (off_name > off_end) continue;
              const nameSize = arr[off_nameSize] | (arr[off_nameSize + 1] << 8);

              // if (nameSize <= 0) continue;
              if (off_name + nameSize !== off_end) continue;
              readAppNamePos = off_value;
              readAppNameLen = valueSize;
              break;
            }
            if (!(readAppNamePos >= 0)) return onDone();
            $app.getImports().file.readText({
              uri: resIndexUri,
              position: readAppNamePos,
              length: readAppNameLen,
              success: data => {
                return onDone(data.text.split("\0").join(""));
              }
            });
          }
        });
      }
    });
  }
};

export default _this;