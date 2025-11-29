
'use strict';
const Controller = require('../../../core/base_controller');

class SysTenantsController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysTenants';
  }

}

module.exports = SysTenantsController; 
