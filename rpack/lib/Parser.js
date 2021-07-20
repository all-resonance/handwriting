const babylon = require("babylon");
const { Tapable } = require("tapable");

class Parser extends Tapable {
  parse(source) {
    return babylon.parse(source, {
      sourceType: "module",
      plugins: ['dynamicImport'], // 支持动态导入的插件
    });
  }
}

module.exports = Parser;
