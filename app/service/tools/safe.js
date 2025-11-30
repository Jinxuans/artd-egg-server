'use strict';
const Service = require('egg').Service;
class SafeService extends Service {

  // 媒体内容检测
  async media_check({ media_url, media_type = 2, scene = 2, openid, version = 2, fileId }) {
    const { ctx, app } = this;
    const { wxtoken } = await ctx.service.api.v1.auth.wxtoken();

    let result;
    const data = {

      media_url,
      media_type,
      version,
      scene,
      openid,
    };

    try {
      result = await ctx.curl('https://api.weixin.qq.com/wxa/media_check_async?access_token=' + wxtoken, {
        // result = await ctx.curl('http://192.168.1.4:7005', {
        // 必须指定 method
        method: 'POST',
        // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
        contentType: 'json',
        data,

        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: 'json',
      });
    } catch (error) {
      // ctx.throw(200, app.config.httpCodeHash[505011])
    }
    // const data = result.data.toString();
    if (result.status === 200) {
      if (result.data.errcode === 0) {
        await ctx.service.api.v1.file.update(fileId, { wxTrace_id: result.data.trace_id });
        // eyJhbGciOiJIUzI1NiIsInR5
        // 2s6Bk96cflHner03R0l9vNYbkz1nDPG2bV0GgVXg41v
      }
    }
  }

  async callbackMediaCheck(payload = {}) {

    const { ctx, app } = this;

    if (payload.result.suggest === 'pass') {
      await ctx.model.File.updateOne({
        wxTrace_id: payload.trace_id,
      }, {
        wxSuggest: payload.result.suggest,
        wxOtherObj: payload,
      });
    } else {

      // 更新文件状态
      await ctx.model.File.updateOne({
        wxTrace_id: payload.trace_id,
      }, {
        wxSuggest: payload.result.suggest,
        wxOtherObj: payload,
        disable: false,
      });

      const file = await ctx.model.File.findOne({ wxTrace_id: payload.trace_id });
      // 如果未启用七牛插件，跳过删除/刷新
      if (app.fullQiniu) {
        await app.fullQiniu.delete(file.patch.replace(app.config.fullQiniu.client.baseUrl, ''));
        app.fullQiniu.refreshUrls([ file.patch ]);
      }

    }
  }

}
module.exports = SafeService;
