/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  // 处理跨域请求的
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  // 验证数据
  validate: {
    enable: true,
    package: 'egg-validate',
  },

  redis: {
    enable: true,
    package: 'egg-redis',
  },
  io: {
    enable: true,
    package: 'egg-socket.io',
  },
  fullQiniu: {
    enable: true,
    package: 'egg-full-qiniu',
  },
  mp: {
    enable: true,
    package: 'egg-mp',
  },
  // 腾讯支付
  tenpay: {
    enable: true,
    package: 'egg-tenpay',
  },
  routerPlus: {
    enable: true,
    package: 'egg-router-plus',
  },
};
