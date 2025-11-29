
'use strict';
const Service = require('../../../core/base_service');

class SystemService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'System';
  }

  async showOne() {
    const { ctx } = this;
    let system = await ctx.model.System.findOne();

    if (!system) {
      system = await this.create({});
    }

    return system;
  }

  /**
   * 处理聊天中的屏蔽词
   * @param {String} content 聊天消息
   * @return {String} 处理后的聊天消息词
   */
  async meassageKeywords(content) {
    const system = await this.show();
    if (system.messageViolatingWords && system.messageViolatingWords.length > 0) {
      for (let index = 0; index < system.messageViolatingWords.length; index++) {
        const element = system.messageViolatingWords[index];
        content.replace(new RegExp(element, 'g'), '**');
      }
    }
    return content;
  }
}

module.exports = SystemService;
