/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1712565557629_4852';
  config.httpCodeHash = require('./httpCodeHash');

  // add your middleware config here
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ],
  };
  config.jwt = { secret: '12345669990' };

  config.bodyParser = {
    jsonLimit: '10mb', // 设置接收的json类型body大小限制为10mb
    formLimit: '10mb', // 设置接收的form类型body大小限制为10mb
  };
  config.middleware = [ 'tools', 'auth', 'errorHanlder' ];
  config.routerAuth = [
    { url: '/api/v1/sysCaptcha/createCaptcha', method: 'POST' }, // 图形验证码
    { url: '/api/v1/sysAppConfig/showOne', method: 'GET' }, // 配置信息
    { url: '/api/v1/tools/wxpay/notify_url', method: 'POST' }, // 微信支付回调
    { url: '/api/v1/userAuths/login', method: 'POST' }, // 登录
    { url: '/api/v1/userAuths/register', method: 'POST' },
    { url: '/api/v1/token/refreshUserToken', method: 'POST' }, // 刷新token
    { url: '/api/v1/sysFile/showByHash/', method: 'GET' }, // 刷新token
    { url: '/api/v1/userAuths/checkByUserName', method: 'GET' }, // 刷新token
    { url: '/api/v1/shopCategory', method: 'GET' }, // 商品分类
    { url: '/api/v1/shopProduct', method: 'GET' }, // 商品
    { url: '/api/v1/system/menus/simple', method: 'GET' }, // 前端菜单简化列表
    // { url: '/', method: 'GET' }, // 刷新token
    // 在 config.routerAuth 数组中添加以下内容
    { url: '/api/v1/news', method: 'GET' }, // 资讯列表
    { url: '/api/v1/news/', method: 'GET' }, // 资讯详情
    { url: '/api/v1/newsType', method: 'GET' }, // 资讯类型列表
  ];

  config.multipart = {
    mode: 'stream',
    fileSize: 1024 * 1024 * 1024 * 10,
    fileExtensions: [ '.apk', '.xlsx', '.xls', '.doc', '.docx', '.ppt', '.pptx', '.text', '.pdf', '.mov', '.m4a', '.mp3', '.wav', '.aac', '.pcm' ],
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    cluster: {
      listen: {
        port: 7011,
        hostname: '0.0.0.0', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
        // path: '/var/run/egg.sock',
      },
    },
    mongoose: {
      url: 'mongodb://test:Sd3LrKBP65aFPrHj@43.130.231.27:27017/test',
      options: {
        useNewUrlParser: true, // 启用新的URL解析器
        useUnifiedTopology: true, // 启用统一的Topology引擎
        authSource: 'test',
      },
    },

    io: {
      init: {}, // passed to engine.io
      namespace: {
        '/': {
          connectionMiddleware: [ 'auth', 'connection' ],
          // connectionMiddleware: [ 'connection' ],
          packetMiddleware: [ 'packet' ],
        },
      },
      redis: {
        host: '47.243.24.150', // Redis host
        // host: '8.140.176.90',
        port: 26739,
        auth_pass: '4cNmC3XsYXsEbwm3',
        db: 8,
      },
    },

    redis: {
      client: {
        port: 26739, // Redis port
        host: '47.243.24.150', // Redis host
        password: '4cNmC3XsYXsEbwm3',
        db: 9,
      },
    },

    webSiteUrl: 'http://10.7.15.111:7011/',
  };

  return {
    ...config,
    ...userConfig,
  };
};
