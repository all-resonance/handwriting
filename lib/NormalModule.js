class NormalModule {
    constructor(data) {
      this.name = data.name;
      this.parser = data.parser;
      this.rawRequest = data.rawRequest;
      this.resource = data.resource;
      this._source = null; // 当前加载的源代码
      this._ast = null; // 当前源代码的AST
    }
  
    build(compilation, callback) {
      /**
       * 01 从文件中读取 module 内容
       * 02 如果当前文件不是js模块，则需要 Loader 进行处理，最终返回js模块
       * 03 将js代码转为ast语法树
       * 04 当前模块可能依赖了其他模块，所以需要递归处理
       */
      this.doBuild(compilation, (err) => {
        this._ast = this.parser.parse(this._source);
        callback(err);
      });
    }
  
    doBuild(compilation, callback) {
      this.getSource(compilation, (err, source) => {
        this._source = source
        callback(err);
      });
    }
  
    getSource(compilation, callback) {
      compilation.inputFileSystem.readFile(this.resource, 'utf8', callback);
    }
  }
  
  module.exports = NormalModule;
  