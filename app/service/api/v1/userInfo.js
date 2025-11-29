'use strict'
const Service = require('../../../core/base_service')

class UserInfoService extends Service {
  constructor(ctx) {
    super(ctx)
    this.modelName = 'UserInfo'
  }

  /**
   * 根据用户id获取
   */
  async infoByUserId(userId) {
    let userInfo = await this.models.findOne({ userId, isDelete: false })

    if (!userInfo) {
      userInfo = await this.create({ userId })
    }

    const user = await this.ctx.service.api.v1.user.show(userId)
    const allBtn = await this.ctx.service.api.v1.sysMenu.getAllBtn()
    return { user, userInfo, allBtn }
  }

  /**
   * 根据用户id查询用户的信息（适配前端数据结构）
   */
  async byUserId(userId) {
    if (!userId) {
      userId = this.user.id
    }

    const userInfo = await this.models.findOne({ userId, isDelete: false }).lean()
    const user = await this.ctx.service.api.v1.user.show(userId)

    if (!user) return null

    // 获取用户角色编码列表
    let roles = []
    if (user.userRoleIds && user.userRoleIds.length > 0) {
      try {
        const { list: userRoleArr } = await this.ctx.service.api.v1.userRole.index(
          { _id: { $in: user.userRoleIds }, pageSize: 99999 },
          { otherPayloadArr: [] }
        )
        roles = userRoleArr.map((role) => role.code || role.name)
      } catch (error) {
        console.log('获取用户角色失败:', error.message)
      }
    }

    // 获取用户按钮权限（统一走 sysMenu.getAllBtn，已处理管理员/角色及 meta.authList）
    let buttons = []
    try {
      buttons = (await this.ctx.service.api.v1.sysMenu.getAllBtn()) || []
    } catch (error) {
      console.log('获取按钮权限失败:', error.message)
      buttons = []
    }

    // 映射角色编码，前端使用 R_* 约定（优先使用 code）
    let roleCodes = roles
    if (!roleCodes || roleCodes.length === 0) {
      if (user.username === 'admin' || user.username === 'sysAdmin' || user.isSystem) {
        roleCodes = ['R_SUPER']
      } else {
        roleCodes = ['R_USER']
      }
    } else {
      roleCodes = roles.map((r) => {
        if (/super/i.test(r) || r === '管理员' || r === '超级管理员') return 'R_SUPER'
        if (/admin/i.test(r)) return 'R_ADMIN'
        return r.startsWith('R_') ? r : `R_${r.toUpperCase()}`
      })
    }

    const frontendUserInfo = {
      userId: String(userId),
      userName: user.username || '',
      account: user.username || '',
      email: userInfo?.email || `${user.username || 'user'}@example.com`,
      avatar: userInfo?.avatar || '',
      roles: roleCodes,
      buttons: buttons
    }

    return frontendUserInfo
  }

  async byUserMobile(mobile) {
    const userInfo = await this.models.findOne({ mobile, isDelete: false })
    return userInfo
  }

  async updateByUserId(userId, payload) {
    await this.models.findOneAndUpdate({ userId, isDelete: false }, payload)
  }

  async showUserInfo(userId) {
    const userInfo = await this.byUserId(userId)
    const user = await this.ctx.service.api.v1.user.show(userId)

    return {
      avatar: userInfo.avatar,
      username: user.username,
      nickname: userInfo.nickname
    }
  }
}

module.exports = UserInfoService
