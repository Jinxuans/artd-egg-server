'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const SysFileSchema = new Schema({
    // 文件名
    name: {
      type: String,
      default: '',
      index: true,
    },

    // 是否外联
    isExternal: {
      type: Boolean,
      default: false,
    },
    // 文件路径
    patch: {
      type: String,
      default: '',
      index: true,
      required: true,
    },
    // 用户信息
    userId: {
      type: Schema.ObjectId,
    },
    hash: {
      type: String,
      index: true,
      default: null,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    // 上传的位置 local qiniu oss cos
    uploadFileType: {
      type: String,
      default: 'local',
    },
    // 是否上传完成
    isFinish: {
      type: Boolean,
      default: false,
    },

    // 状态 0 被删除 1正常
    state: {
      type: Number,
      default: 1,
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
  return mongoose.model('SysFile', SysFileSchema, 'SysFile');
};
