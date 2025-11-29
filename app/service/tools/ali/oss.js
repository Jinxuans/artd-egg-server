'use strict';

const Service = require('egg').Service;
const OSS = require('ali-oss');
const md5 = require('md5');
class OssService extends Service {

  get client() {
    const { app } = this;
    const config = {
      // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: app.config.aliOss.region,
      // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
      accessKeyId: app.config.aliOss.accessKeyId,
      accessKeySecret: app.config.aliOss.accessKeySecret,
      // 填写Bucket名称。
      bucket: app.config.aliOss.bucket,
    };
    console.log('%c Line:11 🧀 config', 'color:#42b983', config);
    return new OSS(config);

  }

  async clientUploadUrl(fileName) {

    const url = this.client.signatureUrl(`${fileName}`, {
      method: 'PUT',
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return url;
  }

  /**
   * 获取签名文件下载地址
   * @param {String} filePath 文件地址
   * @return {String} 签名后的地址
   */
  async getObjectUrl(filePath) {
    const url = await this.client.signatureUrl(filePath);

    return url;
  }
  /**
   * 流式上传文件
   * @param {Object} stream 文件流
   * @param {String} filePath 文件地址
   * @return {Object} 上传后的hash
   */
  async formUploader(stream, filePath) {

    const res = await this.client.putStream(filePath, stream);
    console.log('%c Line:49 🍞 res', 'color:#ffdd4d', res);

    return {
      key: res.name,
      hash: md5(res.name),
    };

  }
}

module.exports = OssService;
