const Controller = require('../../../core/base_controller');

class SysController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'sysDictionaries';
  }

  async index() {
    const { ctx } = this;

    // 组装参数
    const payload = ctx.query;

    // 处理排序
    if (payload.sort) {
      payload.sort = JSON.parse(payload.sort);
    } else {
      payload.sort = {
        order: 1,
        type: 1,
        createdAt: 1,
      };
    }

    // 校验参数
    ctx.validate(this.indexTransfer, payload);

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.sysDictionaries.index(payload, {});
    this.jsonSuccess(res);
  }
}

module.exports = SysController;
