const path = require('path')
const { SyncHook, Tapable } = require('tapable')
const NormalModuleFactory = require('./NormalModuleFactory')
const Parser = require('./Parser')
const async = require('neo-async').default

const parser = new Parser()
const normalModuleFactry = new NormalModuleFactory()

class Compilation extends Tapable {
  constructor(compiler) {
    super()
    this.compiler = compiler
    this.context = compiler.context
    this.options = compiler.options
    // 让compilation具备文件读取的能力
    this.inputFileSystem = compiler.inputFileSystem
    this.outFileSystem = compiler.outFileSystem
    this.entries = [] // 所有入口模块信息
    this.modules = [] // 所有模块信息
    this.hooks = {
      succeedModule: new SyncHook(['module']),
    }
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
      callback(err, module)
    })
  }
  _addModuleChain(context, entry, name, callback) {
    this.createModule(
      {
        name,
        context,
        rawRequest: entry,
        resource: path.posix.join(context, entry), // 返回 entry 入口的绝对路径
        parser,
        moduleId:
          './' + path.posix.relative(context, path.posix.join(context, entry)),
      },
      (entryModule) => {
        this.entries.push(entryModule)
      },
      callback
    )
  }

  /**
   * 创建模块
   * @param {*} data 模块的参数
   * @param {*} doAddEntry 如果是入口模块，则会传入这个参数，会将当前模块ID添加到 entries 中
   * @param {*} callback 完成的回调
   */
  createModule(data, doAddEntry, callback) {
    let module = normalModuleFactry.create(data)

    const afterModule = (err, module) => {
      // 如果当前模块有其他模块依赖，去加载这些模块
      if (module.dependencies.length > 0) {
        this.processDependenice(module, (err) => {
          callback(err, module)
        })
      } else {
        callback(err, module)
      }
    }

    this.buildModule(module, afterModule)

    // 完成后, 保存当前build的数据
    doAddEntry && doAddEntry(module)
    this.modules.push(module)
  }

  buildModule(module, callback) {
    module.build(this, (err) => {
      // 执行成功回调
      this.hooks.succeedModule.call(module)
      callback(err, module)
    })
  }

  /**
   * 会递归的将有依赖的模块加载出来
   * @param {*} module 
   * @param {*} callback 
   */
  processDependenice(module, callback) {
    // 创建一个模块，将加载的模块放进去
    // 当前模块可能会依赖很多模块，我们需要等待这些模块都加载完成后，再进行下一步操作
    const dependencies = module.dependencies
    async.forEach(
      dependencies,
      (dependency, done) => {
        this.createModule(
          {
            name: dependency.name,
            context: dependency.context,
            rawRequest: dependency.rawRequest,
            moduleId: dependency.moduleId,
            resource: dependency.resource,
            parser,
          },
          null,
          done
        )
      },
      callback
    )
  }
}

module.exports = Compilation
