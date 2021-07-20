const {
  Tapable,
  AsyncSeriesHook,
  SyncBailHook,
  AsyncParallelHook,
  SyncHook,
} = require('tapable')
const NormalModuleFactory = require('./NormalModuleFactory')
const Compilation = require('./Compilation')
const Stats = require('./Stats')

class Compiler extends Tapable {
  constructor(context) {
    super()
    this.context = context
    this.hooks = {
      done: new AsyncSeriesHook('stats'),
      entryOption: new SyncBailHook(['context', 'entry']),
      beforeRun: new AsyncSeriesHook(['compiler']),
      run: new AsyncSeriesHook(['compiler']),
      thisCompilation: new SyncHook(['compilation', 'params']),
      compilation: new SyncHook(['compilation', 'params']),
      beforeCompile: new AsyncSeriesHook(['params']),
      compile: new SyncHook(['params']),
      make: new AsyncParallelHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),
    }
  }
  run(callback) {
    const finshCallback = function (err, stats) {
      callback(err, stats)
    }

    const onCompiled = function (err, compilation) {
      finshCallback(err, new Stats(compilation))
    }
    this.hooks.beforeRun.callAsync(this, (err) => {
      this.hooks.run.callAsync(this, (err) => {
        this.compile(onCompiled)
      })
    })
  }
  compile(callback) {
    const params = this.newCompilationParams()
    this.hooks.beforeCompile.callAsync(params, (err) => {
      this.hooks.compile.call(params)
      const compilation = this.newCompilation(params)
      this.hooks.make.callAsync(compilation, (err) => {
        // callback(err, compilation);
        // 在 make 钩子中开始处理chunk
        compilation.seal(err => {
          
        })
      })
    })
  }
  newCompilationParams() {
    const params = {
      normalModuleFactory: new NormalModuleFactory(),
    }
    return params
  }
  newCompilation() {
    const compilation = this.createCompilation()
    this.hooks.thisCompilation.call(compilation)
    this.hooks.compilation.call(compilation)
    return compilation
  }
  createCompilation() {
    return new Compilation(this)
  }
}

module.exports = Compiler
