
'use strict';
const Service = require('../../../core/base_service');

class SysCaptchaService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'SysCaptcha';
  }

  async createCaptcha(payload = {}) {
    const { ctx } = this;
    const svgCaptcha = require('svg-captcha');
    const yzm = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iIl',
      noise: 3,
      color: true,
      background: '#fff',
      fontSize: 60,
      width: 130,
      height: 40,
    });
    const res = {
      svg: yzm.data,
      _id: ctx.helper.guid(),
      base64: 'data:image/svg+xml;base64,' + Buffer.from(yzm.data).toString('base64'),
    };

    await ctx.service.tools.redis.set(`captcha-${res._id}`, yzm.text, 180);

    // const res = await ctx.model.Captcha.create(payload);
    return res;
  }
  async checkCaptcha(captchaId, captcha) {
    const { ctx } = this;
    // 校验验证码
    if (!captchaId || !captcha) {
      ctx.throw(200, this.app.config.httpCodeHash['400201']);
    }
    const captchaCode = await ctx.service.tools.redis.get(`captcha-${captchaId}`);


    if (!captchaCode) {
      ctx.throw(200, this.app.config.httpCodeHash['400202']);
    }

    if (captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      ctx.throw(200, this.app.config.httpCodeHash['400203']);
    }

  }

}

module.exports = SysCaptchaService;
