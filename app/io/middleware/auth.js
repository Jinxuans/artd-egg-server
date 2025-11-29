module.exports = () => {
  return async (ctx, next) => {
    const { app, socket } = ctx;
    const query = socket.handshake.query;
    const token = query.token;
    const { id } = socket;

    if (token) {
      try {
        const decode = await app.jwt.verify(token, app.config.jwt.secret);
        ctx.state.user = decode;
        console.log('%c Line:15 🍇 ctx.state.user.id', 'color:#6ec1c2', ctx.state.user.id);

        // 更新用户的最后登录时间
        console.log('%c Line:16 🍉 ctx.state.user.id', 'color:#b03734', ctx.state.user.id);
        await ctx.service.api.v1.userInfo.updateByUserId(ctx.state.user.id, {
          socketLastLoginTime: new Date(),
        });


        await ctx.service.tools.redis.set(`socket.io-${ctx.state.user.id}`, ctx.socket.id);

        ctx.socket.emit('res', 'connected!');

      } catch (err) {
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

    // 处理客户端断开连接
    // socket.on('disconnect', () => {
    //   console.log('A client disconnected');
    // });
    console.log('%c Line:43 🍡 设备连接', 'color:#4fff4B');

    await next();

    // 这里写断连后的方法
    // 设备断连
    console.log('%c Line:47 🍋 设备断连', 'color:#b03734');
    // await ctx.service.api.v1.userInfo.disconnectProcess(ctx.state.user.id);


  };
};
