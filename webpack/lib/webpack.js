const Compiler = require("./Compiler");
const NodeEnvironmentPlugin = require("./node/NodeEnvironmentPlugin");
const WebpackOptionsApply = require("./WebpackOptionsApply");

const webpack = function (options) {
  // 01 实例化Compiler对象
  const compiler = new Compiler(options.context);
  compiler.options = options;
  // 02 初始化NodeEnvironmentPlugin(让compiler具备文件读写的能力)
  new NodeEnvironmentPlugin(options).apply(compiler);
  // 03 挂载所有 plugins插件至 compiler 对象身上
  if (options.plugins && Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      plugin.apply(compiler);
    }
  }
	// 04 挂载所有webpack内置的插件
	compiler.options = new WebpackOptionsApply().process(options, compiler)
	// 05 返回compiler对象
	return compiler
};

module.exports = webpack;
