'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 通知表
  const NoticeSchema = new Schema({
    // 通知
    notice: {
      type: String,
      required: true,
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
  return mongoose.model('Notice', NoticeSchema, 'Notice');
};
