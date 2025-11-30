'use strict';
const Service = require('../../../core/base_service');
const md5 = require('md5');

class UserAuthsService extends Service {
  constructor(ctx) {
    super(ctx);
    this.modelName = 'UserAuths';
  }

  /**
   * Register user (frontend: username/password only)
   */
  async register(payload) {
    const { userName, password, captchaId, captcha } = payload;
    if (!userName || !password) {
      this.ctx.throw(200, this.httpCodeHash[400004]);
    }

    const appConfig = await this.ctx.service.api.v1.sysAppConfig.showOne();
    if (appConfig?.isOpenVerificationCode) {
      await this.ctx.service.api.v1.sysCaptcha.checkCaptcha(captchaId, captcha);
    }

    await this.passwordRegister('username', userName, password, 'password');
    return { msg: '注册成功' };
  }

  async checkAndUpdate(payload = {}) {
    const { models } = this;
    if (this.user) {
      payload.createUserId = this.user.id;
      payload.userOrganId = this.user.userOrganId;
    }

    const isHave = await this.models.findOne({
      identifier: payload.identifier,
      isDelete: false,
      userId: payload.userId,
    });
    if (isHave) {
      return await this.models.updateOne({ _id: isHave._id }, { $set: { ...payload } });
    }

    const res = await models.create(payload);
    return res;
  }

  /**
   * 微信小程序注册
   */
  async wxappRegister(wxOpenId) {
    const { ctx } = this;

    let findUser = await ctx.service.api.v1.user.findByUsername('username', 'wx' + wxOpenId);
    if (findUser) return findUser;

    findUser = await ctx.service.api.v1.user.create({
      username: 'wx' + wxOpenId,
      userRoleIds: ['664800e423b01a5eab84fdac'],
    });
    await ctx.service.api.v1.userInfo.create({ userId: findUser._id, registerType: 'wxapp' });

    await this.create({ identifier: 'wxapp', credential: wxOpenId, userId: findUser._id });
    return findUser;
  }

  /**
   * 用户名注册
   */
  async passwordRegister(identificaName, identificaValue, password, registerType) {
    const { ctx } = this;

    const findUser = await ctx.service.api.v1.user.findByUsername(identificaName, identificaValue);
    if (findUser) {
      ctx.throw(200, this.httpCodeHash[400003]);
    }

    // 绑定默认角色（R_USER），避免注册后无菜单
    const defaultRole = await ctx.service.api.v1.userRole.models.findOne({ code: 'R_USER', isDelete: false });
    let newUser = await ctx.service.api.v1.user.create({
      [identificaName]: identificaValue,
      userRoleIds: defaultRole ? [defaultRole._id] : []
    });
    newUser = newUser[0];

    await ctx.service.api.v1.userInfo.create({ userId: newUser._id, registerType });

    const credential = await this.ctx.helper.creatSaltPwd(password, newUser.uid);
    await this.create({ identifier: 'password', credential, userId: newUser._id });

    return newUser;
  }

  /**
   * Frontend-only login: username/password
   */
  async login(payload) {
    const { ctx, app } = this;
    const { userName, password, windowType = 'web', captchaId, captcha, authenticatorCode } = payload;

    if (!userName || !password) {
      ctx.throw(200, app.config.httpCodeHash[400004]);
    }

    const appConfig = await ctx.service.api.v1.sysAppConfig.showOne();
    if (appConfig?.isOpenVerificationCode) {
      await ctx.service.api.v1.sysCaptcha.checkCaptcha(captchaId, captcha);
    }

    const user = await this.passwordLogin('username', userName, password);

    if (user.isOpenGAuthenticator) {
      if (!authenticatorCode) {
        ctx.throw(200, app.config.httpCodeHash[400011]);
      }
      if (!await ctx.service.tools.gAuthenticator.index.checkCode(user.id, authenticatorCode)) {
        ctx.throw(200, app.config.httpCodeHash[400008]);
      }
    }

    const userOrganId = Array.isArray(user.userOrganIdArr) && user.userOrganIdArr.length > 0
      ? user.userOrganIdArr[user.userOrganIdArr.length - 1]
      : user.userOrganId;

    const { token, refreshToken } = await ctx.service.api.v1.token.creatByUserId(user._id, userOrganId, windowType);
    return { user, token, refreshToken };
  }

  async passwordLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;

    const user = await ctx.service.api.v1.user.findByUsername(identificaName, identificaValue);
    if (!user) {
      this.ctx.throw(200, this.httpCodeHash[400004]);
    }

    const findAuth = await models.findOne({ userId: user._id, identifier: 'password', isDelete: false });
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
    let userAuth, user;
    const wxRas = await ctx.service.tools.weixin.app.checkToken(credential);

    userAuth = await models.findOne({ identifier: 'weixin', credential: wxRas.openid, isDelete: false });

    if (!userAuth) {
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: ['664800e423b01a5eab84fdac'],
      });
      await this.create({ userId: user._id, identifier: 'weixin', credential: wxRas.openid });
    } else {
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }

  async googleLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;
    let userAuth, user;

    userAuth = await models.findOne({ identifier: 'google', credential, isDelete: false });

    if (!userAuth) {
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: ['664800e423b01a5eab84fdac'],
      });
      await this.create({ userId: user._id, identifier: 'google', credential });
    } else {
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }

  async emailLogin(identificaName, identificaValue, credential) {
    const { models, ctx } = this;
    let userAuth, user;
    const isSuccess = await ctx.service.tools.email.checkCode(identificaValue, credential);

    if (!isSuccess) {
      ctx.throw(200, this.httpCodeHash[400013]);
    }

    userAuth = await models.findOne({ identifier: 'email', isDelete: false });

    if (!userAuth) {
      user = await ctx.service.api.v1.user.create({
        username: identificaValue,
        userRoleIds: ['664800e423b01a5eab84fdac'],
      });
      await this.create({ userId: user._id, identifier: 'email', credential: identificaValue });
    } else {
      user = await ctx.service.api.v1.user.show(userAuth.userId);
    }

    return user;
  }

  async loginOut(userId, windowType = '') {
    await this.ctx.service.tools.redis.set('userRefreshToken' + windowType + '_' + userId, null, 0);
    return { msg: 'ok' };
  }

  async changePwdByAdmin(userId, payload) {
    if (userId) {
      const canExecution = await this.ctx.service.api.v1.userOrgan.checkUserOrgan(this.user.id, userId);
      if (!canExecution) {
        this.ctx.throw(200, this.httpCodeHash[400012]);
      }
      await this.changePwd(userId, payload.credential);
    }
  }

  async changePwd(userId, password) {
    const userInfo = await this.ctx.service.api.v1.user.show(userId);
    const newPwd = await this.ctx.helper.creatSaltPwd(password, userInfo.uid);

    await this.models.findOneAndUpdate({ userId, identifier: 'password' }, {
      userId,
      identifier: 'password',
      credential: newPwd,
    });
  }

  async createSeedSecretByuser(userId) {
    const user = await this.ctx.service.api.v1.user.show(userId);
    if (user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400009]);
    }
    return await this.ctx.service.tools.gAuthenticator.index.createSeedSecretByuser(userId);
  }

  async bindSeedSecret(userId, code) {
    const user = await this.ctx.service.api.v1.user.show(userId);
    if (user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400005]);
    }
    return await this.ctx.service.tools.gAuthenticator.index.bindSeedSecret(userId, code);
  }

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

  async unbindSeedSecret(userId, code) {
    const userAuth = await this.models.findOne({ userId, identifier: 'gAuthenticator', isDelete: false });
    const user = await this.ctx.service.api.v1.user.show(userId);

    if (!user.isOpenGAuthenticator) {
      this.ctx.throw(200, this.httpCodeHash[400010]);
    }
    const checkRes = await this.ctx.service.tools.gAuthenticator.index.checkCode(userId, code);
    if (!checkRes) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400008]);
    }

    await this.destroy(userAuth._id);
    await this.ctx.service.api.v1.user.update(userId, { isOpenGAuthenticator: false });
    return { msg: 'ok' };
  }

  async checkByUserName(username) {
    const user = await this.ctx.service.api.v1.user.findByUsername('username', username);
    if (!user) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400004]);
    }

    const userAuthsList = await this.models.find({ userId: user._id, isDelete: false });
    const canLoginMethod = userAuthsList.map(element => element.identifier);
    return { canLoginMethod, isOpenGAuthenticator: user.isOpenGAuthenticator || false };
  }

  async getOpenIdByUserId(userId) {
    const userAuths = await this.models.findOne({
      userId,
      identifier: { $in: ['wxapp', 'weixin'] },
      isDelete: false,
    });
    if (!userAuths) {
      this.ctx.throw(400, this.app.config.httpCodeHash['400905']);
    }

    return userAuths.credential;
  }
}

module.exports = UserAuthsService;
