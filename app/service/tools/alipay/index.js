'use strict';

const Service = require('egg').Service;
const path = require('path');
const AlipaySdk = require('alipay-sdk');

class AlipayService extends Service {


  /**
   * app支付订单
   * @param {String} orderId 订单id
   * @param {Object} param1 支付参数
   * @param {String} param1.amount 如 0.01
   * @param {String} param1.subject 商品名称
   * @return {String} app端的字符串
   */
  async main(orderId, { amount = '0.01', subject = '测试订单' }) {
    console.log('%c Line:19 🍇 amount', 'color:#7f2b82', amount);

    const { ctx, app } = this;

    const alipaySdk = new AlipaySdk({
      appId: app.config.alipay.appId,
      // keyType: 'PKCS1', // 默认值。请与生成的密钥格式保持一致，参考平台配置一节
      privateKey: app.config.alipay.privateKey,
      // 传入支付宝根证书、支付宝公钥证书和应用公钥证书。
      alipayRootCertPath: path.join(app.config.baseDir, app.config.alipay.alipayRootCertPath),
      alipayPublicCertPath: path.join(app.config.baseDir, app.config.alipay.alipayPublicCertPath),
      appCertPath: path.join(app.config.baseDir, app.config.alipay.appCertPath),
    });
    console.log('%c Line:42 🌶 app.config.alipay.returnUrl', 'color:#f5ce50', app.config.alipay.returnUrl + 'tools/alipay/notify_url');


    try {
      const result = await alipaySdk.sdkExec('alipay.trade.app.pay', {
        bizContent: {
          out_trade_no: orderId,
          product_code: 'FAST_INSTANT_TRADE_PAY',
          total_amount: amount.toString(),
          subject,
        },
        notify_url: app.config.alipay.returnUrl + 'tools/alipay/notify_url',
      });

      return result;
    } catch (error) {
      console.log('%c Line:47 🥪 error', 'color:#b03734', error);
      ctx.throw(200, ctx.app.config.httpCodeHash[500019]);

    }

    //

  }


  async notify(queryObj) {
    const { ctx, app } = this;

    const alipaySdk = new AlipaySdk({
      appId: app.config.alipay.appId,
      // keyType: 'PKCS1', // 默认值。请与生成的密钥格式保持一致，参考平台配置一节
      privateKey: app.config.alipay.privateKey,
      // 传入支付宝根证书、支付宝公钥证书和应用公钥证书。
      alipayRootCertPath: path.join(app.config.baseDir, app.config.alipay.alipayRootCertPath),
      alipayPublicCertPath: path.join(app.config.baseDir, app.config.alipay.alipayPublicCertPath),
      appCertPath: path.join(app.config.baseDir, app.config.alipay.appCertPath),
    });

    const signRes = alipaySdk.checkNotifySign(queryObj);

    if (signRes && queryObj.trade_status === 'TRADE_SUCCESS') {
      // 更新订单状态

      await ctx.service.api.v1.order.update(queryObj.out_trade_no, {
        realTotalFee: queryObj.total_amount,
        state: 2,
      });
      // TODO 更新会员的情况
      await ctx.service.api.v1.order.refrushUserVip(queryObj.out_trade_no);
    }

  }
}

module.exports = AlipayService;
