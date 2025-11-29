'use strict';
const { Service } = require('egg');

class BaseService extends Service {
  get models() {
    return this.ctx.model[this.modelName];
  }
  get user() {
    return this.ctx.state.user;
  }
  get httpCodeHash() {
    return this.ctx.app.config.httpCodeHash;
  }
  // constructor(ctx) {
  //   super(ctx);
  // }

  /**
   * 根据查询列表返回查询参数
   * @param {Object} payload 查询参数
   * @param {Object} options 查询参数
   * @param {Array} options.regExpArr 需要设置正则查询的参数
   * @param {Array} options.notSeacherKeyArr 不需要加入查询的参数
   * @param {Array} options.otherPayloadArr 其他查询参数 用来
   * @param {Array} options.otherParameter 其他需要连表查询的参数
   * @return {Object} count, list, pageSize, page
   */
  async index(payload = {}, { otherPayloadArr = [], otherParameter = [], regExpArr = [ 'name', 'info', 'nickname' ], notSeacherKeyArr = [] }) {
    const { ctx, models } = this;
    const resParameter = [];
    const $and = ctx.helper.searchKey(payload, regExpArr, notSeacherKeyArr);
    // 这里写搜索条件

    let find = {};
    if ($and.length > 0 || otherPayloadArr.length > 0) {

      for (let index = 0; index < otherPayloadArr.length; index++) {
        const element = otherPayloadArr[index];
        $and.push(element);
      }

      find = {
        $and,
      };
      console.log('%c Line:46 🥛 $and', 'color:#7f2b82', $and);

    }

    resParameter.push({ $match: find });

    // 增加额外参数
    for (let index = 0; index < otherParameter.length; index++) {
      const element = otherParameter[index];
      resParameter.push(element);
    }


    // 处理排序
    if (payload.sort) {
      resParameter.push({ $sort: payload.sort });
    } else {
      resParameter.push({
        $sort: {
          createdAt: -1,
        },
      });
    }

    // 处理页数
    if (payload.page !== undefined && payload.pageSize !== undefined) {
      resParameter.push({
        $skip: payload.page * payload.pageSize || 0,
      });
    }

    // 处理条数
    if (payload.pageSize !== undefined) {
      resParameter.push({
        $limit: payload.pageSize,
      });
    }

    console.log('%c Line:85 🍡 resParameter', 'color:#465975', JSON.stringify(resParameter));

    const res = await models.aggregate(resParameter);

    const count = await models.find(find).countDocuments();

    return { count, list: res, pageSize: payload.pageSize, page: payload.page || 0 };
  }
  async countDocuments(payload, { otherPayloadArr = [], regExpArr = [ 'name', 'info' ], notSeacherKeyArr = [] }) {
    const { ctx, models } = this;
    const $and = ctx.helper.searchKey(payload, regExpArr, notSeacherKeyArr);
    // 这里写搜索条件
    let find = {};
    if ($and.length > 0 || otherPayloadArr.length > 0) {

      for (let index = 0; index < otherPayloadArr.length; index++) {
        const element = otherPayloadArr[index];
        $and.push(element);
      }
      find = {
        $and,
      };
    }

    return await models.find(find).countDocuments();
  }

  /**
   * 单查一条信息
   * @param {String} _id 查询信息
   * @param {Object} options 参数
   * @return {Object} 查询出来的信息
   */
  async show(_id, options) {
    const { models, ctx } = this;
    const res = await models.findOne({ _id, isDelete: false }, options).lean();
    if (!res) {
      ctx.throw(200, ctx.app.config.httpCodeHash[400903]);
    }

    return res;
  }

  /**
   * 单查一条信息
   * @param {String} _id 查询信息
   * @param {Object} options 其他参数
   * @return {Object} 查询出来的信息
   */
  async showNo(_id, options = {}) {
    const { models } = this;
    const res = await models.findOne({ _id, isDelete: false }, options).lean();

    return res;
  }

  /**
   * 修改一条信息
   * @param {String} _id 要查询的id
   * @param {Object} payload 要更新的参数
   * @param {Object} options 其他参数
   * @return {Object} 返回更新结果
   */
  async edit(_id, payload = {}, options = {}) {
    const { models } = this;
    payload.isDelete = false;
    const res = await models.findByIdAndUpdate(_id, payload, options);
    return res;
  }


  /**
   * 创建一条信息的信息
   * @param {Object} payload 要更新的参数
   * @param {Object} options 其他参数
   * @return {Object} 返回创建后的信息
   */
  async create(payload = {}, options = {}) {
    const { models } = this;


    if (Array.isArray(payload)) {
      console.log('这是数组');
    } else {
      payload = [ payload ];
    }

    // 增加创建人信息
    if (this.user) {
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index];
        element.createUserId = this.user.id;
        element.userOrganId = this.user.userOrganId;
      }
    }
    console.log('%c Line:185 🍦 payload', 'color:#2196f3', models);


    const res = await models.create(payload, options);
    return res;


  }


  /**
   * 修改一条信息
   * @param {String} _id 要查询的id
   * @param {Object} payload 要更新的参数
   * @param {Object} options 其他参数
   * @return {Object} 返回更新结果
   */
  async update(_id, payload = {}, options = {}) {
    const { models } = this;
    const res = await models.updateOne({ _id }, payload, options);
    return res;
  }


  /**
   * 删除一条信息 软删除
   * @param {String} _id 要查询的id
   * @param {Object} options 其他参数
   * @return {Object} 返回创建后的信息
   */
  async destroy(_id, options = {}) {
    const { models, ctx } = this;
    const info = await this.show(_id);

    if (info.isSystem) {
      ctx.throw(200, ctx.app.config.httpCodeHash[400901]);
    }


    return await models.findOneAndUpdate({ _id }, { isDelete: true }, options);
  }
}

module.exports = BaseService;
