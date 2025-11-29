
'use strict';
const Controller = require('../../../core/base_controller');

class TokenController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'token';
  }

  async refreshUserToken() {
    const { ctx } = this;
    const token = ctx.headers.refreshtoken;

    if (!token) {
      this.ctx.throw(200, this.httpCodeHash[400005]);
    }
    const res = await ctx.service.api.v1.token.refreshUserToken(token);
    // 设置响应内容和响应状态码
    this.jsonSuccess(res);
  }

}

module.exports = TokenController;
