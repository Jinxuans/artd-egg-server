const Controller = require('egg').Controller;

class NspController extends Controller {
  async index() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    console.log('%c Line:8 🥔 message', 'color:#4fff4B', message);
    const socket = ctx.socket;
    const client = socket.id;
    nsp.emit('linUp', await ctx.service.api.v1.queue.index({ pageSize: 99 }));
    // nsp.emit(target, msg);
    try {
      const { target, payload } = message;
      if (!target) return;
      const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
      console.log('%c Line:15 🍯 msg', 'color:#6ec1c2', msg);


      // await this.app.io.of('/').emit('driver', queueListObjSocket);
      // await this.app.io.of('/').emit('linUp', queue);

      // nsp.emit(target, msg);
    } catch (error) {
      console.log('%c Line:19 🍐 error', 'color:#3f7cff', error);
      app.logger.error(error);
    }
  }

}

module.exports = NspController;
