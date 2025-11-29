'use strict';
const Service = require('../core/base_service');
class HomeService extends Service {
  constructor() {
    // 调用父类的构造函数，并传递 modelName 参数
    super('Home');
  }

}

module.exports = HomeService;
