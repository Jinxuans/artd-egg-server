'use strict';

const Service = require('egg').Service;

class WxappService extends Service {
  async wxappLoginByCode(code) {

    const { ctx, app } = this;
    const wxOpenData = await ctx.service.mp.login(code);

    if (!wxOpenData.session_key) {
      ctx.throw(200, app.config.httpCodeHash['704001']);
    }
    return wxOpenData;
  }

  async getMobileByCode(code) {
    console.log('%c Line:18 🍪 code', 'color:#e41a6a', code);
    const { ctx, service } = this;
    const { access_token } = await service.mp.getToken();

    const result = await ctx.curl(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`, {
      // 必须指定 method
      method: 'POST',
      // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
      contentType: 'json',
      data: {
        code,
      },
      // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
      dataType: 'json',
    });


    // data =  {
    //   errcode: 0,
    //   errmsg: 'ok',
    //   phone_info: {
    //     phoneNumber: '18335664257',
    //     purePhoneNumber: '18335664257',
    //     countryCode: '86',
    //     watermark: [Object]
    //   }
    // }
    return result.data;


  }
}

module.exports = WxappService;
