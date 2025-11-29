
'use strict';
const Controller = require('../../../core/base_controller');

class UserAuthsController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'userAuths';
  }

  /**
   * 登录接口
   */
  async login() {
    const { ctx, services } = this;
    const payload = ctx.request.body;

    const res = await ctx.service.api.v1.userAuths.login(payload);

    this.jsonSuccess(res);
  }

  async register() {
    const { ctx, services } = this;
    const payload = ctx.request.body;

    const res = await ctx.service.api.v1.userAuths.register(payload);

    this.jsonSuccess(res);
  }

  async loginOut() {
    const { user, services } = this;
    const userId = user.id;
    const res = await services.loginOut(userId);
    this.jsonSuccess(res);
  }


  async createSeedSecretByuser() {
    const { ctx } = this;

    const userId = this.user.id;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userAuths.createSeedSecretByuser(userId);
    this.jsonSuccess(res);
  }


  async bindSeedSecret() {
    const { ctx } = this;

    const userId = this.user.id;
    const payload = ctx.request.body;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userAuths.bindSeedSecret(userId, payload.code);
    this.jsonSuccess(res);
  }

  async checkCode() {
    const { ctx } = this;

    const userId = this.user.id;
    const payload = ctx.request.body;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userAuths.checkCode(userId, payload.code);
    this.jsonSuccess(res);
  }

  async unbindSeedSecret() {
    const { ctx } = this;
    const userId = this.user.id;
    const payload = ctx.request.body;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userAuths.unbindSeedSecret(userId, payload.code);
    this.jsonSuccess(res);
  }


  async checkByUserName() {
    const { ctx } = this;
    const payload = ctx.query;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userAuths.checkByUserName(payload.username);
    this.jsonSuccess(res);
  }

  async getMobileByCode() {
    const { ctx } = this;
    const payload = ctx.request.body;
    // 调用 Service 进行业务处理
    const res = await ctx.service.tools.weixin.wxapp.getMobileByCode(payload.code);
    this.jsonSuccess(res);
  }


}

module.exports = UserAuthsController;
