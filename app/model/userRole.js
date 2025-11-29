'use strict';
// 用户角色表
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserRoleSchema = new Schema({
    // 角色编码（唯一标识，用于权限判断）
    code: {
      type: String,
      index: true,
      unique: true,
      default: '',
    },
    // 角色名称
    name: {
      type: String,
      index: 1,
      default: '未命名角色',
    },
    description: {
      type: String,
      default: '',
    },
    // 角色权限
    sysMenuIds: [{
      type: Schema.ObjectId,
      index: 1,
    }],
    // 排序
    orderNum: {
      type: Number,
      default: 0,
      index: 1,
    },
    // 状态 1正常 是否正常
    state: {
      type: Number,
      default: 1,
      index: 1,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    // 创建人id
    createUserId: {
      type: Schema.ObjectId,
      default: null,
    },
    // 创建人部门
    userOrganId: {
      type: Schema.ObjectId,
      default: null,
    },
    // 删除
    isDelete: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('UserRole', UserRoleSchema, 'UserRole');
};
