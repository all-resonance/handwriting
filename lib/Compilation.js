const path = require("path");
const { SyncHook, Tapable } = require("tapable");
const NormalModuleFactory = require("./NormalModuleFactory");
const Parser = require('./Parser')

const parser = new Parser()
const normalModuleFactry = new NormalModuleFactory();

class Compilation extends Tapable {
  constructor(compiler) {
    super();
    this.compiler = compiler;
    this.context = compiler.context;
    this.options = compiler.options;
    // 让compilation具备文件读取的能力
    this.inputFileSystem = compiler.inputFileSystem;
    this.outFileSystem = compiler.outFileSystem;
    this.entries = []; // 所有入口模块信息
    this.modules = []; // 所有模块信息
    this.hooks = {
      succeedModule: new SyncHook(["module"]),
    };
  }

  /**
   * 完成模块编译操作
   * @param {*} context 当前项目的根路径
   * @param {*} entry 当前入口相对路径
   * @param {*} name chunkName -> main
   * @param {*} callback 回调
   */
  addEntry(context, entry, name, callback) {
    this._addModuleChain(context, entry, name, (err, module) => {
      callback(err, module);
    });
  }
  _addModuleChain(context, entry, name, callback) {
    let entryModule = normalModuleFactry.create({
      name,
      context,
      rawRequest: entry,
      resource: path.posix.join(context, entry), // 返回 entry 入口的绝对路径
      parser
    });

    const afterModule = (err) => {
      callback(err, entryModule);
    };

    this.buildModule(entryModule, afterModule);

    // 完成后， 保存当前build的数据
    this.entries.push(entryModule);
    this.modules.push(entryModule);
  }

  buildModule(module, callback) {
    module.build(this, (err) => {
      // 执行成功回调
      this.hooks.succeedModule.call(module);
      callback(err);
    });
  }
}

module.exports = Compilation;
