'use strict';
const Service = require('egg').Service;
class PushService extends Service {
  // 个推 推送


  /**
   * 通过cid推送消息
   * @param {String} cid 设备的cid
   * @param {Object} param1 参数
   * @param {String} param1.title 标题
   * @param {String} param1.body 内容
   * @return {Object} 成功后的消息
   */
  async pushAsCid(cid, { title, body = '' }) {
    const { ctx, app } = this;
    if (!cid) {
      return;
    }

    // 配置title缺省值
    const system = await ctx.service.api.v1.system.show();
    if (!title) {
      title = system.enterpriseName;
    }

    const request_id = new Date().getTime().toString();
    const uniPush = app.config.uniPush;
    const token = await this.getToken();


    const transmission = JSON.stringify({
      title,
      body,
      click_type: 'startapp',
      ring_name: 'playerMsg.mp3', // 自定义铃音
    });

    const data = {
      request_id,
      audience: { cid: [ cid ] },
      settings: {
        ttl: 7200000,
      },
      push_message: {
        transmission,
      },
      push_channel: {
        ios: {
          type: 'notify',
          aps: {
            alert: {
              title,
              body,
            },
            'content-available': 0,
            category: 'ACTIONABLE',
            sound: 'default',
          },
          auto_badge: '0',
          payload: transmission,
        },
        android: {
          ups: {
            notification: {
              title,
              body,
              click_type: 'startapp',
            },
          },
        },
      },
    };
    console.log('%c Line:48 🍖 body', 'color:#b03734', body);
    const result = await ctx.curl(`${uniPush.baseUrl}v2/${uniPush.appId}/push/single/cid`, {
      // 必须指定 method
      method: 'POST',
      // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
      contentType: 'json',
      headers: {
        token,
      },
      data,
      // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
      dataType: 'json',
    });

    return result.data;
  }

  async getToken() {
    const { ctx, app } = this;
    const token = await ctx.service.tools.redis.getSystem('uniPush-Token');
    return token;
  }

}
module.exports = PushService;
