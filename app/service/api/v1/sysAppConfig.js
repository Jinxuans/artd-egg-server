
'use strict';
const Service = require('../../../core/base_service');

class SysAppConfigService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'SysAppConfig';
  }

  async showOne() {
    const { ctx, models } = this;
    const sysAppConfig = await models.findOne({ isDelete: false });
    if (!sysAppConfig) {
      return await this.create({});
    }
    return sysAppConfig;
  }

  async index() {
    const { ctx, models } = this;
    const sysAppConfig = await models.findOne({ isDelete: false });
    if (!sysAppConfig) {
      return await this.create({});
    }
    return sysAppConfig;
  }
}

module.exports = SysAppConfigService;
