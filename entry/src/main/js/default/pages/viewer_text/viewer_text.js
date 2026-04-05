console.info("pages/viewer_text/viewer_text onInit");

const file = $app.getImports().file;

const maxLines = getMaxLines($app.getImports().uiSizes.uiHeight, $app.getImports().memory.fontSize);
const maxCharsInLine = getMaxCharsInLine($app.getImports().uiSizes.uiWidth, $app.getImports().memory.fontSize);
const maxBytes = 450;

const uriPath = "internal://app" + $app.getImports().memory.paths.join("");
const viewTextHistory = $app.getImports().memory.viewTextHistory;

const autoPagerSpeed = $app.getImports().memory.autoPagerSpeed;

const fileSize = $app.getImports().memory.fileSize;
const fileEndPos = Math.max(fileSize - 1, 0);
let pageLen = 0;
let openPos = 0;

let autoPager;

export default {

  data: {
    uiSizes: $app.getImports().uiSizes,
    timeBatteryStr: "",
    fileName: $app.getImports().memory.paths[$app.getImports().memory.paths.length - 1].split("/").pop(),
    page: "",
    progress: "--",
    hasPrev: false,
    hasNext: true,
    showTitle: true,

    hints: [],
    hint: "",
    failData: "",

    autoPagerDirection: 0,

    bgColor: $app.getImports().memory.bgColor,
    textColor: $app.getImports().memory.textColor,
    fontSize: $app.getImports().memory.fontSize,
  },

  onInit() {
    for (let i = 0; i < viewTextHistory.length; i++) {
      if (viewTextHistory[i].uri === uriPath) {
        this.showHint("已定位到上次的位置");
        setTimeout(() => { this.hideHint("已定位到上次的位置"); }, 3000);
        openPos = viewTextHistory[i].position;
        break;
      }
    }

    $app.getImports().headerTimeBattery.subscribe(() => {
      this.timeBatteryStr = $app.getImports().headerTimeBattery.time + "  " + $app.getImports().headerTimeBattery.battery;
    });

    $app.getImports().brightness.setKeepScreenOn({
      keepScreenOn: true,
    });

    this.readPage(true);
  },

  onHide() {
    this.stopAutoPager();
  },

  onDestroy() {
    $app.getImports().brightness.setKeepScreenOn({
      keepScreenOn: false,
    });
    $app.getImports().headerTimeBattery.subscribe(undefined);
  },

  readPage(isForward = true) {
    console.log("old pos: " + openPos + "/" + fileEndPos);
    console.log("isForward: " + isForward);

    const oldPos = openPos;
    let readLen;

    if (isForward) {
      if (!this.hasNext) return;

      if (openPos + pageLen < fileEndPos) openPos = Math.min(Math.max(openPos + pageLen, 0), fileEndPos);
      readLen = Math.min(Math.max(fileEndPos - openPos + 1, 0), maxBytes);

    } else {
      if (!this.hasPrev) return;

      openPos = Math.min(Math.max(openPos - maxBytes, 0), fileEndPos);
      readLen = Math.min(Math.max(oldPos - 1 - openPos + 1, 0), maxBytes);

    }

    console.log("read pos: " + openPos + "/" + fileEndPos);
    console.log("readLen: " + readLen);

    this.readValidText(
      openPos,
      readLen,
      d => {
        const text = d.text;

        if (isForward) {
          this.sliceToPage(text, true);
        } else {
          this.sliceToPage(text, false);
          openPos = oldPos - pageLen;
        }

        console.log("new pos: " + openPos + "/" + fileEndPos);
        console.log("pageLen: " + pageLen);

        this.failData = "";

        this.hasNext = openPos + pageLen < fileEndPos;
        this.hasPrev = openPos > 0;

        this.progress = (!this.hasNext && !this.hasPrev) ? "--" :
          !this.hasNext ? "100" :
            !this.hasPrev ? "0" :
              (openPos / fileEndPos * 100).toFixed(2);

        saveViewTextHistory();

      }
    );

  },

  readValidText(pos, len, success) {
    this.safeReadArrayBuffer(
      pos,
      4,
      d => {
        const offHead = findValidUTF8Pos(d.buffer, true);
        const posHead = pos + offHead;

        const offFindTail = Math.max(pos + len - 4, pos);

        this.safeReadArrayBuffer(
          offFindTail,
          4,
          d => {
            const offTail = findValidUTF8Pos(d.buffer, false);

            setTimeout(() => {
              file.readText({
                uri: uriPath,
                position: posHead,
                length: offFindTail + offTail - posHead + 1,
                fail: (data, code) => { this.showFailData(data + " (when read text)", code); },
                success: success,

              });
            }, 0);
          }
        );
      }
    );
  },

  safeReadArrayBuffer(pos, len, success) {
    setTimeout(() => file.readText({
      uri: uriPath,
      position: pos,
      length: len,
      fail: (data, code) => this.showFailData(data + ` (when safeRead readText pos=${pos} len=${len})`, code),
      success: d => {

        setTimeout(() => file.writeText({
          uri: "internal://app/viewer_text-temp",
          text: d.text,
          fail: (data, code) => this.showFailData(data + ` (when safeRead writeText pos=${pos} len=${len})`, code),
          success: () => {

            setTimeout(() => file.readArrayBuffer({
              uri: "internal://app/viewer_text-temp",
              fail: (data, code) => this.showFailData(data + ` (when safeRead readBuf pos=${pos} len=${len})`, code),
              success: success

            }), 0);
          }
        }), 0);
      }
    }), 0);
  },

  sliceToPage(str, isForward = true) {
    this.page = "";
    let lineCount = 1;
    let charInLineCount = 0;
    pageLen = 0;

    const len = str.length;
    const start = isForward ? 0 : len - 1;
    const step = isForward ? 1 : -1;

    let tempPage = [];

    for (let s = 0; s < len; s++) {
      const i = start + s * step;

      const char = str[i];
      const charWidth = estimateCharWidth(char);

      // 换行符
      if (char === "\n") {
        if (lineCount >= maxLines) break;
        lineCount++;
        charInLineCount = 0;
        tempPage.push(char);
        pageLen += getByteLen(char);
        continue;
      }
      if (char === "\r") {
        pageLen += getByteLen(char);
        continue;
      }

      // 行宽
      if (charInLineCount + charWidth > maxCharsInLine) {
        if (lineCount >= maxLines) break;

        lineCount++;
        charInLineCount = charWidth;
        tempPage.push("\n", char);
      } else {
        charInLineCount += charWidth;
        tempPage.push(char);
      }
      pageLen += getByteLen(char);
    }

    // 反向截取需要翻转还原
    if (!isForward) {
      tempPage.reverse();
    }

    this.page = tempPage.join("");
  },

  showHint(content) {
    this.hints.push(content);
    this.hint = content;
  },

  hideHint(content) {
    const index = this.hints.indexOf(content);
    if (index !== -1) {
      this.hints.splice(index, 1);
    }
    this.hint = (this.hints.length === 0) ? "" : this.hints[this.hints.length - 1].text;
  },

  showFailData(data, code = undefined) {
    this.failData = code + " " + data;
  },

  nullFn: void 0,

  onGoBackClick() {
    $app.getImports().memory.paths.pop();
    return $app.getImports().router.replace({ uri: "pages/viewer_dir/viewer_dir" });
  },

  onClick() {
    return $app.getImports().router.replace({ uri: "pages/viewer_text_options/viewer_text_options" });
  },

  onPrevPageClick() {
    this.readPage(false);
    this.stopAutoPager();
  },

  onNextPageClick() {
    this.readPage(true);
    this.stopAutoPager();
  },

  onNextPageLongPress() {
    this.startAutoPager(true);
  },

  onPrevPageLongPress() {
    this.startAutoPager(false);
  },

  startAutoPager(isForward) {
    if (autoPager) return;
    autoPager = setInterval(() => {
      this.readPage(isForward);
    }, autoPagerSpeed * 1000);

    this.showHint("已开启自动翻页");
    setTimeout(() => { this.hideHint("已开启自动翻页"); }, 1000);

    this.autoPagerDirection = isForward ? 1 : -1;

    $app.getImports().vibrator.vibrate({ mode: 'short' });
  },

  stopAutoPager() {
    if (!autoPager) return;
    clearInterval(autoPager);
    autoPager = null;

    this.showHint("已停止自动翻页");
    setTimeout(() => { this.hideHint("已停止自动翻页"); }, 1000);

    this.autoPagerDirection = 0;

    $app.getImports().vibrator.vibrate({ mode: 'short' });
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
        this.readPage(true);
        break;
      case "right":
        this.readPage(false);
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

function findValidUTF8Pos(bytes, isForward = true) {
  const len = bytes.length;

  if (isForward) {

    for (let i = 0; i < len; i++) {
      // 00xxxxxx >> 6 = 0 (早期 ASCII 控制符)
      // 01xxxxxx >> 6 = 1 (ASCII 或 合法)
      // 10xxxxxx >> 6 = 2 (中途字节)
      // 11xxxxxx >> 6 = 3 (多字节开头)
      if ((bytes[i] >> 6) !== 2) return i;
    }
    return 0;

  } else {

    for (let i = len - 1; i >= 0; i--) {
      const b = bytes[i];

      if ((b >> 6) === 2) continue;

      // 11110xxx >= 0xf0 (4字节开头)
      // 1110xxxx >= 0xe0 (3字节开头)
      // 110xxxxx >= 0xc0 (2字节开头)
      let charLen = 1;
      if (b >= 0xf0) charLen = 4;
      else if (b >= 0xe0) charLen = 3;
      else if (b >= 0xc0) charLen = 2;

      const validPos = i - 1 + charLen;
      return (validPos > (len - 1)) ? i - 1 : validPos;
    }
    return len - 1;

  }
}

function saveViewTextHistory() {
  let index = -1;

  for (let i = 0; i < viewTextHistory.length; i++) {
    if (viewTextHistory[i].uri === uriPath) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    viewTextHistory.splice(index, 1);
  }

  if (openPos !== 0) {
    viewTextHistory.unshift({
      uri: uriPath,
      position: openPos
    });
  }

  if (viewTextHistory.length > 10) viewTextHistory.length = 10;

  $app.getImports().memory.viewTextHistory = viewTextHistory;
  $app.getImports().memory.save("viewTextHistory");
}