const { Controller } = require('egg');
class BaseController extends Controller {
  get user() {
    return this.ctx.state.user;
  }

  get httpCodeHash() {
    return this.app.config.httpCodeHash;
  }

  get services() {
    return this.ctx.service.api.v1[this.serviceName];
  }

  constructor(ctx) {
    super(ctx);
    // this.user = this.ctx.state.user;

    this.indexTransfer = {
      page: { type: 'int', required: false, allowEmpty: false, convertType: 'int', default: 0 },
      pageSize: { type: 'int', required: false, allowEmpty: false, convertType: 'int', default: 10 },
      state: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
      disable: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
    };
    this.createTransfer = {
      state: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
      disable: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
    };
    this.showTransfer = {
      id: { type: 'string', required: false, allowEmpty: false, format: /^[0-9a-fA-F]{24}$/ },
    };
    this.updateTransfer = {
      id: { type: 'string', required: false, allowEmpty: false, format: /^[0-9a-fA-F]{24}$/ },
      state: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
      disable: { type: 'int', required: false, allowEmpty: false, convertType: 'int' },
    };
    this.destroyTransfer = {

      id: { type: 'string', required: false, allowEmpty: false, format: /^[0-9a-fA-F]{24}$/ },
    };

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
    const res = await this.services.index(payload, {});

    // 统一分页返回格式：records/total/size/current，同时保留旧字段兼容
    if (res && Array.isArray(res.list) && typeof res.count !== 'undefined') {
      const current = (res.page ?? 0) + 1;
      const size = res.pageSize ?? res.list.length ?? 0;
      this.jsonSuccess({
        records: res.list,
        total: res.count,
        size,
        current,
        // 兼容旧字段
        list: res.list,
        count: res.count,
        pageSize: res.pageSize,
        page: res.page,
      });
    } else {
      this.jsonSuccess(res);
    }
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.params;

    // 校验参数
    ctx.validate(this.showTransfer, { id });

    const res = await this.services.show(id);
    this.jsonSuccess(res);
  }


  // GET //botAgencyTrad/:id/edit 修改单个信息
  async edit() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.query;

    // 校验参数
    ctx.validate(this.updateTransfer, { id, ...payload });

    const res = await this.services.edit(ctx.query, id);
    this.jsonSuccess(res);
  }


  // POST //botAgencyTrad 创建单个信息
  async create() {
    const { ctx } = this;

    const payload = ctx.request.body;

    // 校验参数
    ctx.validate(this.createTransfer, { ...payload });

    if (payload.age) {
      payload.age = Number(payload.age);
    }

    const res = await this.services.create(payload);
    // 设置响应内容和响应状态码
    this.jsonSuccess(res);
  }

  // PUT //botAgencyTrad/:id 修改单个信息

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.request.body;

    // 校验参数
    ctx.validate(this.updateTransfer, { id, ...payload });

    const res = await this.services.update(id, payload);

    this.jsonSuccess(res);
  }

  // DELETE //botAgencyTrad/:id 删除单个信息

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.query;

    // 校验参数
    ctx.validate(this.destroyTransfer, { id, ...payload });

    const res = await this.services.destroy(id);
    this.jsonSuccess(res);
  }


  jsonSuccess(data, msg = '') {
    this.ctx.body = {
      code: 200,
      data,
      msg,
    };
  }
}
module.exports = BaseController;
