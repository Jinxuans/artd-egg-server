'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 用户表
  const UserSchema = new Schema({
    // 账户
    username: {
      type: String,
      required: true,
    },

    // 用户组id
    userRoleIds: [{
      type: Schema.ObjectId,
    }],

    // 是否是系统用户
    isSystem: {
      type: Boolean,
      default: false,
      index: 1,
    },

    // 上次登录时间
    lastLoginTime: { type: Date, default: new Date() },

    uid: {
      type: String,
      default() {
        const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000); // 生成随机四位数
        const timestamp = new Date().getTime().toString()
          .substring(-4); // 获取当前时间戳的后四位

        const yearStr = new Date().getFullYear().toString();
        const uid = yearStr + timestamp + randomFourDigitNumber.toString(); // 将随机数和时间戳拼接成 UID
        return uid;
      },
      unique: true,
    },
    // 状态 1正常  0 禁用
    state: {
      type: Number,
      default: 1,
    },
    // 用户部门id
    userOrganIdArr: [{
      type: String,
      default: null,
    }],
    isRobot: {
      type: Boolean,
      default: false,
      index: 1,
    },
    isOpenGAuthenticator: {
      type: Boolean,
      default: false,
    },
    // 是否删除
    isDelete: {
      type: Boolean, 	// 是否删除 0未删除 1已删除
      index: 1,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('User', UserSchema, 'User');
};
