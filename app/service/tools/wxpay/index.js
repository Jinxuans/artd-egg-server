'use strict';

const Service = require('egg').Service;
const path = require('path');
const WxPay = require('wechatpay-node-v3');

class WxpayService extends Service {


  /**
   * app支付订单
   * @param {String} orderId 订单id
   * @param {Object} param1 支付参数
   * @param {String} param1.amount 如 0.01
   * @param {String} param1.subject 商品名称
   * @param {String} param1.openid 设置openid[小程序支付必填]
   * @return {String} app端的字符串
   */
  async main(orderId, { amount = '0.01', subject = '测试订单', openid }) {
    const { ctx, app } = this;

    // amount = 0.01;

    const payInfo = await ctx.service.api.v1.sysPayType.showByType('weixin');

    const wxPay = new WxPay({
      appid: payInfo.appid,
      mchid: payInfo.mchid,
      publicKey: payInfo.cert,
      privateKey: payInfo.key,
    });
    const params = {
      description: subject,
      out_trade_no: orderId,
      notify_url: app.config.webSiteUrl + 'api/v1/tools/wxpay/notify_url',
      amount: {
        total: Number((amount * 100).toFixed(0)),
      },
      payer: {
        openid,
      },
      scene_info: {
        payer_client_ip: '127.0.0.1',
      },
    };

    console.log('%c Line:28 🍋 params', 'color:#42b983', params);

    try {
      const resParams = await wxPay.transactions_jsapi(params);
      console.log('%c Line:43 🥑 resParams', 'color:#33a5ff', resParams);
      return resParams;
    } catch (error) {
      ctx.throw(200, ctx.app.config.httpCodeHash[500019]);

    }

    //

  }


  async notify(queryObj) {
    console.log('%c Line:63 🍔 queryObj', 'color:#33a5ff', queryObj);
    const { ctx, app } = this;
    const headers = ctx.req.headers; // 请求头信息
    const payInfo = await ctx.service.api.v1.sysPayType.showByType('weixin');

    const wxPay = new WxPay({
      appid: payInfo.appid,
      mchid: payInfo.mchid,
      publicKey: payInfo.cert,
      privateKey: payInfo.key,
    });

    const params = {
      apiSecret: payInfo.apiSecret, // 如果在构造中传入了 key, 这里可以不传该值，否则需要传入该值
      body: queryObj, // 请求体 body
      signature: headers['wechatpay-signature'],
      serial: headers['wechatpay-serial'],
      nonce: headers['wechatpay-nonce'],
      timestamp: headers['wechatpay-timestamp'],
    };
    const signRes = await wxPay.verifySign(params);
    console.log('%c Line:82 🥟 signRes', 'color:#3f7cff', signRes);
    const result = wxPay.decipher_gcm(queryObj.resource.ciphertext, queryObj.resource.associated_data, queryObj.resource.nonce, payInfo.apiSecret);

    if (signRes && queryObj.event_type === 'TRANSACTION.SUCCESS') {
      // 更新订单状态
      console.log('%c Line:96 🌭 result', 'color:#7f2b82', result);

      if (result.trade_state === 'SUCCESS') {
        await ctx.service.api.v1.shopOrder.payOrder(result.out_trade_no, 2, 'weixin');
      }
    }
    return {
      msg: 'ok',
    };

  }
}

module.exports = WxpayService;
