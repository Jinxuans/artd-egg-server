'use strict';
// 第三方登录
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserAuthsSchema = new Schema({
    // 用户id
    userId: {
      type: Schema.ObjectId,
      index: 1,
    },
    // // 登录类型
    // identityType: {
    //   type: String,
    //   required: true,
    //   index: true,
    // },
    // 登录标识 password,weixin,wxapp,wxh5,sms
    identifier: {
      type: String,
      index: 1,
      defined: '',
    },
    // 密码凭证
    credential: {
      type: String,
      required: true,
    },
    openid: {
      type: String,
      default: null,
    },
    // wx unionid
    unionid: {
      type: String,
      default: null,
    },
    // 其他参数
    otherObj: {
      type: Object,
      default: null,
    },
    // 状态 1正常 是否正常 0禁用
    state: {
      type: Number,
      default: 1,
    },
    isDelete: {
      type: Boolean,
      index: 1,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('UserAuths', UserAuthsSchema, 'UserAuths');
};
