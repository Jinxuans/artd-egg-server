const Subscription = require('egg').Subscription;
// const TronWeb = require('tronweb');

class ShopAdvise extends Subscription {
  static get schedule() {
    return {
      interval: '1s', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
      immediate: true,
    };
  }
  //  消费每笔区块链的交易
  async subscribe() {
    await this.xiaofeiUsdt();
  }

  async xiaofeiUsdt() {
    const { ctx, app } = this;
    while (true) {
      let eventData = await app.redis.rpop('shopAdvise');
      if (eventData) {
        eventData = JSON.parse(eventData);
        try {
          await this.ajaxQingliu(eventData);
        } catch (error) {
          await app.redis.lpush('shopAdvise', JSON.stringify(eventData));
        }
      } else {
        break;
      }
    }
  }


  // 数据传入轻流
  async ajaxQingliu(eventData) {

    const res = await this.ctx.helper.qiuLiuAjax({
      url: eventData.url,
      data: eventData.payload,
    });
    // 更新三方推送id
    await this.ctx.service.api.v1[eventData.mode].update(eventData.id, {
      threeId: res.data.result.requestId,
    });

  }


}

module.exports = ShopAdvise;
