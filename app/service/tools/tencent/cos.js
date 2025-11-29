'use strict';

const Service = require('egg').Service;
const COS = require('cos-nodejs-sdk-v5');
class CosService extends Service {

  get cos() {
    const { app } = this;
    return new COS({
      SecretId: app.config.cos.secretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
      SecretKey: app.config.cos.secretKey, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
    });
  }

  async clientUploadUrl(fileName) {
    const { app } = this;

    const Url = await this.cos.getObjectUrl(
      {
        Bucket: app.config.cos.bucket, /* 填入您自己的存储桶，必须字段 */
        Region: app.config.cos.region, /* 存储桶所在地域，例如 ap-beijing，必须字段 */
        Key: `${fileName}`, /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），支持中文，必须字段 */
        Method: 'PUT',
        Sign: true,
      }
    );

    return Url;
  }

  /**
   * 根据文件地址获取文件访问链接
   * @param {String} filePath 原始文件地址
   * @return {String} 签名后的地址
   */
  async getObjectUrl(filePath) {

    const { app } = this;
    const Url = await this.cos.getObjectUrl(
      {
        Bucket: app.config.cos.bucket, /* 填入您自己的存储桶，必须字段 */
        Region: app.config.cos.region, /* 存储桶所在地域，例如 ap-beijing，必须字段 */
        Key: `${filePath}`, /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），支持中文，必须字段 */
      }
    );

    return Url;

  }

  /**
   * 流式上传文件
   * @param {Object} stream 文件流
   * @param {String} filePath 文件地址
   * @return {Object} 上传后的hash
   */
  async formUploader(stream, filePath) {
    const { app } = this;
    const res = await this.cos.putObject({
      Bucket: app.config.cos.bucket,
      Region: app.config.cos.region,
      Key: filePath, /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
      StorageClass: 'STANDARD',
      /* 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息 */
      Body: stream, // 上传文件对象
      ContentLength: fs.statSync(filePath).size,

    });
    console.log('%c Line:49 🍞 res', 'color:#ffdd4d', res);

    return {
      key: res.name,
      hash: md5(res.name),
    };

  }


}

module.exports = CosService;
