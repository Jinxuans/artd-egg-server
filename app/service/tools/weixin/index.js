'use strict';

const Service = require('egg').Service;

class IndexService extends Service {
  async wxtoken(payload = {}) {

    const { ctx, app } = this;

    let wxtoken = await ctx.service.tools.redis.get('wxtoken');
    if (!wxtoken) {
      const parmer = {
        grant_type: 'client_credential',
        appid: app.config.mp.appId,
        secret: app.config.mp.appSecret,
      };
      const result = await ctx.curl('https://api.weixin.qq.com/cgi-bin/token?' + ctx.helper.urlEncode(parmer), {
        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: 'json',
      });

      if (result.status === 200) {
        const data = result.res.data;
        wxtoken = data.access_token;
        if (!data.errcode) {
          await ctx.service.tools.redis.set('wxtoken', data.access_token, data.expires_in);
        } else {
          ctx.throw(200, app.config.httpCodeHash['505009']);
        }
      } else {
        ctx.throw(200, app.config.httpCodeHash['505009']);
      }
    }
    return {
      wxtoken,
    };
  }
}

module.exports = IndexService;
