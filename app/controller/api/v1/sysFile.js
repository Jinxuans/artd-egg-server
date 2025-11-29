
'use strict';
const Controller = require('../../../core/base_controller');

class SysFileController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysFile';
  }


  async createStreamFile() {
    const { ctx, services } = this;
    const payload = ctx.request.body;

    const res = await services.createStreamFile(payload);

    this.jsonSuccess(res);
  }

  async showByHash() {
    const { ctx, services } = this;
    const { hash } = ctx.params;
    console.log('%c Line:26 🌭 hash', 'color:#e41a6a', hash);

    const res = await services.showByHash(hash);

    // 执行 302 跳转
    ctx.status = 302;
    ctx.redirect(res.fileUrl);
  }

  async getClientUploadUrl() {
    const { ctx } = this;
    const payload = ctx.request.body;

    if (!payload.type) {
      payload.type = 'file';
    }

    const res = await ctx.service.api.v1.sysFile.getClientUploadUrl(payload);

    this.jsonSuccess(res);
  }

}

module.exports = SysFileController;
