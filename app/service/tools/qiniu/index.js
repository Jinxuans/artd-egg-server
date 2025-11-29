'use strict';
const Service = require('egg').Service;
const qiniu = require('qiniu');
class QiniuService extends Service {

  get mac() {
    const { app } = this;
    return new qiniu.auth.digest.Mac(app.config.qiniu.accessKey, app.config.qiniu.secretKey);

  }
  async config() {
    const { app } = this;
    const config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone[app.config.qiniu.zone];
    return config;
  }

  async clientUploadToken() {
    const { app } = this;
    const options = {
      scope: app.config.qiniu.bucket,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);

    const uploadToken = putPolicy.uploadToken(this.mac);

    return uploadToken;
  }

  /**
   * 根据文件地址生成可访问链接
   * @param {String} patch 文件地址
   * @return {String} 上传文件地址
   */
  async getObjectUrl(patch) {
    const { app } = this;
    const config = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(this.mac, config);
    const deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期

    console.log('%c Line:43 🥓 app.config.qiniu.bucketDomain', 'color:#93c0a4', app.config.qiniu.bucketDomain);
    console.log('%c Line:44 🧀 patch', 'color:#3f7cff', patch);
    const privateDownloadUrl = bucketManager.privateDownloadUrl(app.config.qiniu.bucketDomain, patch, deadline);
    return privateDownloadUrl;

  }

  /**
   * 流式上传文件
   * @param {Object} stream 文件流
   * @param {String} filePath 文件地址
   * @return {Object} 上传后的hash
   */
  async formUploader(stream, filePath) {
    const formUploader = new qiniu.form_up.FormUploader(await this.config);
    const putExtra = new qiniu.form_up.PutExtra();
    const readableStream = stream; // 可读的流
    const respBody = await formUploader.putStream(await this.clientUploadToken(), filePath, readableStream, putExtra);

    return respBody.data;
  }


}
module.exports = QiniuService;
