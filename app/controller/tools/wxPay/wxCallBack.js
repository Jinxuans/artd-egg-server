'use strict';
const Controller = require('../../../core/base_controller');

/*
 * @Author: rootz
 * @Date: 2021-07-28 09:44:10
 * @LastEditTime: 2021-07-29 18:14:24
 * @LastEditors: rootz
 * @Copyright: @威海东和文化传媒有限公司
 * @FilePath: \TelecomPhone\app\controller\wxPay\wxCallBack.js
 * 不努力就等着吃空气吧！
 */
class WxCallBackController extends Controller {
  async index() {
    const { ctx } = this;
    const payload = ctx.request.body;


    const res = await ctx.service.tools.wxpay.index.notify(payload);

    this.jsonSuccess(res);

  }
}

module.exports = WxCallBackController;
