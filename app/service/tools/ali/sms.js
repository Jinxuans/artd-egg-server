'use strict';

const Service = require('egg').Service;
const SMSClient = require('@alicloud/sms-sdk');
class SmsService extends Service {

  /**
   * 验证手机号和验证码
   * @param {Object} param0 参数
   * @param {String} param0.mobile 手机号
   * @param  {String}param0.smsCode 验证码
   * @return {Boolean} 返回true
   */
  async checkSms({ mobile, smsCode }) {
    const { ctx, app } = this;

    const smsCodeRedis = await ctx.service.tools.redis.get(`smsCode-${mobile}`);


    if (!smsCodeRedis || smsCodeRedis !== smsCode) {
      ctx.throw(200, ctx.app.config.httpCodeHash[500001]);
    }

    return true;
  }
  /**
   * 发送短信验证码
   * @param {String} PhoneNumbers 手机号码 单个
   * @param {Object} TemplateParam  模板参数 可以为空 或 对象格式。
   * @param {String} type 验证码类型 smsAdmission|smsAdmissionWait|smsVerCode, 入场提醒短信 入场等待提醒短信  短信验证码。 默认为smsAdmission。
   */
  async sendSms(PhoneNumbers, TemplateParam = {}, type = 'smsAdmission') {

    const { app, ctx } = this;

    const smsClient = new SMSClient({
      accessKeyId: app.config.aliyunSms.accessKeyId,
      secretAccessKey: app.config.aliyunSms.accessKeySecret,
    });
    const payload = {
      PhoneNumbers,
      TemplateParam,
      type,
    };

    if (!app.config[type]) {
      ctx.throw(200, app.config.httpCodeHash['505101']);
    }

    const parme = {
      ... app.config[type],
      PhoneNumbers,
      TemplateParam: JSON.stringify(TemplateParam),
    };


    try {
      const result = await smsClient.sendSMS(parme);
      payload.sendState = result.Code === 'OK';
    } catch (error) {
      console.log('%c Line:63 🥥 error', 'color:#33a5ff', error);
      ctx.logger.error(error);
      payload.sendState = false;
    }

    payload.smsCode = parme.TemplateCode;
    payload.otherObj = parme;

    ctx.model.SysSmslog.create(payload);

    return 'ok!';
  }
}

module.exports = SmsService;
