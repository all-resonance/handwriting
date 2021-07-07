const path = require('path')
const types = require('@babel/types')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default

class NormalModule {
    constructor(data) {
      this.name = data.name;
      this.context = data.context;
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
        /**
         * 遍历AST，并替换内容
         * 01 将 require 替换为 __webpack__require
         * 02 将 require 中的路径参数替换为相对于根的相对路径
         * 03 如果没有后缀，添加.js后缀(当前仅支持js打包)
         */
         traverse(this._ast, {
           CallExpression: (nodePath) => {
            const node = nodePath.node
            if(node.callee.name === 'require') {
              // 获取原始请求路径
              const modulePath = node.arguments[0].value;
              // 获取当前被加载的模块名称 test.js
              let moduleName = modulePath.split(path.posix.sep).pop()
              // 添加后缀,当前仅支持js打包
              const extName = moduleName.indexOf('.') === -1 ? '.js' : ''
              moduleName += extName
              // 获取当前被加载模块文件的绝对路径
              const depResource = path.posix.join(path.posix.dirname(this.resource), moduleName)
              // 用模块Id作为键值对中的键 ./test.js
              const depModuleId = './' + path.posix.relative(this.context, depResource)
              console.log(depModuleId)
            } 
           }
         })
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
  