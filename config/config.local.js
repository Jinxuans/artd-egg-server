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
  config.keys = appInfo.name + '_1703746560164_9678';

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',

    // mongoose: {
    //   url: 'mongodb://wujibiansu:iisjj8Ge6X75cML2@47.115.231.177:27017/wujibiansu',
    // },
  };

  return {
    ...config,
    ...userConfig,
  };
};
