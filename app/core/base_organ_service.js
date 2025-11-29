'use strict';
const { Service } = require('egg');
const mongoose = require('mongoose');

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
  async index(payload = {}, { otherPayloadArr = [], otherParameter = [], regExpArr = [ 'name', 'info' ], notSeacherKeyArr }) {
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

  /**
   * 单查一条信息
   * @param {String} _id 查询信息
   * @return {Object} 查询出来的信息
   */
  async show(_id) {
    const { models, ctx } = this;
    const res = await models.findOne({ _id, isDelete: false }).lean();
    if (!res) {
      ctx.throw(200, ctx.app.config.httpCodeHash[404001]);
    }

    return res;
  }

  /**
   * 修改一条信息
   * @param {String} _id 要查询的id
   * @param {Object} payload 要更新的参数
   * @return {Object} 返回更新结果
   */
  async edit(_id, payload = {}) {
    const { models } = this;
    payload.isDelete = false;
    const res = await models.findByIdAndUpdate(_id, payload);
    return res;
  }


  /**
   * 创建一条信息的信息
   * @param {Object} payload 要更新的参数
   * @return {Object} 返回创建后的信息
   */
  async create(payload = {}) {
    const { models } = this;
    const res = await models.create(payload);
    return res;
  }


  /**
   * 修改一条信息
   * @param {String} _id 要查询的id
   * @param {Object} payload 要更新的参数
   * @return {Object} 返回更新结果
   */
  async update(_id, payload = {}) {
    const { models } = this;
    const res = await models.updateOne({ _id }, payload);
    return res;
  }


  /**
   * 删除一条信息 软删除
   * @param {String} _id 要查询的id
   * @return {Object} 返回创建后的信息
   */
  async destroy(_id) {
    const { models, ctx } = this;
    const info = await this.show(_id);

    if (!info.isSystem) {
      ctx.throw(200, ctx.app.config.httpCodeHash[400901]);
    }


    return await models.findOneAndUpdate({ _id }, { isDelete: true });
  }
}

module.exports = BaseService;
