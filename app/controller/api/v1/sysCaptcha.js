
'use strict';
const Controller = require('../../../core/base_controller');

class SysCaptchaController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysCaptcha';
  }

  async createCaptcha() {
    const { ctx } = this;

    const payload = ctx.request.body;

    // 校验参数
    // ctx.validate(this.sysSysCaptchaCreateTransfer, { ...payload });

    const res = await ctx.service.api.v1.sysCaptcha.createCaptcha(payload);

    this.jsonSuccess(res);
  }

}

module.exports = SysCaptchaController;
