
'use strict';
const Service = require('../../../core/base_service');

class SysTenantsService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'SysTenants';
  }

}

module.exports = SysTenantsService;
