'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const AppSystemSchema = new Schema({

    // 总注册开关
    isOpenRegisters: {
      type: Boolean,
      default: true,
    },

    // 后台注册开关
    isAdminRegisters: {
      type: Boolean,
      default: false,
    },

    // 是否开启验证码验证
    isOpenVerificationCode: {
      type: Boolean,
      default: false,
    },

    // 站点名称
    webSiteName: {
      type: String,
      default: '',
    },
    // logo的hash
    logoHash: {
      type: String,
      default: null,
    },

    // 目标字段
    mubiaoStr: {
      type: String,
      default: '',
    },
    mubiaoStr2: {
      type: String,
      default: '',
    },

    // 是否删除
    isDelete: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('SysAppConfig', AppSystemSchema, 'SysAppConfig');
};
