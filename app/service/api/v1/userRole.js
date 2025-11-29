
'use strict';
const { default: mongoose } = require('mongoose');
const Service = require('../../../core/base_service');

class UserRoleService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'UserRole';
  }

  async indexFilterDel(payload, otherPayload) {

    const res = await this.index(payload, otherPayload);


    // 根据获得的菜单去查询排除已经删除的菜单

    for (let index = 0; index < res.list.length; index++) {
      const sysMenuIds = res.list[index].sysMenuIds;

      if (sysMenuIds && sysMenuIds.length > 0) {
        // 取出所有菜单并查询结果 过滤已删除
        res.list[index].sysMenuIds = await this.ctx.service.api.v1.sysMenu.arrByArrFilterDel(sysMenuIds);
      }
    }

    return res;
  }

  async userIndex(payload) {
    const { ctx } = this;

    // 以前按 createUserId 过滤，导致种子角色（createUserId 为空）查不到
    // 角色列表对管理员应可见全部，这里仅过滤删除标记，保留其他查询条件
    const otherPayloadArr = [];
    return await this.index(payload, { otherPayloadArr });
  }

  /**
   * 根据用户角色id 返回信息
   * @param {Array} roleIdArr 角色数组
   */
  async infoByArr(roleIdArr) {
    const res = await this.models.find({
      isDelete: false,
      _id: { $in: roleIdArr },
    });

    return res;
  }


}

module.exports = UserRoleService;
