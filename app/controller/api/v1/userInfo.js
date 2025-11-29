
'use strict';
const Controller = require('../../../core/base_controller');

class UserInfoController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'userInfo';
  }

  async infoByUserId() {
    const userId = this.user.id;

    const res = await this.ctx.service.api.v1.userInfo.infoByUserId(userId);
    this.jsonSuccess(res);

  }

}

module.exports = UserInfoController;
