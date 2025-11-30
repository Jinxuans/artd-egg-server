'use strict';
const Controller = require('../../../core/base_controller');

class UserAuthsController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.serviceName = 'userAuths';
  }

  /**
   * 登录（前端风格：userName/password）
   */
  async login() {
    const { ctx } = this;
    const payload = ctx.request.body;
    const res = await ctx.service.api.v1.userAuths.login(payload);
    this.jsonSuccess(res);
  }

  /**
   * 前端路由 /api/auth/login：只返回 token 信息
   */
  async frontendLogin() {
    const { ctx } = this;
    const res = await ctx.service.api.v1.userAuths.login(ctx.request.body);
    this.jsonSuccess({ token: res.token, refreshToken: res.refreshToken });
  }

  async register() {
    const { ctx } = this;
    const res = await ctx.service.api.v1.userAuths.register(ctx.request.body);
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
    const res = await ctx.service.api.v1.userAuths.createSeedSecretByuser(userId);
    this.jsonSuccess(res);
  }

  async bindSeedSecret() {
    const { ctx } = this;
    const userId = this.user.id;
    const payload = ctx.request.body;
    const res = await ctx.service.api.v1.userAuths.bindSeedSecret(userId, payload.code);
    this.jsonSuccess(res);
  }

  async checkCode() {
    const { ctx } = this;
    const userId = this.user.id;
    const payload = ctx.request.body;
    const res = await ctx.service.api.v1.userAuths.checkCode(userId, payload.code);
    this.jsonSuccess(res);
  }

  async unbindSeedSecret() {
    const { ctx } = this;
    const userId = this.user.id;
    const payload = ctx.request.body;
    const res = await ctx.service.api.v1.userAuths.unbindSeedSecret(userId, payload.code);
    this.jsonSuccess(res);
  }

  async checkByUserName() {
    const { ctx } = this;
    const payload = ctx.query;
    const res = await ctx.service.api.v1.userAuths.checkByUserName(payload.username);
    this.jsonSuccess(res);
  }

  async getMobileByCode() {
    const { ctx } = this;
    const payload = ctx.request.body;
    const res = await ctx.service.tools.weixin.wxapp.getMobileByCode(payload.code);
    this.jsonSuccess(res);
  }
}

module.exports = UserAuthsController;
