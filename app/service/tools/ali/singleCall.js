'use strict';

const Service = require('egg').Service;
const Core = require('@alicloud/pop-core');
class SingleCallService extends Service {
  /**
   * 发送语言验证码
   * @param {String} calledNumber 手机号码 单个
   * @param {Object} ttsParam 传递的参数 直接传object就行，如{ plateno: '晋EXA285' }
   * @param {String} ttsCode 语音通知id 默认为 TTS_256370047
   */
  async main(calledNumber, ttsParam, ttsCode = 'TTS_256370047') {
    ttsParam = JSON.stringify(ttsParam);
    const { app } = this;
    const { accessKeyId, accessKeySecret } = app.config.aliyunSms;
    const client = new Core({
      accessKeyId,
      accessKeySecret,
      // securityToken: '<your-sts-token>', // use STS Token
      endpoint: 'https://dyvmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
    });

    const params = {
      CalledNumber: calledNumber,
      TtsCode: ttsCode,
      TtsParam: ttsParam,
    };

    const requestOption = {
      method: 'POST',
      formatParams: false,
    };

    client.request('SingleCallByTts', params, requestOption).then(result => {

      if (result.Code === 'OK') {
        // TODO 更新打电话的状态
      } else {
        // TODO 记录失败状态 回头需要重试
      }
    }, ex => {

    });

  }
}

module.exports = SingleCallService;
