
const webpack = (options) => {
    const compiler = new Compiler(options.context)
    compiler.options = options
}