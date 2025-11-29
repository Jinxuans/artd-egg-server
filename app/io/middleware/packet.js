'use strict';
module.exports = app => {
  return async (ctx, next) => {
    const { socket } = ctx;
    const id = socket.id;
    const query = socket.handshake.query;
    const token = query.token;

    if (token) {
      try {
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        ctx.state.user = decode;

        // 更新用户的最后登录时间
        ctx.service.api.v1.userInfo.updateByUserId(ctx.state.user.id, {
          lastActiveTime: new Date(),
        });

      } catch (err) {
        console.log('%c Line:32 🌶 err', 'color:#33a5ff', err);
        socket.emit(id, {
          msg: 'tichu',
        });
        socket.disconnect();
        return;
      }
    } else {
      socket.emit(id, {
        msg: 'tichu',
      });
      socket.disconnect();
      return;
    }
    await next();
  };
};
