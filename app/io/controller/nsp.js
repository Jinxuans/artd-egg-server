const Controller = require('egg').Controller;

class NspController extends Controller {
  async exchange() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    console.log('%c Line:13 🍉 message', 'color:#fca650', message);
    const socket = ctx.socket;
    const client = socket.id;
    console.log('%c Line:10 🌶 client', 'color:#3f7cff', '走了nsp');
    try {
      const { target, payload } = message;

      if (!target) return;
      const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
      console.log('%c Line:17 🌰 msg', 'color:#6ec1c2', msg);
      nsp.emit(target, msg);
    } catch (error) {
      console.log('%c Line:19 🍐 error', 'color:#3f7cff', error);
      app.logger.error(error);
    }
  }
}

module.exports = NspController;
