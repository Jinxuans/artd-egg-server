'use strict';

const Service = require('egg').Service;

class AppService extends Service {


  async checkToken(code) {
    const { ctx, app } = this;
    let wxRas;
    try {
      // const result = await ctx.curl(`https://api.weixin.qq.com/sns/oauth2/access_token?`, {
      const result = await ctx.curl(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${app.config.mpApp.appId}&secret=${app.config.mpApp.appSecret}&code=${payload.code}&grant_type=authorization_code`, {
        // 必须指定 method
        method: 'GET',
        // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
        data: {
          appid: app.config.mp.appid,
          secret: app.config.mp.appSecret,
          code,
          grant_type: 'authorization_code',
        },
        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: 'json',
      });

      if (result.data.access_token) {
        wxRas = result.data;
      } else {
        ctx.throw(200, ctx.app.config.httpCodeHash[401001]);
      }
    } catch (error) {
      ctx.throw(200, ctx.app.config.httpCodeHash[401001]);
    }

    return wxRas;
  }
}

module.exports = AppService;
