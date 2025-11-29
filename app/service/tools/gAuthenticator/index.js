'use strict';
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const Service = require('egg').Service;
class IndexService extends Service {

  async createSeedSecret(userName, appName) {
    const secret = authenticator.generateSecret();
    console.log('%c Line:9 🍯 secret', 'color:#f5ce50', secret);

    const googleKeyuri = authenticator.keyuri(userName, appName, secret);
    const qrcodeUrl = await QRCode.toDataURL(googleKeyuri);

    return { secret, qrcodeUrl, googleKeyuri };
  }


  /**
 * 通过用户ID创建种子密钥
 * @param {String} userId 用户的唯一标识符
 * @return {Promise<Object>} 返回一个包含密钥信息的对象，包括密钥（secret）、二维码URL（qrcodeUrl）和Google密钥URI（googleKeyuri）。
 */
  async createSeedSecretByuser(userId) {
  // 根据用户ID获取用户信息
    const user = await this.ctx.service.api.v1.user.show(userId);
    // 创建种子密钥，并获取密钥、二维码URL和Google密钥URI
    const { secret, qrcodeUrl, googleKeyuri } = await this.createSeedSecret(user.username, 'appName');

    // 将密钥存储到Redis中，设置过期时间为三分钟
    await this.ctx.service.tools.redis.set(`gAuthenticator-${userId}`, secret, 60 * 3);

    return { secret, qrcodeUrl, googleKeyuri };
  }


  /**
 * 验证并绑定
 * @param {String} userId 用户id
 * @param {String} code 用户code
 */
  async bindSeedSecret(userId, code) {
    const { ctx } = this;
    const secret = await this.ctx.service.tools.redis.get(`gAuthenticator-${userId}`);
    const checkRes = await authenticator.check(code, secret);

    if (!checkRes) {
      ctx.throw(200, ctx.app.config.httpCodeHash[400008]);
    }
    // 跟用户信息做绑定
    // MJBCIW2UCITRQZ2L
    await this.ctx.service.api.v1.userAuths.checkAndUpdate({
      userId,
      identifier: 'gAuthenticator',
      credential: secret,
    });
    // 开启验证
    await this.ctx.service.api.v1.user.update(userId, {
      isOpenGAuthenticator: true,
    });

    return {
      msg: 'ok',
    };
  }

  /**
   * 验证code
   * @param {String} userId 用户ID
   * @param {String} code 用户code
   */
  async checkCode(userId, code) {
    const userAuth = await this.ctx.model.UserAuths.findOne({
      userId,
      identifier: 'gAuthenticator',
      isDelete: false,
    });

    console.log('%c Line:73 🍯 userAuth', 'color:#b03734', userAuth);
    if (!userAuth) {
      this.ctx.throw(200, this.ctx.app.config.httpCodeHash[400010]);
    }

    console.log('%c Line:85 🍏 code', 'color:#93c0a4', code);
    // const checkRes = authenticator.verify({ token: code, secret: userAuth.credential });
    const checkRes = await authenticator.check(code, userAuth.credential);
    console.log('%c Line:84 🍇 checkRes', 'color:#42b983', checkRes);

    return checkRes;
  }

}


module.exports = IndexService;
