class SingleEntryPlugin {
    constructor(context, entry, name) {
      this.context = context;
      this.entry = entry;
      this.name = name;
    }
    apply(compiler) {
      // 监听compilation、make钩子
      compiler.hooks.compilation.tap('SingleEntryPlugin', () => {
  
      })
      compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
          const {context, entry, name} = this
          compilation.addEntry(context, entry, name, callback)
      })
    }
  }
  
  module.exports = SingleEntryPlugin;
  