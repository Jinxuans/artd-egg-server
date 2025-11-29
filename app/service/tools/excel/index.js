'use strict';

const Service = require('egg').Service;
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
class IndexService extends Service {


  /**
     * 导出 Excel 文件到 Egg.js 的静态资源目录
     * @param {Array} data 数据数组
     * @param {Array} columns 列配置数组 [{ key, title, format }]
     * @param {String} fileName 导出的文件名，默认为 output.xlsx
     * @param {String} publicDir Egg.js 的静态资源目录，默认为 app/public
     * @return {String} 返回相对的文件访问路径
     */
  async exportExcel(data, columns, fileName = 'output.xlsx', publicDir = path.join(__dirname, '../app/public')) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('数据不能为空或不是数组');
    }
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('列配置不能为空或不是数组');
    }

    // 构造表头
    const headers = columns.map(col => col.title);

    // 构造数据内容
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.key]; // 根据列的键名获取值
        return col.format ? col.format(value) : value; // 如果有格式化方法，则格式化值
      });
    });

    // 合并表头和数据
    const sheetData = [ headers, ...rows ];

    // 创建工作簿和工作表
    const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 确保静态目录存在
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 文件路径
    const filePath = path.join(publicDir, fileName);

    // 写入文件
    xlsx.writeFile(workbook, filePath);

    // 返回文件的相对路径，供前端访问
    const relativePath = `/public/${fileName}`;
    console.log(`Excel 文件已成功导出: ${filePath}`);
    return relativePath;
  }


}

module.exports = IndexService;
