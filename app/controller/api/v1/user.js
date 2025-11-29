
'use strict';
const Controller = require('../../../core/base_controller');

class UserController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'user';
  }

  async index() {
    const { ctx } = this;

    // 组装参数
    const payload = ctx.query;

    // 处理排序
    if (payload.sort) {
      payload.sort = JSON.parse(payload.sort);
    }

    // 校验参数
    ctx.validate(this.indexTransfer, payload);

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.user.userIndex(payload, {});
    this.jsonSuccess(res);
  }

  async createUserByPwd() {
    const { ctx } = this;
    const payload = ctx.request.body;

    // 校验参数
    ctx.validate(this.createTransfer, { ...payload });

    const res = await this.ctx.service.api.v1.user.createUserByPwd(payload);
    // 设置响应内容和响应状态码
    this.jsonSuccess(res);
  }

  async changePwdByAdmin() {
    const { ctx } = this;

    const { id } = ctx.params;
    const payload = ctx.request.body;

    const res = await this.ctx.service.api.v1.userAuths.changePwdByAdmin(id, payload);
    this.jsonSuccess(res);

  }

  async importUser() {
    const { ctx } = this;
    const payload = ctx.request.body;

    const res = await this.ctx.service.api.v1.user.importUser(payload);
    this.jsonSuccess(res);
  }

  async changeUserInfoByAdmin() {
    const { ctx } = this;

    const { id } = ctx.params;
    const payload = ctx.request.body;

    const res = await this.ctx.service.api.v1.user.changeUserInfoByAdmin(id, payload);
    this.jsonSuccess(res);
  }


  async changeUserInfo() {
    const { ctx } = this;

    const userId = this.user.id;
    console.log('%c Line:108 🍺 userId', 'color:#008000', userId);
    const payload = ctx.request.body;

    const res = await this.ctx.service.api.v1.userInfo.updateByUserId(userId, payload);
    this.jsonSuccess(res);
  }

  async userInfo() {
    const { ctx } = this;

    const userId = this.user.id;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userInfo.byUserId(userId);
    this.jsonSuccess(res);
  }

  async userInfoById() {
    const { ctx } = this;
    const { id } = ctx.params;

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.user.byUserId(id);
    this.jsonSuccess(res);
  }

  // 前端对接的用户列表（/api/user/list）
  async list() {
    const { ctx } = this;
    const payload = {
      ...ctx.query,
      current: Number(ctx.query.current || 1),
      size: Number(ctx.query.size || 10),
    };

    const res = await ctx.service.api.v1.user.frontendList(payload);
    this.jsonSuccess(res);
  }


}

module.exports = UserController;
