'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 系统字典表
  const SysDictionariesSchema = new Schema({
    // 字段名称
    str: {
      type: String,
      default: '',
    },
    // 字段代码
    code: {
      type: String,
      required: true,
    },
    // 其他字符
    other: {
      type: String,
      default: null,
    },
    // 字段类型
    type: {
      type: String,
      required: true,
      index: 1,
    },
    // 排序
    orderNum: {
      type: Number,
      default: 0,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },

  }, {
    timestamps: true,
  });
  return mongoose.model('SysDictionaries', SysDictionariesSchema, 'SysDictionaries');
};
