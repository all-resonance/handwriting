const EntryOptionsPlugin = require('./EntryOptionsPlugin')

class WebpackOptionsApply {
    process(options, compiler) {
        new EntryOptionsPlugin().apply(compiler)
        compiler.hooks.entryOption.call(options.context, options.entry)
    }

}

module.exports = WebpackOptionsApply