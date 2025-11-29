'use strict';
// 第三方登录
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const TokenSchema = new Schema({
    // 用户id
    userId: {
      type: Schema.ObjectId,
      index: 1,
    },
    refreshToken: {
      type: String,
      required: true,
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
  return mongoose.model('Token', TokenSchema, 'Token');
};
