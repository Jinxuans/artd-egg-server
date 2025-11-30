'use strict'
const Service = require('../../../core/base_service')

class SysMenuService extends Service {
  constructor(ctx) {
    super(ctx)
    this.modelName = 'SysMenu'
  }

  // -------- helpers -------------------------------------------------------
  isAdmin(userInfo) {
    return (
      (userInfo.username && ['sysAdmin', 'admin'].includes(userInfo.username)) ||
      userInfo.isSystem
    )
  }

  async fetchUserInfo() {
    return this.ctx.service.api.v1.user.show(this.ctx.state.user.id)
  }

  async fetchAccessibleMenuIds(userInfo) {
    if (this.isAdmin(userInfo)) {
      const all = await this.models.find({ isDelete: false }).select('_id').lean()
      return all.map((m) => String(m._id))
    }

    if (!Array.isArray(userInfo.userRoleIds) || userInfo.userRoleIds.length === 0) return []

    const { list: roles } = await this.ctx.service.api.v1.userRole.index(
      { _id: { $in: userInfo.userRoleIds }, pageSize: 99999 },
      { otherPayloadArr: [] }
    )
    const ids = roles.flatMap((r) => r.sysMenuIds || [])

    // 兜底：普通角色（R_USER）未绑定菜单时，自动授予非管理员菜单
    const roleCodes = roles.map((r) => r.code).filter(Boolean)
    if (ids.length === 0 && roleCodes.includes('R_USER')) {
      const basic = await this.models
        .find({
          isDelete: false,
          $or: [
            { 'meta.roles': { $exists: false } },
            { 'meta.roles': { $size: 0 } },
            { 'meta.roles': { $nin: ['R_SUPER', 'R_ADMIN'] } }
          ]
        })
        .select('_id')
        .lean()
      return basic.map((m) => String(m._id))
    }

    return [...new Set(ids.map(String))]
  }

  normalizeComponent(path) {
    if (!path) return ''
    let p = path
    if (p.startsWith('@/views')) p = p.replace(/^@\/views/, '')
    p = p.replace(/\.vue$/i, '')
    if (p && !p.startsWith('/')) p = `/${p}`
    return p
  }

  // 保持元信息字段完整，填充默认值
  normalizeMeta(meta = {}) {
    return {
      title: meta.title || '',
      icon: meta.icon || '',
      isHide: meta.isHide || false,
      isKeepAlive: meta.isKeepAlive || false,
      keepAlive: meta.keepAlive ?? meta.isKeepAlive ?? false,
      isAffix: meta.isAffix || false,
      isIframe: meta.isIframe || false,
      showBadge: meta.showBadge || false,
      showTextBadge: meta.showTextBadge || '',
      isHideTab: meta.isHideTab || false,
      link: meta.link || '',
      authList: meta.authList || [],
      isFirstLevel: meta.isFirstLevel ?? false,
      roles: meta.roles || [],
      fixedTab: meta.fixedTab || false,
      activePath: meta.activePath || '',
      isFullPage: meta.isFullPage || false,
      isAuthButton: meta.isAuthButton || false,
      authMark: meta.authMark || '',
      parentPath: meta.parentPath || ''
    }
  }

  // 计算父链
  async buildSuperior(parentPath) {
    if (!parentPath) return []
    const parent = await this.models.findOne({ path: parentPath, isDelete: false }).lean()
    if (!parent) return []
    return [...(parent.menuSuperior || []), parent.path]
  }

  // -------- public methods -------------------------------------------------

  /**
   * 返回按钮权限列表（字符串数组）
   */
  async getAllBtn() {
    const userInfo = await this.fetchUserInfo()
    // 管理员直接拥有所有按钮
    let menuIds = []
    if (this.isAdmin(userInfo)) {
      menuIds = (await this.models.find({ isDelete: false }).select('_id').lean()).map((m) =>
        String(m._id)
      )
    } else {
      menuIds = await this.fetchAccessibleMenuIds(userInfo)
    }
    if (!menuIds.length) return []

    const menus = await this.models
      .find({
        _id: { $in: menuIds },
        isDelete: false
      })
      .lean()

    // 1) 独立按钮节点（menuType=button）
    const buttonMarks = menus
      .filter((m) => ['button', 'btn'].includes(m.menuType))
      .map((m) => m.btnPower)
      .filter(Boolean)

    // 2) 嵌入在 meta.authList 的按钮权限
    const authMarks = menus
      .flatMap((m) => (Array.isArray(m.meta?.authList) ? m.meta.authList : []))
      .map((a) => a.authMark)
      .filter(Boolean)

    return [...new Set([...buttonMarks, ...authMarks])]
  }

  /**
   * 返回前端需要的菜单树（过滤按钮）
   */
  async getSimpleMenus() {
    const userInfo = await this.fetchUserInfo()
    const isAdmin = this.isAdmin(userInfo)
    const filter = { isDelete: false, menuType: { $nin: ['button', 'btn'] } }

    if (!isAdmin) {
      const ids = await this.fetchAccessibleMenuIds(userInfo)
      if (!ids.length) return []
      filter._id = { $in: ids }
    }

    const menus = await this.models.find(filter).sort({ menuSort: 1, name: 1 }).lean()

    const buildTree = (parentPath = '') => {
      const nodes = menus.filter((m) => {
        // 顶层：无父级
        if (!m.menuSuperior || m.menuSuperior.length === 0) return parentPath === ''
        // 子级：父路径匹配
        return (
          m.menuSuperior.length > 0 &&
          m.menuSuperior[m.menuSuperior.length - 1] === parentPath
        )
      })

      return nodes.map((m) => {
        // 二级及以下返回相对路径，避免前端校验报“path 不能以 / 开头”
        const finalPath =
          m.menuSuperior && m.menuSuperior.length > 0 && m.path?.startsWith('/')
            ? m.path.slice(1)
            : m.path || ''

        // 只有当自身有 path 且有子节点声明父级时才递归
        const children =
          m.path && menus.some((x) => x.menuSuperior && x.menuSuperior.slice(-1)[0] === m.path)
            ? buildTree(m.path)
            : []
        return {
          id: String(m._id),
          path: finalPath,
          name: m.name || '',
          component: this.normalizeComponent(m.component) || undefined,
          menuSort: m.menuSort || 0,
            meta: {
              title: m.meta?.title || m.title || '',
              icon: m.meta?.icon || '',
              isHide: m.meta?.isHide || false,
              isKeepAlive: m.meta?.isKeepAlive || false,
              keepAlive: m.meta?.keepAlive ?? m.meta?.isKeepAlive ?? false,
              isAffix: m.meta?.isAffix || false,
              isIframe: m.meta?.isIframe || false,
              showBadge: m.meta?.showBadge || false,
              showTextBadge: m.meta?.showTextBadge || '',
              isHideTab: m.meta?.isHideTab || false,
              link: m.meta?.link || '',
              isFullPage: m.meta?.isFullPage || false,
              authList: m.meta?.authList || [],
              isFirstLevel:
                m.meta?.isFirstLevel ?? (!m.menuSuperior || m.menuSuperior.length === 0),
              roles: m.meta?.roles || [],
              fixedTab: m.meta?.fixedTab || false,
              activePath: m.meta?.activePath || '',
              isAuthButton: m.meta?.isAuthButton || false,
              authMark: m.meta?.authMark || '',
              parentPath:
                m.meta?.parentPath ||
                (m.menuSuperior ? m.menuSuperior[m.menuSuperior.length - 1] || '' : '')
            },
            redirect: m.redirect || '',
            routerName: m.routerName || '',
            ...(children.length ? { children } : {})
          }
        })
    }

    return buildTree()
  }

  /**
   * 返回完整的菜单树（包含按钮），用于角色权限配置
   */
  async findTree() {
    const menus = await this.models
      .find({ isDelete: false })
      .sort({ menuSort: 1, name: 1 })
      .lean()

    const buildTree = (parentPath = '') => {
      const nodes = menus.filter((m) => {
        if (!m.menuSuperior || m.menuSuperior.length === 0) return parentPath === ''
        return m.menuSuperior[m.menuSuperior.length - 1] === parentPath
      })

      return nodes.map((m) => {
        const children =
          menus.some((x) => x.menuSuperior && x.menuSuperior.slice(-1)[0] === m.path) ||
          (m.menuType === 'menu' && menus.some((x) => x.menuSuperior?.includes(m.path)))
            ? buildTree(m.path)
            : []

        return {
          id: String(m._id),
          path: m.path,
          name: m.name || '',
          menuType: m.menuType || 'menu',
          btnPower: m.btnPower || '',
          component: this.normalizeComponent(m.component) || '',
          menuSuperior: m.menuSuperior || [],
          meta: this.normalizeMeta(m.meta || {}),
          menuSort: m.menuSort || 0,
          createTime: m.createdAt || '',
          updateTime: m.updatedAt || '',
          ...(children.length ? { children } : {})
        }
      })
    }

    return buildTree()
  }

  /**
   * 创建菜单/按钮
   */
  async create(payload = {}) {
    const { path, name, parentPath, menuType, btnPower } = payload
    if (!path || !name) this.ctx.throw(200, 'path 与 name 为必填')

    const exists = await this.models.findOne({ path, isDelete: false })
    if (exists) this.ctx.throw(200, '菜单路径已存在')

    const menuSuperior = payload.menuSuperior && payload.menuSuperior.length
      ? payload.menuSuperior
      : await this.buildSuperior(parentPath)

    const meta = this.normalizeMeta(payload.meta || {})
    meta.parentPath = parentPath || meta.parentPath || ''
    meta.isFirstLevel = menuSuperior.length === 0

    const doc = {
      path,
      name,
      component: payload.component || '',
      menuSuperior,
      meta,
      redirect: payload.redirect || '',
      menuType: btnPower ? 'button' : (menuType || 'menu'),
      btnPower: btnPower || null,
      servicePath: payload.servicePath || '',
      servicePathType: payload.servicePathType || 'GET',
      routerName: payload.routerName || '',
      menuSort: payload.menuSort || 0,
      state: payload.state ?? 1,
      isDelete: false
    }

    return this.models.create(doc)
  }

  /**
   * 更新菜单
   */
  async update(_id, payload = {}) {
    const info = await this.models.findOne({ _id, isDelete: false }).lean()
    if (!info) this.ctx.throw(200, '菜单不存在')

    const nextPath = payload.path || info.path
    const nextName = payload.name || info.name

    // 如果修改了 path，更新子级 parent 链
    const pathChanged = nextPath !== info.path

    const menuSuperior = payload.menuSuperior && payload.menuSuperior.length
      ? payload.menuSuperior
      : await this.buildSuperior(payload.parentPath || info.meta?.parentPath)

    const meta = this.normalizeMeta({ ...info.meta, ...(payload.meta || {}) })
    meta.parentPath = payload.parentPath ?? meta.parentPath
    meta.isFirstLevel = menuSuperior.length === 0

    await this.models.updateOne(
      { _id },
      {
        path: nextPath,
        name: nextName,
        component: payload.component ?? info.component,
        menuSuperior,
        meta,
        redirect: payload.redirect ?? info.redirect,
        menuType: payload.btnPower ? 'button' : (payload.menuType || info.menuType),
        btnPower: payload.btnPower ?? info.btnPower,
        servicePath: payload.servicePath ?? info.servicePath,
        servicePathType: payload.servicePathType ?? info.servicePathType,
        routerName: payload.routerName ?? info.routerName,
        menuSort: payload.menuSort ?? info.menuSort,
        state: payload.state ?? info.state
      }
    )

    if (pathChanged) {
      await this.models.updateMany(
        { menuSuperior: info.path },
        { $set: { 'menuSuperior.$[elem]': nextPath } },
        { arrayFilters: [ { elem: info.path } ] }
      )
    }

    return this.models.findOne({ _id }).lean()
  }

  /**
   * 删除菜单（软删），包含其所有子级
   */
  async destroy(_id) {
    const info = await this.models.findOne({ _id, isDelete: false }).lean()
    if (!info) return null

    await this.models.updateMany(
      {
        $or: [
          { _id },
          { menuSuperior: info.path }
        ]
      },
      { isDelete: true }
    )
    return { deleted: true }
  }
}

module.exports = SysMenuService
