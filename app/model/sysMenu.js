'use strict'
module.exports = (app) => {
  const mongoose = app.mongoose
  const { Schema } = mongoose

  const SysMenuSchema = new Schema(
    {
      // 路由路径与名称
      path: { type: String, default: '', index: 1 },
      name: { type: String, default: '', index: 1 },
      component: { type: String, default: '' }, // 例如 /dashboard/console
      // 父级路径栈
      menuSuperior: [{ type: String }],

      // 前端需要的 meta 字段
      meta: {
        title: { type: String, default: '' },
        icon: { type: String, default: '' },
        isHide: { type: Boolean, default: false },
        isKeepAlive: { type: Boolean, default: false },
        keepAlive: { type: Boolean, default: false },
        isAffix: { type: Boolean, default: false },
        isIframe: { type: Boolean, default: false },
        showBadge: { type: Boolean, default: false },
        showTextBadge: { type: String, default: '' },
        isHideTab: { type: Boolean, default: false },
        link: { type: String, default: '' },
        authList: [{ title: String, authMark: String }],
        isFirstLevel: { type: Boolean, default: false },
        roles: [String],
        fixedTab: { type: Boolean, default: false },
        activePath: { type: String, default: '' },
        isFullPage: { type: Boolean, default: false },
        isAuthButton: { type: Boolean, default: false },
        authMark: { type: String, default: '' },
        parentPath: { type: String, default: '' }
      },

      redirect: { type: String, default: '' },
      menuType: { type: String, default: 'menu', index: 1 }, // menu | button
      btnPower: { type: String, default: null },
      servicePath: { type: String, default: '', index: true },
      servicePathType: { type: String, default: 'GET', index: 1 },
      routerName: { type: String, default: '' },
      menuSort: { type: Number, default: 0 },
      state: { type: Number, default: 1, index: 1 },
      createUserId: { type: Schema.ObjectId, default: null },
      isDelete: { type: Boolean, default: false }
    },
    {
      timestamps: true,
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    }
  )

  return mongoose.model('SysMenu', SysMenuSchema, 'SysMenu')
}
