const Controller = require('../core/base_controller');

class HomeController extends Controller {

  async index() {
    const { ctx, app } = this;
    // 测试事务

    const session = await app.mongoose.startSession();
    session.startTransaction(); // 开启事务

    try {
      // 插入用户数据
      const user = await ctx.model.TestUser.create([{
        name: 'John Doe',
        age: 30,
      }], { session });

      // 插入订单数据
      const order = await ctx.model.TestOrder.create([{
        userId: user[0]._id,
        item: 'Laptop',
        price: 1000,
      }], { session });

      // 提交事务
      await session.commitTransaction();
      session.endSession();

      ctx.body = { success: true, user, order };
    } catch (error) {
      // 如果有错误，则回滚事务
      await session.abortTransaction();
      session.endSession();

      ctx.body = { success: false, message: error.message };
    }

  }
  async ceshi() {
    const { ctx } = this;
    console.log('%c Line:10 🍡 this', 'color:#33a5ff', this);
    console.log('%c Line:10 🍪 ctx', 'color:#42b983', this.modelName);
    const shuju = require('./response.json');
    const diqu = require('./diqu.json');
    console.log(shuju.result.list[0]);
    const columns = [
      { title: 'ID', key: 'id' },
      { title: '姓名', key: 'name' },
      { title: '学号', key: 'studentno' },
      {
        title: '性别', key: 'gender', format: key => {
          return key === '0' ? '男' : '女';
        },
      },
      {
        title: '民族', key: 'nationcode', format: key => {
          console.log('%c Line:54 🍆 key', 'color:#ed9ec7', key);
          const num = [
            {
              key: '0',
              value: '未知',
            },
            {
              key: '1',
              value: '汉族',
            },
            {
              key: '2',
              value: '蒙古族',
            },
            {
              key: '3',
              value: '回族',
            },
            {
              key: '4',
              value: '藏族',
            },
            {
              key: '5',
              value: '维吾尔族',
            },
            {
              key: '6',
              value: '苗族',
            },
            {
              key: '7',
              value: '彝族',
            },
            {
              key: '8',
              value: '壮族',
            },
            {
              key: '9',
              value: '布依族',
            },
            {
              key: '10',
              value: '朝鲜族',
            },
            {
              key: '11',
              value: '满族',
            },
            {
              key: '12',
              value: '侗族',
            },
            {
              key: '13',
              value: '瑶族',
            },
            {
              key: '14',
              value: '白族',
            },
            {
              key: '15',
              value: '土家族',
            },
            {
              key: '16',
              value: '哈尼族',
            },
            {
              key: '17',
              value: '哈萨克族',
            },
            {
              key: '18',
              value: '傣族',
            },
            {
              key: '19',
              value: '黎族',
            },
            {
              key: '20',
              value: '傈僳族',
            },
            {
              key: '21',
              value: '佤族',
            },
            {
              key: '22',
              value: '畲族',
            },
            {
              key: '23',
              value: '高山族',
            },
            {
              key: '24',
              value: '拉祜族',
            },
            {
              key: '25',
              value: '水族',
            },
            {
              key: '26',
              value: '东乡族',
            },
            {
              key: '27',
              value: '纳西族',
            },
            {
              key: '28',
              value: '景颇族',
            },
            {
              key: '29',
              value: '柯尔克孜族',
            },
            {
              key: '30',
              value: '土族',
            },
            {
              key: '31',
              value: '达斡尔族',
            },
            {
              key: '32',
              value: '仫佬族',
            },
            {
              key: '91',
              value: '摩梭人',
            },
            {
              key: '33',
              value: '羌族',
            },
            {
              key: '34',
              value: '布朗族',
            },
            {
              key: '35',
              value: '撒拉族',
            },
            {
              key: '36',
              value: '毛南族',
            },
            {
              key: '37',
              value: '仡佬族',
            },
            {
              key: '38',
              value: '锡伯族',
            },
            {
              key: '39',
              value: '阿昌族',
            },
            {
              key: '40',
              value: '普米族',
            },
            {
              key: '41',
              value: '塔吉克族',
            },
            {
              key: '42',
              value: '怒族',
            },
            {
              key: '43',
              value: '乌孜别克族',
            },
            {
              key: '44',
              value: '俄罗斯族',
            },
            {
              key: '45',
              value: '鄂温克族',
            },
            {
              key: '46',
              value: '德昂族',
            },
            {
              key: '47',
              value: '保安族',
            },
            {
              key: '48',
              value: '裕固族',
            },
            {
              key: '49',
              value: '京族',
            },
            {
              key: '50',
              value: '塔塔尔族',
            },
            {
              key: '51',
              value: '独龙族',
            },
            {
              key: '52',
              value: '鄂伦春族',
            },
            {
              key: '53',
              value: '赫哲族',
            },
            {
              key: '54',
              value: '门巴族',
            },
            {
              key: '55',
              value: '珞巴族',
            },
            {
              key: '56',
              value: '基诺族',
            },
            {
              key: '81',
              value: '穿青族',
            },
            {
              key: '57',
              value: '其他',
            },
            {
              key: '58',
              value: '外国血统',
            },
            {
              key: '59',
              value: '穿青人',
            },
            {
              key: '92',
              value: '革家人',
            },
          ];

          for (let index = 0; index < num.length; index++) {
            const element = num[index];

            if (element.key === key?.toString()) {
              return element.value;
            }

          }
          return '-';
        },
      },
      {
        title: '政治面貌', key: 'politicalcode', format: key => {
          const num = [
            {
              key: '0',
              value: '其他',
            },
            {
              key: '01',
              value: '中共党员',
            },
            {
              key: '02',
              value: '中共预备党员',
            },
            {
              key: '03',
              value: '共青团员',
            },
            {
              key: '13',
              value: '群众',
            },
          ];

          for (let index = 0; index < num.length; index++) {
            const element = num[index];
            if (element.key === key?.toString()) {
              return element.value;
            }
          }
          return '-';
        },
      },
      { title: '院系', key: 'collegename' },
      { title: '培养层次', key: 'trainlevel' },
      { title: '专业', key: 'professional' },
      {
        title: '年级', key: 'graduate', format: key => {
          const num = [
            2025,
            2024,
            2023,
            2022,
            2021,
            2020,
            2019,
          ];
          return num[key];
        },
      },
      { title: '入学时间', key: 'joindate' },
      { title: '学制', key: 'eductionalSystem' },
      { title: '毕业时间', key: 'graduateTime1' },
      {
        title: '是否毕业', key: 'stopFlag', format: key => {
          return key ? '是' : '否';
        },
      },
      { title: '班级', key: 'classno' },
      { title: '状态', key: 'address' },
      { title: '身份证号', key: 'idcard' },
      { title: '手机号', key: 'phone' },
      {
        title: '地区', key: 'idcard', format: key => {
          function getFullRegionFromIdCard(idCard, regionData) {

            if (!idCard) {
              return '-';
            }

            const regionCode = idCard.substring(0, 6);

            /**
             * 递归查找完整地区名称
             * @param {Array} regions - 当前行政区划数据
             * @param {string} code - 待匹配的行政区划代码
             * @param {Array} path - 路径数组，用于记录省、市、县
             * @return {Array|null} - 匹配的完整路径数组或null
             */
            function findFullRegion(regions, code, path = []) {
              for (const region of regions) {
                const newPath = [...path, region.name]; // 更新路径
                if (region.code === code) {
                  return newPath; // 找到目标区域
                }
                if (region.children) {
                  const result = findFullRegion(region.children, code, newPath);
                  if (result) {
                    return result; // 递归找到目标
                  }
                }
              }
              return null; // 未找到
            }

            const fullRegionPath = findFullRegion(regionData, regionCode);
            return fullRegionPath ? fullRegionPath.join('-') : '未知地区';
          }

          const a = getFullRegionFromIdCard(key, diqu);
          console.log('%c Line:424 🥟 a', 'color:#7f2b82', a);
          return a;
        },
      },
    ];
    const res = await ctx.service.tools.excel.index.exportExcel(shuju.result.list, columns, 'ceshi.xlsx');

    ctx.body = shuju.result.list[0];
  }


  /**
 * 根据身份证号获取所在地区
 * @param {string} idCard - 身份证号码
 * @param {Array} regionData - 行政区划数据
 * @return {string} - 返回地区名称，若无效则返回"未知地区"
 */

}

module.exports = HomeController;
