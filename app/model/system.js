'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const SystemSchema = new Schema({

    // 总注册开关
    openRegisters: {
      type: Boolean,
      default: true,
    },
    // App名称
    enterpriseName: {
      type: String,
      default: '',
    },
    // 邀请码长度
    invitCodeNum: {
      type: Number,
      default: 8,
    },
    // 免费用户每天发送次数
    freeUserSendLikeNum: {
      type: Number,
      default: 5,
    },

    // 免费用户每天发送超级喜欢次数
    freeUserSendSuperLikeNum: {
      type: Number,
      default: 0,
    },
    // 收费用户每天发送次数
    vipUserSendLikeNum: {
      type: Number,
      default: 1000,
    },

    // 收费用户每天发送超级喜欢次数
    vipUserSendSuperLikeNum: {
      type: Number,
      default: 30,
    },

    // 邀请积分
    invitingPoints: {
      type: Number,
      default: 10,
    },
    // 发送广场积分
    sendSquarePoints: {
      type: Number,
      default: 10,
    },

    // 违规词
    violatingWords: {
      type: Array,
      default: [],
    },

    // 消息违规词
    messageViolatingWords: {
      type: Array,
      default: [],
    },
    // 隐私政策
    privacyPolicyHtml: {
      type: String,
      default: '',
    },
    // 用户协议
    userAgreementHtml: {
      type: String,
      default: '',
    },

    // 帮助与客服
    helpHtml: {
      type: String,
      default: '',
    },
    isCloseFilter: {
      type: Boolean,
      default: true,
    },
    // 关闭微信登录
    isCloseWechatLogin: {
      type: Boolean,
      default: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model('System', SystemSchema, 'System');
};
