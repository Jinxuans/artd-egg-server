
'use strict';
const Service = require('../../../core/base_service');

class UserService extends Service {

  constructor(ctx) {
    // 璋冪敤鐖剁被鐨勬瀯閫犲嚱鏁帮紝骞朵紶閫?modelName 鍙傛暟
    super(ctx);
    this.modelName = 'User';
  }


  async userIndex(payload) {

    const userOrganId = await this.getUserOrganLastId();

    const otherPayloadArr = [{ userOrganIdArr: userOrganId }];

    console.log('%c Line:120 馃尪 userOrganId', 'color:#465975', userOrganId);

    const userList = await this.index(payload, { otherPayloadArr });

    for (let index = 0; index < userList.list.length; index++) {
      const element = userList.list[index];
      userList.list[index].userInfo = await this.ctx.service.api.v1.userInfo.byUserId(element._id);
      userList.list[index].userOrganInfo = await this.ctx.service.api.v1.userOrgan.infoByLastId(element.userOrganIdArr);
      userList.list[index].userRoleArr = await this.ctx.service.api.v1.userRole.infoByArr(element.userRoleIds);
    }

    return userList;
  }

  async byUserId(userId) {
    const { ctx } = this;

    const user = await this.show(userId);
    user.userInfo = await ctx.service.api.v1.userInfo.byUserId(user._id);
    user.userOrganInfo = await ctx.service.api.v1.userOrgan.infoByLastId(user.userOrganIdArr);
    user.userRoleArr = await ctx.service.api.v1.userRole.infoByArr(user.userRoleIds);
    return user;
  }


  /**
   * 妫€鏌ョ敤鎴蜂俊鎭苟杩斿洖鎶ラ敊淇℃伅
   * @param {Object} user 鐢ㄦ埛淇℃伅
   */
  async chekUserState(user) {
    if (user.state === 0) {
      this.ctx.throw(200, this.httpCodeHash[400001]);
    }
  }


  /**
   * 鏍规嵁鐢ㄦ埛淇℃伅鏌ヨ鐢ㄦ埛璧勬枡
   * @param {String} identificaName 鏌ヨ鍚?
   * @param {String} identificaValue 鏌ヨ鍊?
   */
  async findByUsername(identificaName, identificaValue) {
    const { models } = this;

    const user = models.findOne({
      isDelete: false,
      [identificaName]: identificaValue,
    });

    // 鐢ㄦ潵妫€娴嬬敤鎴风姸鎬?纭畾鐢ㄦ埛娌￠棶棰?
    await this.chekUserState(user);
    return user;
  }


  async createUserByPwd(user) {

    // 妫€鏌ユ槸鍚︽湁閲嶅悕鐨?

    const findUser = await this.models.findOne({ username: user.username, isDelete: false });

    if (findUser) {
      this.ctx.throw(200, this.httpCodeHash[400003]);
    }

    if (user.mobile && user.mobile.length > 0) {
      const findByMobile = await this.ctx.service.api.v1.userInfo.byUserMobile(user.mobile);

      if (findByMobile) {
        this.ctx.throw(200, this.httpCodeHash[400003]);
      }
    }


    // 鍒涘缓鐢ㄦ埛
    const createdUser = await this.create({
      username: user.username,
      userRoleIds: user.userRoleIds,
      userOrganIdArr: user.userOrganIdArr,
      state: user.state,
    });
    const newUser = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    // 鍒涘缓鐢ㄦ埛璧勬枡

    await this.ctx.service.api.v1.userInfo.create({
      userId: newUser._id,
      nickname: user.nickname,
      name: user.name,
      mobile: user.mobile,
      mobilEarea: user.mobilEarea,
      avatar: user.avatar,
      sex: user.sex,
      email: user.email,
    });

    // 鍒涘缓鐢ㄦ埛瀵嗙爜
    await this.ctx.service.api.v1.userAuths.create({
      userId: newUser._id,
      identifier: 'password',
      credential: await this.ctx.helper.creatSaltPwd(user.credential, newUser.uid),
    });

    return {
      msg: 'ok',
    };
  }


  /**
   * 鑾峰彇鐢ㄦ埛鐨勬渶缁堢殑閮ㄩ棬id
   * @param {String} userId 鍙€?
   * @return {Object} object绫诲瀷鐨勯儴闂╥d
   */
  async getUserOrganLastId(userId = this.user.id) {

    const userInfo = await this.show(userId);

    const userOrganId = userInfo.userOrganIdArr[(userInfo.userOrganIdArr.length - 1)];

    if (userOrganId) {
      return userOrganId;
    }
    return null;
  }

  /**
   * 绠＄悊鍛樹慨鏀圭敤鎴疯祫鏂?
   * @param {String} userId 鐢ㄦ埛id
   * @param {Object} payload 鏇存柊鍙傛暟
   */
  async changeUserInfoByAdmin(userId, payload) {
    // 妫€鏌ユ湁娌℃湁鎿嶄綔鏉冮檺
    const canExecution = await this.ctx.service.api.v1.userOrgan.checkUserOrgan(this.user.id, userId);

    if (!canExecution) {
      this.ctx.throw(200, this.httpCodeHash[400005]);
    }

    const newUserPayload = {};


    // 登录账号不允许通过前端表单随意修改，避免影响登录

    if (payload.state) {
      newUserPayload.state = payload.state;
    } else {
      delete newUserPayload.state;
    }
    if (payload.userRoleIds) {
      newUserPayload.userRoleIds = payload.userRoleIds;
    } else {
      delete newUserPayload.userRoleIds;
    }

    if (payload.userOrganIdArr) {
      newUserPayload.userOrganIdArr = payload.userOrganIdArr;
    } else {
      delete newUserPayload.userOrganIdArr;
    }

    if (payload.userInfo) {
      // 仅更新附属资料，账号字段保持不变
      newUserPayload.userInfo = payload.userInfo;
    }


    const newUser = await this.update(userId, newUserPayload);


    await this.ctx.service.api.v1.userInfo.updateByUserId(userId, {
      ...payload.userInfo,
    });

    if (payload.credential) {
    // 淇敼鐢ㄦ埛瀵嗙爜
      await this.ctx.service.api.v1.userAuths.create({
        userId: newUser._id,
        identifier: 'password',
        credential: await this.ctx.helper.creatSaltPwd(payload.credential, newUser.uid),
      });
    }


  }


  async importUser(payload) {
    const { ctx, app } = this;
    // 鎷垮埌鏁版嵁 鐒跺悗寰幆鎻掑叆

    // payload.userList

    // 瑕佷娇鐢ㄤ簨鍔″娆℃彃鍏?

    const session = await app.mongoose.startSession();
    session.startTransaction(); // 寮€鍚簨鍔?
    let tableNum = 0;
    try {
      for (let index = 0; index < payload.userList.length; index++) {
        const element = payload.userList[index];
        tableNum++;

        // 妫€鏌ヨ鐢ㄦ埛鏄惁宸插湪搴撲腑 閫氳繃username鍒ゆ柇

        const findUser = await this.models.findOne({
          isDelete: false,
          username: element.mobile,
        });
        if (findUser) {
          continue;
        }
        // 寮€濮嬪噯澶囧啓鏁版嵁
        const userOrganIdArr = await ctx.service.api.v1.userOrgan.findOrganIdByOrganName(element.organName);
        // 澧炲姞鐢ㄦ埛璐︽埛
        const newUser = await this.create([{
          username: element.mobile,
          userRoleIds: [ '66ea438e729b3732f4e45e87' ],
          userOrganIdArr,
        }], { session });
        const userId = newUser[0]._id;
        console.log('%c Line:219 馃 newUser', 'color:#42b983', newUser);

        const userAuth = await ctx.service.api.v1.userAuths.create([{
          userId,
          identifier: 'password',
          credential: await ctx.helper.creatSaltPwd('123456', newUser.uid),
        }], { session });

        const newUserInfo = await ctx.service.api.v1.userInfo.create([{
          userId,
          groupName: element.groupName,
          name: element.nickname,
          politicalStatus: element.politicalStatus,
          bornDate: element.bornDate ? new Date(element.bornDate) : null,
          nickname: element.nickname,
          idNumber: element.idNumber,
          hometown: element.hometown,
          className: element.className,
          graduationDate: element.graduationDate ? new Date(element.graduationDate) : null,
          mobile: element.mobile,
          education: element.education,
          advisorName: element.advisorName,
          sex: element.sex,
        }], { session });

      }
      // 鎻愪氦浜嬪姟
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      console.log('%c Line:252 馃崠 error', 'color:#33a5ff', error);
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: error.msg || error.message, errorTableNum: tableNum };
    }

    return {
      success: true,
      message: '瀵煎叆鎴愬姛',
      errorTableNum: 0,
    };
  }

  /**
   * 鍓嶇鐢ㄦ埛绠＄悊鍒楄〃鏁版嵁
   * 閫傞厤 /api/user/list 鎺ュ彛锛岃繑鍥?records/current/size/total
   */
  async frontendList(payload = {}) {
    const { ctx } = this;
    const {
      current = 1,
      size = 10,
      userName,
      userGender,
      userPhone,
      userEmail,
      status,
    } = payload;

    // 鍩虹鍖归厤
    const baseMatch = { isDelete: false };
    if (status) {
      // 1:鍦ㄧ嚎 -> state 1, 鍏朵粬鍏ㄩ儴瑙嗕负闈?
      baseMatch.state = status === '1' ? 1 : { $ne: 1 };
    }

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'UserInfo',
          localField: '_id',
          foreignField: 'userId',
          as: 'userInfo',
        },
      },
      {
        $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true },
      },
    ];

    const filterAnd = [];
    if (userName) {
      const regex = new RegExp(userName, 'i');
      filterAnd.push({
        $or: [
          { username: regex },
          { 'userInfo.nickname': regex },
          { 'userInfo.name': regex },
        ],
      });
    }
    if (userPhone) {
      filterAnd.push({ 'userInfo.mobile': new RegExp(userPhone, 'i') });
    }
    if (userEmail) {
      filterAnd.push({ 'userInfo.email': new RegExp(userEmail, 'i') });
    }
    if (userGender) {
      const sex = userGender === '男' || userGender === '1' ? 1
        : userGender === '女' || userGender === '2' ? 0
          : null;
      if (sex !== null) filterAnd.push({ 'userInfo.sex': sex });
    }

    if (filterAnd.length) {
      pipeline.push({ $match: { $and: filterAnd } });
    }

    // 缁熻鎬绘暟
    const [{ total = 0 } = {}] = await this.models.aggregate([
      ...pipeline,
      { $count: 'total' },
    ]);

    // 鍒嗛〉鏁版嵁
    const list = await this.models.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (Number(current) - 1) * Number(size) },
      { $limit: Number(size) },
      {
        $lookup: {
          from: 'UserRole',
          localField: 'userRoleIds',
          foreignField: '_id',
          as: 'roles',
        },
      },
    ]);

    const records = list.map(item => {
      const genderText = item.userInfo?.sex === 1 ? '男' : item.userInfo?.sex === 0 ? '女' : '未知';
      const roleNames = (item.roles || []).map(r => r.code || r.name).filter(Boolean);
      const roleIds = (item.userRoleIds || []).map(id => id.toString());
      const finalRoleNames = roleNames.length ? roleNames : (item.username === 'admin' ? [ 'R_SUPER' ] : []);
      return {
        id: item._id?.toString(),
        account: item.username || '',
        avatar: item.userInfo?.avatar || '',
        status: item.state === 1 ? '1' : '4',
        userName: item.userInfo?.nickname || item.username,
        nickName: item.userInfo?.nickname || '',
        userGender: genderText,
        userPhone: item.userInfo?.mobile || '',
        userEmail: item.userInfo?.email || '',
        userRoles: finalRoleNames,
        userRoleIds: roleIds,
        createBy: item.createUserId || '',
        createTime: item.createdAt,
        updateBy: item.updateUserId || '',
        updateTime: item.updatedAt,
      };
    });

    return {
      records,
      current: Number(current),
      size: Number(size),
      total,
    };
  }


  async destroy(_id) {
    return await this.update(_id, { isDelete: true });
  }
}

module.exports = UserService;



