'use strict';
// 全局处理一些参数
module.exports = (options, app) => {
  return async function(ctx, next) {
    const parameter = ctx.query || ctx.request.body;
    const payload = {};
    const os = require('os');
    const computerName = os.hostname();
    payload.serverHost = computerName;
    payload.url = ctx.url;
    payload.parameter = parameter;
    payload.serverIp = ctx.ip;
    payload.env = app.config.env;
    payload.method = ctx.method;
    ctx.service.api.v1.sysApiLog.create(payload);

    // 这里用中间接处理一个GET方法的页数问题
    if (ctx.method === 'GET') {
      if (ctx.query.page) {
        ctx.query.page = Number(ctx.query.page) - 1;
      }
      if (ctx.query.pageSize) {
        ctx.query.pageSize = Number(ctx.query.pageSize);
      }
    }
    await next();
  };
};
