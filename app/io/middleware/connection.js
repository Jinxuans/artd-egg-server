'use strict';
// {app_root}/app/io/middleware/connection.js
module.exports = app => {
  return async (ctx, next) => {

    const socket = ctx.socket;

    const user = ctx.state.user;
    if (user) {
      await ctx.service.tools.redis.set(`socket.io-${user.id}`, ctx.socket.id);
    }
    ctx.socket.emit('res', 'connected!');

    // 获取所有的群组

    const { list: userGroupList } = await ctx.service.api.v1.imGroup.getGroupList({});

    for (let index = 0; index < userGroupList.length; index++) {
      const element = userGroupList[index];
      socket.join(element._id.toString());
      // 上线事件
      ctx.socket.emit('connectGroup', {
        _id: element._id,
        name: element.name,
        userIdArr: element.userIdArr,
        groupAdministratorIdArr: element.groupAdministratorIdArr,
        isCustomerService: element.isCustomerService,
        isFinish: element.isFinish,
        lastSendTime: element.lastSendTime,
      });
    }


    // ctx.socket.to(ctx.socket.id).emit('res', { message: 'ssss' });
    await next();

    // execute when disconnect.
  };
};
