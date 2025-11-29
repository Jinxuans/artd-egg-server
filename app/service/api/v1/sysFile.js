
'use strict';
const Service = require('../../../core/base_service');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');
class SysFileService extends Service {

  constructor(ctx) {
    // 调用父类的构造函数，并传递 modelName 参数
    super(ctx);
    this.modelName = 'SysFile';
  }

  async showByHash(hash) {
    const { ctx, app, models } = this;

    const sysFileInfo = await models.findOne({
      isDelete: false,
      isFinish: true,
      hash,
    });

    let fileUrl = 'https://iph.href.lu/600x400?text=%E5%9B%BE%E7%89%87%E5%B7%B2%E8%A2%AB%E5%88%A0%E9%99%A4&fg=666666&bg=cccccc';

    if (!sysFileInfo) {
      // 返回图片已被删除
      fileUrl = 'https://iph.href.lu/600x400?text=没有找到图片&fg=666666&bg=cccccc';
    } else if (sysFileInfo?.state !== 1) {
      fileUrl = 'https://iph.href.lu/600x400?text=图片已被玩坏了&fg=666666&bg=cccccc';
    } else {
      if (sysFileInfo.uploadFileType === 'cos') {
        fileUrl = await ctx.service.tools.tencent.cos.getObjectUrl(sysFileInfo.patch);
      } else if (sysFileInfo.uploadFileType === 'oss') {

        fileUrl = await ctx.service.tools.ali.oss.getObjectUrl(sysFileInfo.patch);
      } else if (sysFileInfo.uploadFileType === 'qiniu') {
        fileUrl = await ctx.service.tools.qiniu.index.getObjectUrl(sysFileInfo.patch);
      } else if (sysFileInfo.isExternal) {
        fileUrl = sysFileInfo.patch;
      } else {
        fileUrl = app.config.webSiteUrl + sysFileInfo.patch;
      }
    }

    return {
      fileUrl,
    };
  }

  /**
 * 把图片数组还原为文件名
 * @param {Array} fileArray hash数组
 * @return {Array} 还原后的数组
 */
  async showFileUrlByArray(fileArray) {

    for (let index = 0; index < fileArray.length; index++) {
      const element = fileArray[index];
      fileArray[index] = (await this.showByHash(element)).fileUrl;
    }
    return fileArray;
  }

  async createStreamFile() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    console.log('%c Line:56 🍌 stream', 'color:#ffdd4d', stream.fields.fileId);


    // 存储文件名
    let localFileName = Math.random().toString(36).substring(2)
    + new Date().getTime()
    + path.extname(stream.filename).toLocaleLowerCase();
    console.log('%c Line:21 🧀 localFileName', 'color:#f5ce50', localFileName);

    const ossFilePath = 'oss/images/' + localFileName;
    // 原始文件名
    const name = stream.filename;
    const fileType = stream.mimeType;

    const sysAppConfig = await ctx.service.api.v1.sysAppConfig.showOne();
    let hash;
    let filePath;
    console.log('%c Line:72 🍻 sysAppConfig.uploadFileType', 'color:#2eafb0', sysAppConfig.uploadFileType);
    if (sysAppConfig.uploadFileType === 'qiniu') {
      const res = await ctx.service.tools.qiniu.index.formUploader(stream, ossFilePath);
      hash = res.hash;
      filePath = res.key;
    } else if (sysAppConfig.uploadFileType === 'oss') {
      const fileRes = await ctx.service.tools.ali.oss.formUploader(stream, ossFilePath);
      hash = fileRes.hash;
      filePath = fileRes.filePath;
    } else if (sysAppConfig.uploadFileType === 'cos') {

    } else if (sysAppConfig.uploadFileType === 'local') {
      if (stream.fields.fileId) {
        const fileInfo = await this.show(stream.fields.fileId);
        localFileName = fileInfo.patch.replace('oss/file/', '');
        console.log('%c Line:88 🌮 localFileName', 'color:#fca650', localFileName);
      }

      const fileRes = await this.createLocalFile(stream, localFileName, stream.fields.fileId);
      hash = fileRes.hash;
      filePath = fileRes.filePath;
    }

    if (sysAppConfig.uploadFileType === 'local') {
      await this.models.updateOne({ _id: stream.fields.fileId }, {
        isFinish: true,
      });

      return await this.show(stream.fields.fileId);
    }

    const fileData = {
      userId: this.user?.id || '65979f3ff073b87c80b183ba',
      name,
      patch: filePath,
      hash,
      type: fileType,
      uploadFileType: sysAppConfig.uploadFileType,
    };

    const createFile = await this.create(fileData);
    return createFile;


  }

  async createLocalFile(stream, localFileName) {
    console.log('%c Line:119 🥕 localFileName', 'color:#33a5ff', localFileName);
    const { app } = this;
    const folderPath = path.join(app.config.baseDir, '/app/public/uploadFile/file');
    const fullFilePath = path.join(app.config.baseDir, '/app/' + localFileName);
    const newFilePath = '/public/uploadFile/' + localFileName;

    // 创建路径
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const writeStream = fs.createWriteStream(fullFilePath);

    // 计算文件的 MD5 值
    const hash = crypto.createHash('md5');
    stream.on('data', chunk => {
      hash.update(chunk);
    });
    // 将文件流写入本地
    stream.pipe(writeStream);

    const { md5 } = await new Promise((resolve, reject) => {
      stream.on('end', () => {
        const md5 = hash.digest('hex');
        writeStream.on('finish', () => {
          resolve({ md5 });
        });
      });
    });

    return {
      hash: md5,
      filePath: newFilePath,
    };
  }

  async getClientUploadUrl(payload) {
    const { ctx } = this;
    const appConfig = await ctx.service.api.v1.sysAppConfig.showOne();

    const resObj = {};
    const hashFile = await this.models.findOne({
      hash: payload.hash,
      isDelete: false,
      isFinish: true,
    });

    if (hashFile) {
      resObj.hash = hashFile.hash;
      resObj.isFinish = hashFile.isFinish;
      resObj.uploadFileType = hashFile.uploadFileType;
      resObj.uploadFileType = hashFile.uploadFileType;
      resObj.fileId = hashFile._id.toString();
      resObj.name = hashFile.name;
    } else {
      const localName = Math.random().toString(36).substring(2) + new Date().getTime();

      const filePath = `oss/${payload.type}/${localName}_${payload.name}`;
      let url = null;
      const newFile = await this.create({
        userId: this.user?.id || '65979f3ff073b87c80b183ba',
        name: payload.name,
        patch: appConfig.uploadFileType === 'local' ? `public/uploadFile/${payload.type}/${localName}_${payload.name}` : filePath,
        type: payload.type || 'file',
        hash: payload.hash,
        fileSize: payload.fileSize,
        uploadFileType: appConfig.uploadFileType,
        isFinish: false,
      });

      if (appConfig.uploadFileType === 'local') {
        url = '/api/v1/sysFile/createStreamFile';
      } else if (appConfig.uploadFileType === 'oss') {
        url = await this.ctx.service.tools.ali.oss.clientUploadUrl(filePath);
      } else if (appConfig.uploadFileType === 'cos') {
        url = await ctx.service.tools.tencent.cos.clientUploadUrl(filePath);
      } else if (appConfig.uploadFileType === 'qiniu') {
        url = await ctx.service.tools.qiniu.index.clientUploadToken(filePath);
      }

      resObj.hash = newFile.hash;
      resObj.type = newFile.type;
      resObj.patch = appConfig.uploadFileType === 'local' ? `public/uploadFile/${payload.type}/${localName}_${payload.name}` : newFile.patch;
      resObj.fileId = newFile._id.toString();
      resObj.uploadFileType = newFile.uploadFileType;
      resObj.uploadUrl = url;
      resObj.isFinish = false;
      resObj.name = newFile.name;
    }

    return resObj;
  }


  /**
 * 异步创建Excel文件。
 * @param {Array} data - 要写入Excel的数据数组，每个元素代表一行数据。
 * @param {Object} columnNames - 列名称的对象映射，用于将数据键名转换为特定的列名。
 * @param {Array} allowedColumns -需要导出的字段
 * @param {String} filePathName - 生成的Excel文件的路径和名称，默认为'/public/excel/output.xlsx'。
 * @return {Object} 包含成功消息和文件路径的对象，供前端下载使用。
 */
  async createExcel(data, columnNames = {}, allowedColumns = [], filePathName = '/excel/output.xlsx') {

    try {

      // 检查是否有允许导出的字段列表，如果没有则使用所有字段
      if (!allowedColumns.length) {
        allowedColumns = Object.keys(columnNames);
      }

      // 过滤数据，只保留允许导出的字段
      const filteredData = data.map(row => {
        return Object.fromEntries(
          allowedColumns.map(columnKey =>
            [ columnNames[columnKey] || columnKey, row[columnKey] ]
          )
        );
      });

      // 处理数据并生成Excel
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      // 设置保存路径
      const filePath = path.join(this.app.baseDir, 'app/public' + filePathName);

      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // 创建目录，`recursive`选项确保创建所有父级目录
      }

      // 写入文件
      XLSX.writeFile(workbook, filePath);

      return {
        message: 'Excel file generated successfully!',
        filePath: `/public${filePathName}`, // 供前端下载的相对路径
      };

    } catch (error) {
      console.log('%c Line:257 🥪 error', 'color:#465975', error);
      this.ctx.throw(200, this.app.config.httpCodeHash[400103]);
    }

  }

}

module.exports = SysFileService;
