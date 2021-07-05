const SingleEntryPlugin = require('./SingleEntryPlugin')

function itemToPlugin(context, entry, name) {
    return new SingleEntryPlugin(context, entry, name)
}

class EntryOptionsPlugin {
  apply(compiler) {
    // 监听 entryOptions 事件
    compiler.hooks.entryOption.tap("EntryOptionsPlugin", (context, entry) => {
      itemToPlugin(context, entry, 'main').apply(compiler);
    });
  }
}

module.exports = EntryOptionsPlugin;
