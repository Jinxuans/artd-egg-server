'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 用户表
  const UserInfoSchema = new Schema({

    // 用户id
    userId: {
      type: Schema.ObjectId,
      index: 1,
      required: true,
    },
    // 昵称
    nickname: { type: String, default: null },
    // 姓名
    name: { type: String, default: null },
    mobile: {
      type: String,
      default: null,
      index: 1,
    },
    avatar: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },
    // 性别 0女 1男
    sex: {
      type: Number,
      default: null,
      index: 1,
    },
    // 生日
    bornDate: {
      type: Date,
      default: null,
      index: 1,
    },

    // 现居地
    localAddress: {
      type: String,
      default: null,
      index: 1,
    },
    // 注册类型
    registerType: {
      type: String,
      default: null,
    },

    // 最后活跃时间
    lastActiveTime: { type: Date, default: null },

    // 最后登陆时间
    lastLoginTime: { type: Date, default: null },

    // 上次登录时间
    socketLastLoginTime: { type: Date, default: null },


    // 是否删除
    isDelete: {
      type: Boolean,
      index: 1,
      default: false,
    },
  }, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    getters: true,
  });
  // // 增加地理位置索引
  // UserInfoSchema.index({ location: '2dsphere' });

  UserInfoSchema.virtual('completeOfInfo').get(function() {

    const testKeyArr = [ 'dietaryStructure', 'localAddress', 'avatar', 'nickname', 'sex', 'bodyHeight', 'bornDate', 'homeLandAddress', 'education', 'homeLandDistrictCode,', 'about', 'imgArr' ];

    let completeTestKeyNum = 0;

    for (let index = 0; index < testKeyArr.length; index++) {
      const element = testKeyArr[index];
      if (this[element] !== null) {
        completeTestKeyNum = completeTestKeyNum + 1;
      }
    }
    const res = Number((completeTestKeyNum / testKeyArr.length).toFixed(2));
    return res;
  });

  return mongoose.model('UserInfo', UserInfoSchema, 'UserInfo');
};
