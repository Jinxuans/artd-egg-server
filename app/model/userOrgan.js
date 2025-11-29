'use strict';
// 用户机构表
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserOrganSchema = new Schema({
    // 机构名称
    name: {
      type: String,
      default: '',
      index: true,
      required: true,
    },

    // 父级id
    parentIdArr: [{
      type: String,
      index: true,
    }],

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
    // 负责人
    responsiblePerson: {
      type: String,
      default: null,
    },

    // 手机号
    responsiblePersonMobile: {
      type: String,
      default: null,
    },
    // 邮箱
    responsiblePersonEmail: {
      type: String,
      default: null,
    },
    // 排序
    orderNum: {
      type: Number,
      default: 0,
    },
    // 状态 1正常 0禁用
    state: {
      type: Number,
      default: 1,
    },
    // 删除
    isDelete: {
      type: Boolean,
      default: false,
      index: 1,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('UserOrgan', UserOrganSchema, 'UserOrgan');
};
