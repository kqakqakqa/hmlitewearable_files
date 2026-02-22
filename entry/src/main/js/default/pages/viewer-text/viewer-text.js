console.info("pages/viewer-text/viewer-text onInit");

const maxLines = getMaxLines($app.getImports().uiSizes.uiHeight, $app.getImports().memory.fontSize);
const maxCharsInLine = getMaxCharsInLine($app.getImports().uiSizes.uiWidth, $app.getImports().memory.fontSize);
const maxBytes = 512;

let fileLen = 0;
let pageLen = 0;
let uriPath;
let openPosition = 0;

export default {
  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    fileName: $app.getImports().memory.paths[$app.getImports().memory.paths.length - 1].split("/")[1],
    page: "",
    textLines: [],
    progress: "",
    hasPrev: false,
    hasNext: true,
    showTitle: true,
    failData: "",

    bgColor: $app.getImports().memory.bgColor,
    textColor: $app.getImports().memory.textColor,
    fontSize: $app.getImports().memory.fontSize,
    turnPageSpeed: $app.getImports().memory.turnPageSpeed,
  },
  onInit() {
    uriPath = "internal://app" + $app.getImports().memory.paths.join("");
    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });
    $app.getImports().brightness.setKeepScreenOn({
      keepScreenOn: true,
    });
    $app.getImports().file.get({
      uri: uriPath,
      fail: (data, code) => { this.showFailData(data + " (when get file len)", code); },
      success: f => {
        fileLen = f.length;
        // if (fileLen === 0) return this.showFailData("文件是空的", "");
        this.readPage("next");
      },
    });
  },
  onDestroy() {
    $app.getImports().brightness.setKeepScreenOn({
      keepScreenOn: false,
    });
    $app.getImports().headerTimeBattery.subscribe(undefined);
  },
  readPage(direction) {
    console.log("old position: " + openPosition + "/" + fileLen);
    console.log("readPage: " + direction);
    const oldPosition = openPosition;
    let readLen;
    if (direction == "prev") {
      if (!this.hasPrev) return;
      openPosition = Math.max(openPosition - maxBytes, 0);
      readLen = oldPosition - openPosition;
    } else if (direction == "next") {
      if (!this.hasNext) return;
      openPosition += pageLen;
      if (openPosition >= fileLen) openPosition = oldPosition;
      readLen = maxBytes;
    }
    console.log("read position: " + openPosition + "/" + fileLen);
    console.log("readLen: " + readLen);
    $app.getImports().file.readText({
      uri: uriPath,
      position: openPosition,
      length: readLen,
      fail: (data, code) => { this.showFailData(data + " (when read file text)", code); },
      success: d => {

        $app.getImports().file.writeText({
          uri: "internal://app/viewer-text-temp",
          text: d.text,
          fail: (data, code) => { this.showFailData(data + " (when write page temp)", code); },
          success: () => {

            $app.getImports().file.readArrayBuffer({
              uri: "internal://app/viewer-text-temp",
              fail: (data, code) => { this.showFailData(data + " (when read page temp arrayBuffer)", code); },
              success: d => {
                const range = findValidUTF8Range(d.buffer);

                $app.getImports().file.readText({
                  uri: "internal://app/viewer-text-temp",
                  position: range[0],
                  length: range[1],
                  fail: (data, code) => { this.showFailData(data + " (when read temp text)", code); },
                  success: d => {
                    this.failData = "";
                    const text = d.text;
                    if (direction == "prev") {
                      this.sliceToPage(text.split("").reverse().join(""));
                      this.page = this.page.split("").reverse().join("");
                      openPosition = oldPosition - pageLen;
                      // if (openPosition > 0 && openPosition < 3) { // bug fix
                      //   openPosition = 0;
                      //   pageLen = 0;
                      //   return this.readPage("next");
                      // }
                    } else if (direction == "next") {
                      this.sliceToPage(text);
                    }
                    // console.warn(`read: ${JSON.stringify(text)} (${readLen}), sliced: ${JSON.stringify(this.page)} (${pageLen})`);
                    console.log("new position: " + openPosition + "/" + fileLen);
                    console.log("pageLen: " + pageLen);
                    this.textLines = this.page.split("\n");
                    this.hasNext = openPosition + pageLen < fileLen - 1; // bug fix
                    this.hasPrev = openPosition > 0 + 1; // bug fix
                    this.progress = (!this.hasNext && !this.hasPrev) ? "--" :
                      !this.hasNext ? "100" :
                        !this.hasPrev ? "0" :
                          (openPosition / fileLen * 100).toFixed(2);
                  }
                });
              },
            });
          }
        });
      },
    });
  },
  sliceToPage(str) {
    this.page = "";
    let lineCount = 1;
    let charInLineCount = 0;
    pageLen = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const charWidth = estimateCharWidth(char);
      charInLineCount += charWidth;
      if (char == "\r") {
        pageLen += getByteLen(char);
        continue;
      }
      if (char == "\n") {
        pageLen += getByteLen(char);
        lineCount++;
        if (lineCount > maxLines) break;
        this.page += "\n";
        charInLineCount = 0;
        continue;
      }
      if (charInLineCount > maxCharsInLine) {
        lineCount++;
        if (lineCount > maxLines) break;
        this.page += "\n" + char;
        charInLineCount = charWidth;
        pageLen += getByteLen(char);
        continue;
      }
      this.page += char;
      pageLen += getByteLen(char);
    }
  },
  showFailData(data, code = undefined) {
    this.failData = code + " " + data;
  },
  nullFn() { },
  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer-dir/viewer-dir" });
  },
  onClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer-text/viewer-text-options/viewer-text-options" });
  },
  onPrevPageClick() {
    this.readPage("prev");
  },
  onNextPageClick() {
    this.readPage("next");
  },
  onPageSwipe(data) {
    switch (data.direction) {
      case "up":
      case "top":
        this.showTitle = false;
        break;
      case "down":
      case "bottom":
        this.showTitle = true;
        break;
      case "left":
        this.readPage("next");
        break;
      case "right":
        this.readPage("prev");
        break;
      default:
        break;
    }
  },
  onTitleClick() {
    this.showTitle = !this.showTitle;
  },
  onTitleSwipe(data) {
    switch (data.direction) {
      case "up":
      case "top":
        this.showTitle = false;
        break;
      case "down":
      case "bottom":
        this.showTitle = true;
        break;
      default:
        break;
    }
  },
}

function getMaxLines(h, fs) {
  if (fs === "30px") {
    if (h == 360) return 9;
    if (h == 396) return 10;
    if (h == 276) return 7;
    if (h == 306) return 8;
    return 7;
  } else if (fs === "38px") {
    if (h == 360) return 7;
    if (h == 396) return 7;
    if (h == 276) return 5;
    if (h == 306) return 6;
    return 5;
  }
}

function getMaxCharsInLine(w, fs) {
  if (fs === "30px") {
    if (w == 276) return 9;
    if (w == 336) return 11;
    return 9;
  } else if (fs === "38px") {
    if (w == 276) return 7;
    if (w == 336) return 8;
    return 7;
  }
}

function getByteLen(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7F || (code >= 0xD800 && code <= 0xDBFF)) len += 1; // ASCII字符、高位代理
    else if (code <= 0x7FF) len += 2;
    else len += 3; // 普通BMP字符、低位代理
  }
  return len;
}

function estimateCharWidth(char) {
  const code = char.charCodeAt(0);
  if ("\r\n\x1F".indexOf(char) >= 0) return 0;
  // 非 ASCII（汉字）
  if (code > 0x80) return 1;
  // 数字 0–9
  if (code >= 0x30 && code <= 0x39) return 22 / 32;
  // 小写特例
  if ("tijl".indexOf(char) >= 0) return 9.875 / 32;
  if (char === "m") return 31 / 32;
  if (char === "w") return 28 / 32;
  // 其他小写 a–z
  if (code >= 0x61 && code <= 0x7A) return 20.3 / 32;
  // 大写特例
  if (char === "I") return 10 / 32;
  if (char === "W") return 35 / 32;
  if (char === "M") return 31 / 32;
  // 其他大写 A–Z
  if (code >= 0x41 && code <= 0x5A) return 23.5 / 32;
  // ASCII 特例
  if (",.'`!:; ".indexOf(char) >= 0) return 9 / 32;
  // 其他 ASCII
  if (code >= 0x00 && code <= 0x80) return 21 / 32;
  return 21 / 32;
}

function findValidUTF8Range(bytes) {
  let first = null;
  let last = null;
  let i = 0;

  while (i < bytes.length) {
    const b1 = bytes[i];
    let len = 0;

    if (b1 <= 0x7F) len = 1; // 1 字节
    else if (b1 >= 0xC2 && b1 <= 0xDF) len = 2; // 2 字节
    else if (b1 >= 0xE0 && b1 <= 0xEF) len = 3; // 3 字节
    else if (b1 >= 0xF0 && b1 <= 0xF4) len = 4; // 4 字节
    else { i++; continue; } // 非法起始字节

    // 检查后续字节是否完整
    let valid = true;
    for (let j = 1; j < len; j++) {
      if (i + j >= bytes.length || (bytes[i + j] & 0xC0) !== 0x80) {
        valid = false;
        break;
      }
    }
    if (!valid) { i++; continue; }

    if (first === null) first = i; // 记录第一个合法字符偏移
    last = i + len; // 更新最后一个完整字符的结束偏移
    i += len;
  }

  if (first === null || last === null) console.warn("cannot find valid UTF-8 range, first=" + first + ", last=" + last);

  return [
    first || 0,
    (last - first) || bytes.length
  ];
}