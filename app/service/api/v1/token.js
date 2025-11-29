
'use strict';
const Service = require('../../../core/base_service');

class TokenService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'Token';
  }

  /**
   * 根据用户id签发token
   * @param {String} userId 用户id
   * @param {String} userOrganId 用户部门
   * @param {String} windowType 平台类型
   * @param {String} expiresIn 过期时间 1m 1h 1d
   * @param {String} isRefreshToken 签发类型
   */
  async createToken(userId, userOrganId, windowType = '', expiresIn = '36500d', isRefreshToken = false) {
    const { app } = this;

    const userTokenQuery = {
      id: userId,
      isRefreshToken,
      windowType,
    };

    if (userOrganId) {
      userOrganId = userOrganId.toString();
      userTokenQuery.userOrganId = userOrganId;
    }
    return app.jwt.sign(userTokenQuery, app.config.jwt.secret, { expiresIn });
  }

  /**
   * 根据用户id和平台类型生层token
   * @param {String} userId 用户id
    * @param {String} userOrganId 用户部门
   * @param {String} windowType 平台类型
   * @return {Object} 返回刷新token和普通token
   */
  async creatByUserId(userId, userOrganId, windowType = '') {
    // 生成token
    const token = await this.createToken(userId, userOrganId, windowType);
    // 生成刷新token
    const refreshToken = await this.createToken(userId, userOrganId, windowType, '36500d', true);

    // redis中存储
    await this.ctx.service.tools.redis.set('userRefreshToken' + windowType + '_' + userId, refreshToken, 30 * 60 * 60 * 24);

    // 返回数据
    return {
      token,
      refreshToken,
    };
  }


  /**
   * 使用resfreshToken获取token
   * @param {String} resfreshToken 刷新前的token
   * @return {Object} token 刷新后的
   */
  async refreshUserToken(resfreshToken) {
    const { app } = this;
    try {
      const decode = await app.jwt.verify(resfreshToken, app.config.jwt.secret);
      console.log('%c Line:65 🌶 decode', 'color:#3f7cff', decode);

      const userInfo = await this.ctx.service.api.v1.user.show(decode.id);
      console.log('%c Line:68 🥝 userInfo.userOrganId', 'color:#fca650', userInfo.userOrganId);

      const token = await this.createToken(decode.id, userInfo.userOrganId);

      return {
        token,
      };
    } catch (error) {
      this.ctx.status = 401;
      this.ctx.body = {
        code: -1,
        msg: '刷新token过期',
      };
    }


  }


}

module.exports = TokenService;
