
'use strict';
const Controller = require('../../../core/base_controller');

class UserRoleController extends Controller {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.serviceName = 'userRole';
  }


  async index() {
    const { ctx } = this;

    // 组装参数
    const payload = { ...ctx.query };
    // 兼容前端传参 current/size -> page/pageSize，并将 current 改为 0 基
    if (payload.current !== undefined) {
      payload.page = Math.max(0, Number(payload.current) - 1);
      delete payload.current;
    }
    if (payload.size !== undefined) {
      payload.pageSize = Number(payload.size);
      delete payload.size;
    }

    // 处理排序
    if (payload.sort) {
      payload.sort = JSON.parse(payload.sort);
    }

    // 校验参数
    ctx.validate(this.indexTransfer, payload);

    // 调用 Service 进行业务处理
    const res = await ctx.service.api.v1.userRole.userIndex(payload, {});

    // 前端期望字段对齐
    const records = (res.list || []).map(item => ({
      roleId: String(item._id),
      roleName: item.name,
      roleCode: item.code || `R_${String(item.name || '').trim().toUpperCase()}`,
      description: item.description || '',
      enabled: item.state === 1,
      createTime: item.createdAt,
      sysMenuIds: item.sysMenuIds || []
    }));
    const current = (payload.page !== undefined ? Number(payload.page) + 1 : 1) || 1;
    const size = Number(payload.pageSize) || 10;
    const data = { records, total: res.count || 0, current, size };

    this.jsonSuccess(data);
  }

  // 创建角色
  async create() {
    const { ctx } = this;
    const doc = this.normalizeRolePayload(ctx.request.body || {});
    const res = await ctx.service.api.v1.userRole.create(doc);
    this.jsonSuccess(this.formatRole(res));
  }

  // 更新角色
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const doc = this.normalizeRolePayload(ctx.request.body || {});
    const res = await ctx.service.api.v1.userRole.update(id, doc);
    this.jsonSuccess(this.formatRole(res));
  }

  // -------- helpers ----------
  normalizeRolePayload(payload = {}) {
    const doc = {};
    if (payload.roleName !== undefined) doc.name = payload.roleName;
    if (payload.roleCode !== undefined) doc.code = payload.roleCode;
    if (payload.description !== undefined) doc.description = payload.description;
    if (payload.enabled !== undefined) doc.state = payload.enabled ? 1 : 0;
    if (Array.isArray(payload.sysMenuIds)) doc.sysMenuIds = payload.sysMenuIds;
    if (payload.orderNum !== undefined) doc.orderNum = payload.orderNum;
    return doc;
  }

  formatRole(item) {
    if (!item) return item;
    return {
      roleId: String(item._id),
      roleName: item.name,
      roleCode: item.code || item.name,
      description: item.description || '',
      enabled: item.state === 1,
      createTime: item.createdAt,
      sysMenuIds: item.sysMenuIds || []
    };
  }
}

module.exports = UserRoleController;
