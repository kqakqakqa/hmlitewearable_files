// ==UserScript==
// @name         示例脚本 v2
// @version      2
// @description  这是一个示例脚本
// @author       -
// ==/UserScript==

console.log("正在运行 javascript");

file = requireNative("system.file");

file.writeText({
  "uri": "internal://app/script-test/hello.txt",
  "text": new Date().toLocaleString(),
  "append": false
});
