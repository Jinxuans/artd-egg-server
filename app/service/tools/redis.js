'use strict';
const Service = require('egg').Service;
class RedisService extends Service {
  // 设置
  async set(key, value, seconds) {
    const { redis } = this.app;
    value = JSON.stringify(value);
    if (!seconds) {
      await redis.set(key, value);
    } else {
      // 设置有效时间
      await redis.set(key, value, 'EX', seconds);
    }
  }
  // 获取
  async get(key) {
    const { redis } = this.app;
    let data = await redis.get(key);
    if (!data) return;
    data = JSON.parse(data);
    return data;
  }
  // 清空redis
  async flushall() {
    const { redis } = this.app;
    redis.flushall();
    return;
  }

  async setSystem(key, value, seconds) {
    key = 'Sys' + key; // 防止混淆的key名称！！！！！！！！！！！！！！！！！
    this.set(key, value, seconds);
  }

  async getSystem(key) {
    key = 'Sys' + key; // 防止混淆的key名称！！！！！！！！！！！！！！！！！
    return await this.get(key);
  }
}
module.exports = RedisService;
