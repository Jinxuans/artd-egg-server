
'use strict';

const moment = require('moment');
const mongoose = require('mongoose');
const md5 = require('md5');
module.exports = {


  async qiuLiuAjax(option) {

    const res = await this.ctx.curl(option.url, {
      method: 'POST',
      data: option.data,
      contentType: 'json',
      dataType: 'json',
    });

    return res;
  },


  /**
   * 根据密码生成加盐md5
   * @param {String} pwd 密码
   * @param {String} uid 用户id
   * @return {String} 加盐后的值
   */
  async creatSaltPwd(pwd, uid) {
    return md5(md5(pwd) + uid);
  },

  /**
 *
 * @param {Date} time 传入的日期
 * @param {String} format 格式化的数据
 * @return {String} 格式化完成的数据
 */
  relativeTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(time).format(format);
  },
  /**
 * 获取两个日期之间的所有日期
 * @param {string} startDateStr - 开始日期，格式为 'YYYY-MM-DD'
 * @param {string} endDateStr - 结束日期，格式为 'YYYY-MM-DD'
 * @return {Array} - 包含开始日期和结束日期之间所有日期的数组
 */
  async getDatesBetween(startDateStr, endDateStr) {
    const startDate = moment(startDateStr);
    const endDate = moment(endDateStr);
    const dates = [];

    const currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'days');
    }

    return dates;
  },
  /**
   * 根据给定的时间计算当前月份
   * @param {String|Date} birthDate 时间
   * @return {Number} 月份
   */
  async calculateAgeInMonths(birthDate) {
    const today = new Date(); // 获取当前日期
    const birth = new Date(birthDate); // 将出生日期转换为Date对象

    let months = (today.getFullYear() - birth.getFullYear()) * 12; // 计算年份差并转换为月份
    months -= birth.getMonth(); // 减去出生月份
    months += today.getMonth(); // 加上当前月份

    // 如果今天的日期比出生日期的日期小，则减去一个月
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    return months;
  },


  /**
   * 打乱数组中的顺序
   * @param {Array} array 需要随机的数组
   * @return {Array} 随机后的数组
   */
  async generateRandomArray(array) {
    const shuffledArray = array.slice(); // Create a copy of the original array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
  },

  /**
 * 输入出生日期获取年龄
 * @param {Date} birthDate 出生日期
 * @return {Number} 生日
 */
  getAge(birthDate) {
    const today = new Date();
    birthDate = new Date(birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  /**
 * 传入开始年龄和结束年龄，返回开始日期和结束日期
 * @param {Number} startAge 开始年龄
 * @param {Number} endAge 结束年龄
 */
  getBothDate(startAge, endAge) {
    return {
      startTime: moment().subtract(startAge, 'years'),
      endTime: moment().subtract(endAge, 'years'),
    };
  },


  /**
 * 随机生成uuid
 * @return {String} 生成的字符串
 */
  guid() {
    return (this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4());
  },

  S4() {
    return Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);
  },

  /** *
 * 获取给定日期内 不超过year年份的大小
 * @param {Date} date 给定日期
 * @param {Number} year 年份
 */
  getDateRange(date, year) {
    const lowerDate = new Date(date.getFullYear() - year, date.getMonth(), date.getDate());
    const upperDate = new Date(date.getFullYear() + year, date.getMonth(), date.getDate());
    return {
      lowerDate,
      upperDate,
    };
  },


  /**
 *字符串前面+0
 * @param {String} str  字符串
 * @param {Number} len  拼接长度
 * @return {String} temp + str
 */
  strTemp(str, len) {
    str = str.toString();
    let temp = '';
    for (let i = 0; i < len; i++) {
      temp = temp + '0';
    }
    return temp + str;// converting string to array of charCode=1,2,3
  },

  // 获取这周日期
  getWeekDays() {

    const today = moment();
    const startOfWeek = today.startOf('isoWeek');

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, 'days');
      dates.push(date.format('YYYY-MM-DD'));
    }
    return dates;
  },


  /**
* 根据长度生成随机数
* @param {Number} length 长度
* @return {String} 返回数字
*/
  getRandomNumber(length) {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },


  /**
 * 根据数生成邀请码
 * @param {Number} codeNum 邀请码长度
 * @param {Boolean} isUpCase 是否大写
 * @return {String} 邀请码
 */
  generateInviteCode(codeNum, isUpCase = true) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < codeNum; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (isUpCase) {
      result = result.toUpperCase();
    }

    return result;
  },

  /**
 *  获取一个V4版本的uuid 不带“-”
 * @return {String} V4版本的uuid
 */
  uuidv4() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4().replace(/-/g, '');
  },

  // 检查消息合法性
  async checkSmsLegal(content, title) {
    const { app, ctx } = this;
    const user = ctx.state.user;
    const userInfo = await ctx.service.api.v1.user.show(user.id);
    const { wxtoken: accessToken } = await ctx.service.api.v1.auth.wxtoken();
    let tempState = true;
    let result;
    const data = {
      content: title + '-' + content,
      version: 2,
      scene: 3,
      openid: userInfo.openid,
    };

    try {
      result = await ctx.curl('https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + accessToken, {
        // result = await ctx.curl('http://127.0.0.1:7005', {
        // 必须指定 method
        method: 'POST',
        // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
        contentType: 'json',
        data,
        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: 'json',
      });
    } catch (error) {
      tempState = false;
    }
    // const data = result.data.toString();
    if (result.data.errcode === 0) {


      if (result.data.result.suggest !== 'pass') {
        tempState = false;
      }
    }

    const system = await ctx.service.api.v1.system.show();
    const words = [];
    system.illegalWords.forEach(element => {
      if (content.indexOf(element) !== -1) {
        tempState = false;
        words.push(element);
      }
    });

    return { tempState, words };

  },


  deleteCDATA(args) {
    const keys = Object.keys(args);
    const obj = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (typeof args[k] === 'object') {
        obj[k] = args[k]._cdata;
      }
    }
    return obj;
  },
  /**
   * 首字母大写
   * @param {String} str 要处理的字符串
   * @return {String} 返回首字母大写
   */
  async titleCase(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
  },

  async duplicationArr(arr) {
    const result = [];
    // forEach遍历数组
    arr.forEach(item => {
      // indexOf判断新数组中有没有这个元素，没有返回-1  z
      if (result.indexOf(item) === -1) {
        result.push(item);
      }
    });

    return result;
  },

  async getRouteCode(query) {
    const chinaAreaData = require('china-area-data');

    if (query.beginProvinceName) {
      for (const key in chinaAreaData['86']) {
        if (Object.hasOwnProperty.call(chinaAreaData['86'], key)) {
          const element = chinaAreaData['86'][key];
          if (element === query.beginProvinceName) {
            query.beginProvinceCode = key;
          }
        }
      }
      if (query.beginCityName) {
        for (const key in chinaAreaData[query.beginProvinceCode]) {
          if (Object.hasOwnProperty.call(chinaAreaData[query.beginProvinceCode], key)) {
            const element = chinaAreaData[query.beginProvinceCode][key];
            if (element === query.beginCityName) {
              query.beginCityCode = key;
            }
          }
        }

        if (query.beginCountyName) {
          for (const key in chinaAreaData[query.beginCityCode]) {
            if (Object.hasOwnProperty.call(chinaAreaData[query.beginCityCode], key)) {
              const element = chinaAreaData[query.beginCityCode][key];
              if (element === query.beginCountyName) {
                query.beginCountyCode = key;
              }
            }
          }
        } else {
          query.beginCountyCode = '';
        }
      } else {
        query.beginCityCode = '';
      }
    } else {
      query.beginProvinceCode = '';
    }


    if (query.endProvinceName) {
      for (const key in chinaAreaData['86']) {
        if (Object.hasOwnProperty.call(chinaAreaData['86'], key)) {
          const element = chinaAreaData['86'][key];
          if (element === query.endProvinceName) {
            query.endProvinceCode = key;
          }
        }
      }
      if (query.endCityName) {
        for (const key in chinaAreaData[query.endProvinceCode]) {
          if (Object.hasOwnProperty.call(chinaAreaData[query.endProvinceCode], key)) {
            const element = chinaAreaData[query.endProvinceCode][key];
            if (element === query.endCityName) {
              query.endCityCode = key;
            }
          }
        }

        if (query.endCountyName) {
          for (const key in chinaAreaData[query.endCityCode]) {
            if (Object.hasOwnProperty.call(chinaAreaData[query.endCityCode], key)) {
              const element = chinaAreaData[query.endCityCode][key];
              if (element === query.endCountyName) {
                query.endCountyCode = key;
              }
            }
          }
        } else {
          query.endCountyCode = '';
        }
      } else {
        query.endCityCode = '';
      }
    } else {
      query.endProvinceName = '';
    }

    return query;
  },


  randomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      default:
        return 0;
    }
  },

  /**
* 获取导入的XLSX文件中的数据
* @param {object} file 请求中的文件对象，如：ctx.request.files[0]
* @param {string} headerKeyMap 表头-key转换对象，如 { 姓名: 'name', 邮箱 :'email' }
* @param {string} rwoTransform 行数据转换函数，比如：将字符串 'a,b,c' 转为 ['a', 'b', 'c'];
*/
  getImportXLSXData(file, headerKeyMap, rwoTransform = row => row) {
    const XLSX = require('xlsx');
    // const { filepath } = file;
    const workbook = XLSX.read(file);

    // 读取内容
    let exceldata = [];
    workbook.SheetNames.forEach(sheet => {
      if (workbook.Sheets.hasOwnProperty(sheet)) {
        let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]).map(row => {
          const obj = {};
          Object.keys(headerKeyMap).forEach(key => {
            obj[headerKeyMap[key]] = row[key];
          });
          return rwoTransform(obj);
        });
        data = JSON.parse(JSON.stringify(data));
        exceldata = [...exceldata, ...data];
      }
    });
    return exceldata;
  },

  // 生成excelBuffer
  async getXlsxBuffer(data) {
    const xlsx = require('node-xlsx').default;
    const options = { '!cols': [{ wch: 6 }, { wch: 7 }, { wch: 10 }, { wch: 20 }] };
    const buffer = xlsx.build(data, options); // Returns a buffer
    return buffer;
  },

  // stream 转 buffer
  async streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      stream.on('error', reject);
      stream.on('data', data => buffers.push(data));
      stream.on('end', () => resolve(Buffer.concat(buffers)));
    });
  },

  /**
   * buffer 转stream
   * @param {Object} buffer 传入buffer
   * @return {Object} stream流
   */
  bufferToStream(buffer) {
    const Duplex = require('stream').Duplex;
    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  },

  getString(str, n) {
    const strArr = [];
    for (let i = 0, l = str.length; i < l / n; i++) {
      let a = str.slice(n * i, n * (i + 1));
      if (str.length > n * (i + 1) && str.charAt(n * (i + 1) + 1) === ' ') {
        a = a + '-';
      }
      strArr.push(a);
    }
    return strArr;
  },

  /**
 * 将过来的参数处理成查询参数
 * @param {Object} payload 查询参数
 * @param {Array} regExpArr 正则的查询字段
 * @param {Array} notSeacherKeyArr 不参与的字符串
 */
  searchKey(payload, regExpArr = [], notSeacherKeyArr = []) {
    notSeacherKeyArr.push('pageSize');
    notSeacherKeyArr.push('page');
    notSeacherKeyArr.push('sort');
    notSeacherKeyArr.push('limit');
    const $and = [];
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined && !notSeacherKeyArr.includes(key)) {
        if (regExpArr.includes(key)) {
          $and.push({ [key]: { $regex: new RegExp(payload[key], 'i') } });

        } else {

          if (key.toString() !== 'prepayId' && key.toString() !== 'transactionId') {
            if ((key.toString().substring(key.toString().length - 2) === 'Id' || key.toString().substring(key.toString().length - 2) === 'id') && (typeof payload[key] === 'string' && payload[key].length === 24)) {
              $and.push({ [key]: new mongoose.Types.ObjectId(payload[key]) });

            } else {
              $and.push({ [key]: payload[key] });
            }
          } else {
            $and.push({ [key]: payload[key] });
          }

        }
      }
    });
    // 增加必传删除数据
    $and.push({ isDelete: false });
    return $and;
  },

  /**
*将对象处理成字符串
* @param {Object} param 实际参数的对象
* @param {String} key 参数字符串的前缀
* @param {Boolean} encode true/false 是否进行URL编码,默认为true
* @return {String} 拼接好的字符串
*/
  urlEncode(param, key, encode) {
    if (param == null) return '';
    let paramStr = '';
    const t = typeof (param);
    if (t === 'string' || t === 'number' || t === 'boolean') {
      paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
      for (const i in param) {
        const k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
        paramStr += this.urlEncode(param[i], k, encode);
      }
    }
    // paramStr = paramStr.slice(1)
    return paramStr;
  },

  /**
 *
 * @param {Number} year 年份
 * @param {Number} month 月份
 * @param {Number} day 日期
 * @return {Object} DateUtil  返回一组对象
 */

  getTime(date) {
    date = moment(date);
    const DateUtil = {
      months: () => {
        return {
          startOfMonth: date.startOf('month').format('YYYY-MM-DD HH:mm:ss'),
          endOfMonth: date.endOf('month').format('YYYY-MM-DD HH:mm:ss'),
        };
      },
      days: () => {
        return {
          startOfDay: date.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          endOfDay: date.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        };
      },
      weeks: () => {
        return {
          startOfDay: date.startOf('isoweek').format('YYYY-MM-DD HH:mm:ss'),
          endOfDay: date.endOf('isoweek').format('YYYY-MM-DD HH:mm:ss'),
        };
      },
      years: () => {
        return {
          startOfYear: date.startOf('year').format('YYYY-MM-DD HH:mm:ss'),
          endOfYear: date.endOf('year').format('YYYY-MM-DD HH:mm:ss'),
        };
      },
    };
    return DateUtil;
  },

  /**
*
* @param {Array} arr1 第一个元素
* @param {Array} arr2 第二个元素
* @return {Boolean} 返回第一个数组是否包含第二个元素的所有布尔值
*/
  array_includes(arr1, arr2) {
    const temp = new Set([...arr1, ...arr2]);
    return arr1.length === temp.size;
  },

  /**
*
* @return {String} 获取本月开始时间 如 2021-05-01
*/
  getFirstDate() {
    const firstDate = new Date();
    const startDate = firstDate.getFullYear() + '-' + ((firstDate.getMonth() + 1) < 10 ? '0' : '') + (firstDate.getMonth() + 1) + '-01';
    return startDate;
  },

  /**
*
* @return {String} 获取下月开始时间 如 2021-05-01
*/
  getNextFirstDate() {
    const firstDate = new Date();
    firstDate.setMonth(firstDate.getMonth() + 1);
    const startDate = firstDate.getFullYear() + '-' + ((firstDate.getMonth() + 1) < 10 ? '0' : '') + (firstDate.getMonth() + 1) + '-01';
    return startDate;
  },


  /**
*
* @return {String} 获取本月结束时间 如 2021-05-31
*/
  getLastDate() {
    const date = new Date();
    let currentMonth = date.getMonth();
    const nextMonth = ++currentMonth;
    const nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    const oneDay = 1000 * 60 * 60 * 24;
    const lastDate = new Date(nextMonthFirstDay - oneDay);
    const endDate = lastDate.getFullYear() + '-' + ((lastDate.getMonth() + 1) < 10 ? '0' : '') + (lastDate.getMonth() + 1) + '-' + (lastDate.getDate() < 10 ? '0' : '') + lastDate.getDate();
    return endDate;
  },

  /**
*
* @param {Array} arr1 第一个元素
* @param {Array} arr2 第二个元素
* @return {Array} 返回处理后的数组
*/
  uniqueArr(arr1, arr2) {
    // 合并两个数组
    arr1.push(...arr2);// 或者arr1 = [...arr1,...arr2]
    // 去重
    const arr3 = Array.from(new Set(arr1)); // let arr3 = [...new Set(arr1)]
    return arr3;
  },

};

