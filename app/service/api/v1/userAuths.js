
'use strict';
const Service = require('../../../core/base_service');
const md5 = require('md5');

class UserAuthsService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'UserAuths';
  }

  /**
   * 注册用户
   * @param {Object} payload 注册参数
   * @return {Object} 注册成功
   */
  async register(payload) {
    const { identifier } = payload;

    if (identifier === 'password') {

      // 检查验证码
      //await this.ctx.service.api.v1.sysCaptcha.checkCaptcha(payload.captchaId, payload.captcha);

      await this.passwordRegister(payload.identificaName, payload.identificaValue, payload.credential);
    } else if (identifier === 'weixin') {
      // 执行微信登录流程
    } else if (identifier === 'email') {
      // 执行微信登录流程
    }


    return {
      msg: '注册成功',
    };
  }

  async checkAndUpdate(payload = {}) {
    const { models } = this;
    if (this.user) {
      payload.createUserId = this.user.id;
      payload.userOrganId = this.user.userOrganId;
    }

    // TODO 检查是否存在，存在及修改
    const isHave = await this.models.findOne({
      identifier: payload.identifier,
      isDelete: false,
      userId: payload.userId,
    });
    if (isHave) {
      return await this.models.updateOne({
        _id: isHave._id,
      }, {
        $set: {
          ...payload,
        },
      });
    }

    const res = await models.create(payload);
    return res;


  }


  /**
   * 微信小程序注册
   * @param {String} wxOpenId 微信开放平台id
   */
  async wxappRegister(wxOpenId) {
    const { ctx } = this;

    let findUser = await ctx.service.api.v1.user.findByUsername('username', 'wx' + wxOpenId);

    if (findUser) {
      return findUser;
    }

    findUser = await ctx.service.api.v1.user.create({
      username: 'wx' + wxOpenId,
      userRoleIds: [ '664800e423b01a5eab84fdac' ],
    });
    const userInfo = await ctx.service.api.v1.userInfo.create({
      userId: findUser._id,
      registerType: 'wxapp',
    });


    await this.create({
      identifier: 'wxapp',
      credential: wxOpenId,
      userId: findUser._id,
    });

    return findUser;

  }


  /**
   * 用户名注册
   * @param {String} identificaName 字段名
   * @param {String} identificaValue 字段值
   * @param {String} password 密码
   * @param {String} registerType 注册类型
   */
  async passwordRegister(identificaName, identificaValue, password, registerType) {
    const { ctx } = this;

    const findUser = await ctx.service.api.v1.user.findByUsername(identificaName, identificaValue);

    if (findUser) {
      // 找到用户就报错
      ctx.throw(200, this.httpCodeHash[400003]);
    }

    let newUser = await ctx.service.api.v1.user.create({
      [identificaName]: identificaValue,
    });
    newUser = newUser[0];

    const userInfo = await ctx.service.api.v1.userInfo.create({
      userId: newUser._id,
      registerType,
    });

    const credential = await this.ctx.helper.creatSaltPwd(password, newUser.uid);

    await this.create({
      identifier: 'password',
      credential,
      userId: newUser._id,
    });

    return newUser;

  }


  async login(payload) {
    const { ctx, app } = this;
    const { identifier, windowType } = payload;
    let user;
    const appConfig = await ctx.service.api.v1.sysAppConfig.showOne();

    // identifier 校验
    if (!['password', 'weixin', 'wxapp', 'email', 'google'].includes(identifier)) {
      ctx.throw(200, app.config.httpCodeHash[400004]);
    }

    if (identifier === 'password') {
      if (appConfig.isOpenVerificationCode) {
        // 检查验证码
        await ctx.service.api.v1.sysCaptcha.checkCaptcha(payload.captchaId, payload.captcha);
      }

      user = await this.passwordLogin(payload.identificaName, payload.identificaValue, payload.credential);

      // 用户开启了二次验证
      if (user.isOpenGAuthenticator) {
        if (!payload.authenticatorCode) {
          ctx.throw(200, app.config.httpCodeHash[400011]);
        }

        if (!await ctx.service.tools.gAuthenticator.index.checkCode(user.id, payload.authenticatorCode)) {
          ctx.throw(200, app.config.httpCodeHash[400008]);
        }
      }


    } else if (identifier === 'weixin') {
      // 执行微信登录流程

      user = await this.weixinLogin(payload.identificaName, payload.identificaValue, payload.credential);


    } else if (identifier === 'wxapp') {
      const { openid: wxOpenId } = await this.ctx.service.tools.weixin.wxapp.wxappLoginByCode(payload.credential);
      user = await this.wxappRegister(wxOpenId);
    } else if (identifier === 'email') {
      // 执行邮箱登录验证

      user = await this.emailLogin(payload.identificaName, payload.identificaValue, payload.credential);

    } else if (identifier === 'google') {
      // 执行邮箱登录验证

      user = await this.googleLogin(payload.identificaName, payload.identificaValue, payload.credential);

    }

    console.log('%c Line:174 🥑 user', 'color:#4fff4B', user);

    const userOrganId = user.userOrganIdArr[(user.userOrganIdArr.length - 1)];
    // 生成token
    const { token, refreshToken } = await ctx.service.api.v1.token.creatByUserId(user._id, userOrganId, windowType);

    return {
      user,
      token,
      refreshToken,
    };
  }

  async passwordLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;

    const user = await ctx.service.api.v1.user.findByUsername(identificaName, identificaValue);

    if (!user) {
      this.ctx.throw(200, this.httpCodeHash[400004]);
    }


    const findAuth = await models.findOne({
      userId: user._id,
      identifier: 'password',
      isDelete: false,
    });

    if (!findAuth) {
      ctx.throw(200, this.httpCodeHash[400001]);
    }

    const confimCredential = await this.ctx.helper.creatSaltPwd(credential, user.uid);

    if (confimCredential !== findAuth.credential) {
      ctx.throw(200, this.httpCodeHash[400002]);
    }

    return user;
  }


  async weixinLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;

    // 检测邮箱验证码是否正确
    let userAuth,
      user;
    const wxRas = await ctx.service.tools.weixin.app.checkToken(credential);


    // 查找含有这个验证的登录信息
    userAuth = await models.findOne({
      identifier: 'weixin',
      credential: wxRas.openid,
      isDelete: false,
    });

    if (!userAuth) {
      // 未注册则重新注册
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: [ '664800e423b01a5eab84fdac' ],
      });

      userAuth = await this.create({
        userId: user._id,
        identifier: 'weixin',
        credential: wxRas.openid,
      });

    } else {
      // 已注册查询用户信息 并返回
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }


  async googleLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;

    // 检测邮箱验证码是否正确
    let userAuth,
      user;

    // 查找含有这个验证的登录信息
    userAuth = await models.findOne({
      identifier: 'google',
      credential,
      isDelete: false,
    });

    if (!userAuth) {
      // 未注册则重新注册
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: [ '664800e423b01a5eab84fdac' ],
      });

      userAuth = await this.create({
        userId: user._id,
        identifier: 'google',
        credential,
      });

    } else {
      // 已注册查询用户信息 并返回
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }


  async emailLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;

    // 检测邮箱验证码是否正确
    let userAuth,
      user;
    const isSuccess = await ctx.service.tools.email.checkCode(identificaValue, credential);

    if (!isSuccess) {
      ctx.throw(200, this.httpCodeHash[400013]);
    }

    // 查找含有这个验证的登录信息
    userAuth = await models.findOne({
      identifier: 'email',
      isDelete: false,
    });

    if (!userAuth) {
      // 未注册则重新注册
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: [ '664800e423b01a5eab84fdac' ],
      });

      userAuth = await this.create({
        userId: user._id,
        identifier: 'email',
        credential: identificaValue,
      });

    } else {
      // 已注册查询用户信息 并返回
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }

  async loginOut(userId, windowType = '') {
    await this.ctx.service.tools.redis.set('userRefreshToken' + windowType + '_' + userId, null, 0);

    return {
      msg: 'ok',
    };
  }


  /**
   * 通过权限重置密码
   * @param {Object} userId 用户信息
   * @param {Object} payload 参数
   */
  async changePwdByAdmin(userId, payload) {

    if (userId) {
      // 检查有没有操作权限
      const canExecution = await this.ctx.service.api.v1.userOrgan.checkUserOrgan(this.user.id, userId);

      if (!canExecution) {
        this.ctx.throw(200, this.httpCodeHash[400012]);
      }

      // 重置密码
      await this.changePwd(userId, payload.credential);
    }

  }


  /**
   * 重置密码
   * @param {String} userId 用户id
   * @param {String} password 密码
   */
  async changePwd(userId, password) {
    const userInfo = await this.ctx.service.api.v1.user.show(userId);

    const newPwd = await this.ctx.helper.creatSaltPwd(password, userInfo.uid);

    await this.models.findOneAndUpdate({
      userId,
      identifier: 'password',
    }, {
      userId,
      identifier: 'password',
      credential: newPwd,
    });

  }


  /**
 * 根据用户信息返回二维码
 * @param {String} userId 用户id
 * @return {Object} 返回参数
 */
  async createSeedSecretByuser(userId) {
    const user = await this.ctx.service.api.v1.user.show(userId);

    if (user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400009]);
    }
    return await this.ctx.service.tools.gAuthenticator.index.createSeedSecretByuser(userId);
  }

  /**
 * 验证并绑定
 * @param {String} userId 用户id
 * @param {String} code 用户code
 */
  async bindSeedSecret(userId, code) {
    const user = await this.ctx.service.api.v1.user.show(userId);

    if (user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400005]);
    }
    return await this.ctx.service.tools.gAuthenticator.index.bindSeedSecret(userId, code);
  }


  /**
 * 验证code
 * @param {String} userId 用户id
 * @param {String} code 用户code
 */
  async checkCode(userId, code) {
    const user = await this.ctx.service.api.v1.user.show(userId);

    if (user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400005]);
    }
    const checkRes = await this.ctx.service.tools.gAuthenticator.index.checkCode(userId, code);

    if (!checkRes) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400008]);
    }
  }


  // 解绑二次验证令牌
  async unbindSeedSecret(userId, code) {

    const userAuth = await this.models.findOne({
      userId,
      identifier: 'gAuthenticator',
      isDelete: false,
    });

    const user = await this.ctx.service.api.v1.user.show(userId);

    if (!user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400010]);
    }
    const checkRes = await this.ctx.service.tools.gAuthenticator.index.checkCode(userId, code);

    if (!checkRes) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400008]);
    }

    await this.destroy(userAuth._id);

    await this.ctx.service.api.v1.user.update(userId, {
      isOpenGAuthenticator: false,
    });

    return {
      msg: 'ok',
    };

  }


  // 解绑二次验证令牌
  async checkByUserName(username) {
    const user = await this.ctx.service.api.v1.user.findByUsername('username', username);

    if (!user) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400004]);
    }

    const userAuthsList = await this.models.find({
      userId: user._id,
      isDelete: false,
    });

    const canLoginMethod = [];

    for (let index = 0; index < userAuthsList.length; index++) {
      const element = userAuthsList[index];
      canLoginMethod.push(element.identifier);
    }
    return {
      canLoginMethod,
      isOpenGAuthenticator: user.isOpenGAuthenticator || false,
    };

  }

  /**
   * 根据用户id获取openId
   * @param {String} userId 用户id
   */
  async getOpenIdByUserId(userId) {

    const userAuths = await this.models.findOne({
      userId,
      identifier: { $in: [ 'wxapp', 'weixin' ] },
      isDelete: false,
    });
    if (!userAuths) {
      this.ctx.throw(400, this.app.config.httpCodeHash['400905']);
    }

    return userAuths.credential;
  }

}

module.exports = UserAuthsService;
