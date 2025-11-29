const Controller = require('egg').Controller;
const MessageContentType = require('../json/MessageContentType');

class ChatController extends Controller {
  async join() {
    const { ctx, app } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    console.log('%c Line:8 🥔 message', 'color:#4fff4B', message);
    const socket = ctx.socket;
    const callback = ctx.args[1];

    const client = socket.id;

    socket.join(message.groupId);

    const user = ctx.state.user;


    // 写入群组的数据库
    await ctx.service.api.v1.imGroup.joinCustomerGroup(message.groupId, user.id);

    const joinUserInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);
    console.log('%c Line:23 🥟 joinUserInfo', 'color:#465975', joinUserInfo);

    const succsessUserInfo = {
      username: null,
      avatar: null,
      nickname: null,
    };

    const msgObj = {
      type: 0,
      fromUserId: user.id,
      toId: message.groupId,
      state: 1,
      body: {
        msg: '新用户加入群聊',
        type: MessageContentType.MemberEnter,
        otherObj: {
          joinUserInfo,
          joinUserId: user.id,
          joinGroup: message.groupId,
          joinTime: new Date(),
          isCustomerUser: true,
          succsessUserInfo,
        },
      },
    };
    const newMessage = await ctx.service.api.v1.imMessage.create(msgObj);


    ctx.socket.to(message.groupId).emit('joinGroup', newMessage);

    callback({
      msg: 'ok',
    });

  }

  // async ping() {
  //   const { ctx } = this;
  //   const { app, socket } = this.ctx;
  //   const user = ctx.state.user;
  //   const message = this.ctx.args[0];
  //   const callback = this.ctx.args[1];

  //   const callbackMsg = {};
  //   callbackMsg.state = 1;
  //   callbackMsg.msg = '发送成功';

  //   message.fromUserId = user.id;
  //   // message.body.msg = await ctx.service.api.v1.system.meassageKeywords(message.body.msg);

  //   // 开始检测消息

  //   // 判断是单聊消息还是群聊消息

  //   if (message.isGroup) {
  //     // 是否是群组
  //     message.type = 1;
  //     // 获取群组信息

  //     const groupInfo = await ctx.service.api.v1.imGroup.show(message.toId);

  //     let inGroup = false;

  //     for (let index = 0; index < groupInfo.userIdArr.length; index++) {
  //       const element = groupInfo.userIdArr[index];
  //       if (element.toString() === user.id) {
  //         inGroup = true;
  //       }
  //     }
  //     if (!inGroup) {
  //       callbackMsg.state = 4;
  //       callbackMsg.msg = '不在群聊中';
  //     }


  //     if (groupInfo.isNoWords && groupInfo.groupAdministratorIdArr.some(item => item.toString() !== user.id)) {
  //       // 如果不在群里
  //       callbackMsg.state = 5;
  //       callbackMsg.msg = '群禁言了';
  //     }
  //     // 加入群聊
  //     socket.join(message.toId);

  //     const userInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);

  //     message.body.otherObj = {
  //       sendUserInfo: userInfo,
  //     };


  //     let newMessage = await ctx.service.api.v1.imMessage.create(message);
  //     newMessage = JSON.parse(JSON.stringify(newMessage));


  //     if (callbackMsg.state === 1) {
  //       newMessage.userInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);
  //       socket.to(message.toId).emit('getMsg', newMessage);
  //     }

  //   } else {
  //     // 检测是否是好友
  //     const friendRelationship = await ctx.service.api.v1.imFriend.getFriendRelationship(message.toId, user.id);

  //     // 检查有没有好友关系
  //     if (friendRelationship === 0) {
  //       callbackMsg.state = 2;
  //       callbackMsg.msg = '不是好友关系';
  //     }


  //     // 检查是否被拉黑
  //     if (friendRelationship.state === -1) {
  //       callbackMsg.state = 3;
  //       callbackMsg.msg = '消息已发出但被对方拒收';
  //     }
  //     // 存入数据库
  //     let newMessage = await ctx.service.api.v1.imMessage.create(message);

  //     // if (message.state !== 1) {
  //     //   return;
  //     // }
  //     const sendUserInfo = await ctx.service.api.v1.userInfo.getByUserId(user.id);
  //     // 获取要发送给的用户的id
  //     const receiveUserSocketId = await ctx.service.tools.redis.get(`socket.io-${message.toId}`);

  //     // 检测是否在线，在线就给发送消息回去
  //     if (receiveUserSocketId && message.state === 1) {
  //       const recipientSocket = app.io.sockets.sockets[receiveUserSocketId];
  //       newMessage = JSON.parse(JSON.stringify(newMessage));
  //       const fromUserInfo = await ctx.service.api.v1.userInfo.getByUserId(newMessage.fromUserId);
  //       newMessage.fromUserInfo = fromUserInfo;
  //       if (recipientSocket) {
  //         recipientSocket.emit('getMsg', newMessage);
  //       }
  //     }
  //     let bodyMessage = '';

  //     if (message.body.type === '101') {
  //       bodyMessage = message.body.msg;
  //     }

  //     if (message.state === 1) {
  //       ctx.service.api.v1.pushMessage.pushWithUserId(message.toId, { body: `${sendUserInfo.nickname} ：${bodyMessage}` });
  //     }
  //   }


  //   // 回调发送消息成功的事件
  //   callback(callbackMsg);

  // }
  async ping() {
    const { ctx } = this;
    if (!ctx.state.user) {
      throw new Error('用户未登录');
    }
    const { app, socket } = this.ctx;
    const user = ctx.state.user;
    if (!this.ctx.args || this.ctx.args.length < 2) {
      throw new Error('参数缺失');
    }
    const message = this.ctx.args[0];
    const callback = this.ctx.args[1];

    const callbackMsg = {
      state: 1,
      msg: '发送成功',
    };

    try {
      message.fromUserId = user.id;

      // 检测消息类型
      if (message.isGroup) {
        message.type = 1;
        const groupInfo = await ctx.service.api.v1.imGroup.show(message.toId);

        // 使用 Array.includes() 来检查用户是否在群组中
        const inGroup = groupInfo.userIdArr.includes(user.id);
        if (!inGroup) {
          callbackMsg.state = 4;
          callbackMsg.msg = '不在群聊中';
          return callback(callbackMsg);
        }

        if (groupInfo.isNoWords && !groupInfo.groupAdministratorIdArr.includes(user.id)) {
          callbackMsg.state = 5;
          callbackMsg.msg = '群禁言了';
          return callback(callbackMsg);
        }

        socket.join(message.toId);

        // 使用 let 来定义变量
        let newMessage = await ctx.service.api.v1.imMessage.create(message);
        newMessage = JSON.parse(JSON.stringify(newMessage));

        if (callbackMsg.state === 1) {
          newMessage.userInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);
          socket.to(message.toId).emit('getMsg', newMessage);
        }

      } else {
        const friendRelationship = await ctx.service.api.v1.imFriend.getFriendRelationship(message.toId, user.id);
        if (friendRelationship === 0) {
          callbackMsg.state = 2;
          callbackMsg.msg = '不是好友关系';
          return callback(callbackMsg);
        }

        if (friendRelationship.state === -1) {
          callbackMsg.state = 3;
          callbackMsg.msg = '消息已发出但被对方拒收';
          return callback(callbackMsg);
        }

        let newMessage = await ctx.service.api.v1.imMessage.create(message);
        const sendUserInfo = await ctx.service.api.v1.userInfo.getByUserId(user.id);
        const receiveUserSocketId = await ctx.service.tools.redis.get(`socket.io-${message.toId}`);

        if (receiveUserSocketId && message.state === 1) {
          const recipientSocket = app.io.sockets.sockets[receiveUserSocketId];
          if (recipientSocket) {
            const fromUserInfo = await ctx.service.api.v1.userInfo.getByUserId(newMessage.fromUserId);
            newMessage = JSON.parse(JSON.stringify(newMessage));
            newMessage.fromUserInfo = fromUserInfo;
            recipientSocket.emit('getMsg', newMessage);
          }
        }

        let bodyMessage = '';
        if (message.body.type === '101') {
          bodyMessage = message.body.msg;
        }

        if (message.state === 1) {
          const body = `${sendUserInfo.nickname} ：${bodyMessage}`;
          ctx.service.api.v1.pushMessage.pushWithUserId(message.toId, { body });
        }
      }

      callback(callbackMsg);

    } catch (error) {
      console.error('消息发送失败:', error);
      callback({ state: 0, msg: '发送失败' });
    }
  }
  async leave() {
    const { ctx, app } = this;
    const message = ctx.args[0] || {};
    const callback = ctx.args[1];
    const socket = ctx.socket;

    const user = ctx.state.user;

    const leaveUserInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);

    // 写入群组的数据库
    await ctx.service.api.v1.imGroup.leaveCustomerGroup(message.groupId, user.id, message.isFinish);

    const msgObj = {
      type: 0,
      toId: message.groupId,
      fromUserId: user.id,
      state: 1,
      body: {
        msg: '用户离开群聊',
        type: MessageContentType.MemberQuit,
        otherObj: {
          leaveUserInfo,
          leaveUserId: user.id,
          leaveGroup: message.groupId,
          leaveTime: new Date(),
          isCustomerUser: true,
          succsessUserInfo: {
            username: null,
            avatar: null,
            nickname: null,
          },
        },
      },
    };
    const newMessage = await ctx.service.api.v1.imMessage.create(msgObj);


    newMessage.userInfo = await ctx.service.api.v1.userInfo.showUserInfo(user.id);


    ctx.socket.broadcast.to(message.groupId).emit('leaveGroup', newMessage);


    socket.leave(message.groupId);

    callback({
      msg: 'ok',
    });

    // nsp.emit('linUp', await ctx.service.api.v1.queue.index({ pageSize: 99 }));
    // // nsp.emit(target, msg);
    // try {
    //   const { target, payload } = message;
    //   if (!target) return;
    //   const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
    //   console.log('%c Line:15 🍯 msg', 'color:#6ec1c2', msg);
    //   // nsp.emit(target, msg);
    // } catch (error) {
    //   console.log('%c Line:19 🍐 error', 'color:#3f7cff', error);
    //   app.logger.error(error);
    // }
  }


  async disconnect() {
    // TODO 实现离线情况
    const message = this.ctx.args[0];
  }

}

module.exports = ChatController;
