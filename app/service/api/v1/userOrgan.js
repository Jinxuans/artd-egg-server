
'use strict';
const { default: mongoose } = require('mongoose');
const Service = require('../../../core/base_service');

class UserOrganService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'UserOrgan';
  }


  /**
   * 根据用户的部门id获取他下级部门信息
   * @param {Object} payload 其他查询参数
   * @return {Array} 返回数组信息
   */
  async findTree(payload) {
    const user = await this.ctx.service.api.v1.user.show(this.user.id);

    const userOrgan = await this.infoByLastId(user.userOrganIdArr);
    const parentIdArr = JSON.parse(JSON.stringify(userOrgan.parentIdArr));
    parentIdArr.push(this.user.userOrganId);
    const userOrganTree = await this.getChildTree(parentIdArr, payload);
    userOrgan.children = userOrganTree;

    return userOrgan;
  }

  async userIndex(payload) {
    const userAllOrganList = await this.findUserAllOrgan();
    const organInfo = await this.index(payload, {
      otherPayloadArr: [{
        _id: { $in: userAllOrganList },
      }],
    });
    return organInfo;
  }

  /**
   * 获取用户所有的部门
   * @return {Array} 所有部门的数组
   */
  async findUserAllOrgan() {
    const userOrganList = await this.getChildOrgan(this.user.userOrganId);
    userOrganList.push(this.user.userOrganId.toString());
    return userOrganList;
  }


  /**
   * 获取用户所有的部门
   * @return {Array} 所有部门的数组
   */
  async findUserAllOrganObj() {
    const userOrganList = await this.getChildOrgan(this.user.userOrganId);
    userOrganList.push(new mongoose.Types.ObjectId(this.user.userOrganId));
    return userOrganList;
  }

  /**
   * 获取部门级下级部门id
   * @param {String} userOrganId 初始部门id
   * @param {Array} organArr 放置部门的数组
   * @return {Array} 返回所有的部门数组
    */
  async getChildOrgan(userOrganId, organArr = []) {
    const organList = await this.models.find({
      parentId: userOrganId,
      isDelete: false,
    });

    for (let index = 0; index < organList.length; index++) {
      const element = organList[index];
      organArr.push(element._id);
      await this.getChildOrgan(element._id, organArr);
    }

    return organArr;
  }

  async getChildTree(parentIdArr, payload) {
    const findQuery = {
      parentIdArr,
      isDelete: false,
    };

    if (payload.ninOrganId) {
      findQuery._id = { $nin: [ new mongoose.Types.ObjectId(payload.ninOrganId) ] };
    }

    const organList = await this.models.find(findQuery).lean();

    for (let index = 0; index < organList.length; index++) {
      const elParentArr = JSON.parse(JSON.stringify(parentIdArr));
      elParentArr.push(organList[index]._id.toString());

      organList[index].children = await this.getChildTree(elParentArr, payload);
    }
    return organList;
  }


  /**
   * 根据用户角色id 返回信息
   * @param {Array} userOrganIdArr 部门
   */
  async infoByLastId(userOrganIdArr) {
    const userOrganId = userOrganIdArr[(userOrganIdArr.length - 1)];
    const res = await this.show(userOrganId);
    return res;
  }


  /**
   * 检查操作人和用户的权限关系
   * @param {String} handleUserId 操作人
   * @param {String} userId 操作的人
   * @return {Boolean} 返回是否可以操作
   */
  async checkUserOrgan(handleUserId, userId) {
    handleUserId = handleUserId.toString();
    userId = userId.toString();
    if (handleUserId === userId) {
      return true;
    }

    const handleUserInfo = await this.ctx.service.api.v1.user.show(handleUserId);
    const userInfo = await this.ctx.service.api.v1.user.show(userId);

    console.log('%c Line:134 🎂 userInfo.userOrganIdArr', 'color:#fca650', userInfo.userOrganIdArr);

    // TODO 修复一下这里的部门级别配置
    // const res = userInfo.userOrganIdArr.every(item => handleUserInfo.userOrganIdArr.includes(item));
    // return res;

    return true;
  }


  async update(_id, payload = {}) {
    const { models } = this;

    // 检查是否把自己作为了上级

    if (payload.parentIdArr.find(item => item === _id)) {
      this.ctx.throw(200, this.httpCodeHash['500004']);
    }

    const res = await models.updateOne({ _id }, payload);
    return res;
  }


  /**
 * 根据器官名称异步查找器官ID
 * @param {string} name - 器官名称
 * @return {Promise<ObjectId>} - 返回器官的ID
 * @throws {Error} - 如果找不到对应的器官，则抛出错误
 */
  async findOrganIdByOrganName(name) {
  // 异步查询数据库，寻找器官名称为organName且未被删除的记录
    const res = await this.models.findOne({ name, isDelete: false });
    // 如果找到了匹配的记录，则返回该记录的_id字段

    if (res && res.parentIdArr.length > 0) {
      return [
        ...res.parentIdArr,
        res._id.toString(),
      ];
    }

    // 如果没有找到匹配的记录，则抛出一个自定义错误，表示根据器官名称找不到器官ID
    this.ctx.throw(200, this.httpCodeHash['500005']);
  }

}

module.exports = UserOrganService;
