// ==UserScript==
// @name         示例JS v3
// @version      3
// @description  这是一个示例JS
// @author       -
// ==/UserScript==

console.log("正在运行 JavaScript");

var file = requireNative("system.file");

console.log("尝试写入");

file.writeText({
  uri: "internal://app/script-test/hello.txt",
  text: new Date().toLocaleString(),
  append: false,
  fail: function (data, code) {
    console.log("写入失败：" + code + " " + data);
  },
  success: function () {
    console.log("写入成功，尝试读取");

    file.readText({
      uri: "internal://app/script-test/hello.txt",
      fail: function (data, code) {
        console.log("读取失败：" + code + " " + data);
      },
      success: function (data) {
        console.log("读取成功：" + data.text);
      },

    });

  },
});