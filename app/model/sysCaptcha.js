// 验证码服务
'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const SysCaptchaSchema = new Schema({

  }, {
    timestamps: true,
  });
  return mongoose.model('SysCaptcha', SysCaptchaSchema, 'SysCaptcha');
};
