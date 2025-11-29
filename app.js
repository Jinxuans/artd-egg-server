'use strict';

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async didLoad() {
    this.app.logger.info('应用加载完成');
  }

  async willReady() {
    this.app.logger.info('应用准备就绪');
  }

  async didReady() {
    // 应用已经启动完毕 
    this.app.logger.info('应用启动完成');

    // // 设置 Mongoose 全局时间格式化
    // this.app.mongoose.set('toJSON', {
    //   transform: function(doc, ret) {
    //     Object.keys(ret).forEach(key => {
    //       if (ret[key] instanceof Date) {
    //         const moment = require('moment');
    //         ret[key] = moment(ret[key]).format('YYYY-MM-DD HH:mm:ss');
    //       }
    //     });
    //     return ret;
    //   }
    // });

    // // 同时设置 toObject 的转换
    // this.app.mongoose.set('toObject', {
    //   transform: function(doc, ret) {
    //     Object.keys(ret).forEach(key => {
    //       if (ret[key] instanceof Date) {
    //         const moment = require('moment');
    //         ret[key] = moment(ret[key]).format('YYYY-MM-DD HH:mm:ss');
    //       }
    //     });
    //     return ret;
    //   }
    // });
  }

  async serverDidReady() {
    this.app.logger.info('服务器启动完成');
  }

  async beforeClose() {
    this.app.logger.info('应用即将关闭');
  }
}

module.exports = AppBootHook;

