'use strict';
module.exports = (options, app) => {
  return async function(ctx, next) {
    // 拿到不需要验证的token的路由
    const routerAuth = app.config.routerAuth;
    // 获取当前路由
    const url = ctx.url;
    if (url !== '/api/v1/smsmessage/getViewCount') {

      console.log('%c Line:8 🍡 url', 'color:#33a5ff', url);
    }

    const method = ctx.method;
    let flag = false;
    for (let index = 0; index < routerAuth.length; index++) {
      const element = routerAuth[index];
      if (url.indexOf(element.url) !== -1) {
        if (element.method === method) {
          flag = true;
        }
      }
    }

    const token = ctx.headers.authorization ? ctx.headers.authorization : '';
    // flag = true;
    console.log('%c Line:22 🍩 token', 'color:#2eafb0', token);
    if (token) {
      flag = false;
    }

    if (url === '/') {
      flag = true;
    }

    if (flag) {
      await next();
    } else {
      if (!token) {
        ctx.status = 401;
        ctx.body = {
          code: -1,
          msg: '缺少token',
          data: null,
        };
        return;
      }
      try {
        const decode = await app.jwt.verify(token, app.config.jwt.secret);

        if (!decode.id) {
          this.ctx.throw(200, ctx.app.httpCodeHash[400005]);
        }
        // 查询redis Token时效情况
        ctx.state.user = decode;


        // 权限验证逻辑
        const userInfo = await ctx.service.api.v1.user.show(decode.id);

        // 超级管理员直接放行（支持多种判断方式）
        if (userInfo.username === 'sysAdmin' || userInfo.username === 'admin' || userInfo.isSystem) {
          await next();
          return;
        }

        // 检查用户是否拥有超级管理员角色
        if (userInfo.userRoleIds && userInfo.userRoleIds.length > 0) {
          const { list: userRoleArr } = await ctx.service.api.v1.userRole.index({
            _id: { $in: userInfo.userRoleIds },
            pageSize: 99999
          }, { otherPayloadArr: [] });

          const hasSuperAdminRole = userRoleArr.some(role =>
            role.name === '超级管理员' && role.isSystem === true
          );

          if (hasSuperAdminRole) {
            await next();
            return;
          }
        }

        // 获取用户的所有菜单权限（包括按钮权限）
        let menuIdArr = [];
        const { list: userRoleArr } = await ctx.service.api.v1.userRole.index({
          _id: { $in: userInfo.userRoleIds || [] },
          pageSize: 99999
        }, { otherPayloadArr: [] });

        for (const userRole of userRoleArr) {
          menuIdArr = menuIdArr.concat(userRole.sysMenuIds || []);
        }

        // 获取用户可访问的菜单和按钮权限
        const userMenus = await ctx.model.SysMenu.find({
          _id: { $in: menuIdArr },
          isDelete: false
        }).lean();

        // 检查API访问权限
        let hasPermission = false;

        // 1. 检查是否有直接匹配的API权限
        for (const menu of userMenus) {
          if (menu.servicePath && menu.servicePathType) {
            // 支持通配符匹配
            const menuPath = menu.servicePath.replace(/\*/g, '.*');
            const regex = new RegExp(`^${menuPath}$`);
            if (regex.test(url) && menu.servicePathType.toUpperCase() === method.toUpperCase()) {
              hasPermission = true;
              console.log(`✅ 权限匹配成功: ${menu.servicePath} ${menu.servicePathType} -> ${url} ${method}`);
              break;
            }
          }
        }

        // 2. 如果没有直接匹配，检查按钮权限
        if (!hasPermission) {
          const buttonMenus = userMenus.filter(menu => menu.menuType === 'button' && menu.btnPower);
          for (const btnMenu of buttonMenus) {
            // 按钮权限格式：'add:user', 'edit:user' 等
            const [action, resource] = btnMenu.btnPower.split(':');
            if (resource) {
              // 构造API路径模式进行匹配
              const apiPattern = new RegExp(`^/api/v1/${resource}(/.*)?$`);
              if (apiPattern.test(url)) {
                hasPermission = true;
                console.log(`✅ 按钮权限匹配成功: ${btnMenu.btnPower} -> ${url} ${method}`);
                break;
              }
            }
          }
        }

        // 3. 如果还是没有权限，检查是否为公开API或基础CRUD操作
        if (!hasPermission) {
          // 检查是否为标准的RESTful API操作
          const restfulPatterns = [
            /^\/api\/v1\/[a-zA-Z]+$/,  // GET /api/v1/users
            /^\/api\/v1\/[a-zA-Z]+\/[a-f0-9]{24}$/,  // GET /api/v1/users/123
            /^\/api\/v1\/[a-zA-Z]+\/[a-f0-9]{24}\/[a-zA-Z]+$/  // GET /api/v1/users/123/info
          ];

          for (const pattern of restfulPatterns) {
            if (pattern.test(url) && method === 'GET') {
              // 对于GET请求，如果有查看该资源的权限，则允许访问
              const resourceName = url.split('/')[3]; // 提取资源名
              const hasViewPermission = userMenus.some(menu =>
                menu.btnPower && menu.btnPower.includes(`view:${resourceName}`)
              );
              if (hasViewPermission) {
                hasPermission = true;
                console.log(`✅ RESTful权限匹配成功: view:${resourceName} -> ${url} ${method}`);
                break;
              }
            }
          }
        }

        // 4. 最后检查：如果是用户信息相关API，允许访问
        if (!hasPermission && (url.includes('/user/info') || url.includes('/userInfo'))) {
          hasPermission = true;
          console.log(`✅ 用户信息API允许访问: ${url} ${method}`);
        }

        // 调试信息
        if (!hasPermission) {
          console.log(`❌ 权限验证失败: ${url} ${method}`);
          console.log(`用户菜单数量: ${userMenus.length}`);
          console.log(`用户角色: ${userRoleArr.map(r => r.name).join(', ')}`);
        }

        // 2. 如果没有直接匹配，检查按钮权限
        if (!hasPermission) {
          const buttonMenus = userMenus.filter(menu => menu.menuType === 'button' && menu.btnPower);
          for (const btnMenu of buttonMenus) {
            // 按钮权限格式：'add:user', 'edit:user' 等
            const [action, resource] = btnMenu.btnPower.split(':');
            if (resource) {
              // 构造API路径模式进行匹配
              const apiPattern = new RegExp(`/${resource}(/.*)?$`);
              if (apiPattern.test(url)) {
                hasPermission = true;
                break;
              }
            }
          }
        }

        // 3. 如果还是没有权限，检查是否为公开API或基础CRUD操作
        if (!hasPermission) {
          // 检查是否为标准的RESTful API操作
          const restfulPatterns = [
            /^\/api\/v1\/[a-zA-Z]+$/,  // GET /api/v1/users
            /^\/api\/v1\/[a-zA-Z]+\/[a-f0-9]{24}$/,  // GET /api/v1/users/123
            /^\/api\/v1\/[a-zA-Z]+\/[a-f0-9]{24}\/[a-zA-Z]+$/  // GET /api/v1/users/123/info
          ];

          for (const pattern of restfulPatterns) {
            if (pattern.test(url) && method === 'GET') {
              // 对于GET请求，如果有查看该资源的权限，则允许访问
              const resourceName = url.split('/')[3]; // 提取资源名
              const hasViewPermission = userMenus.some(menu =>
                menu.btnPower && menu.btnPower.includes(`view:${resourceName}`)
              );
              if (hasViewPermission) {
                hasPermission = true;
                break;
              }
            }
          }
        }

        if (!hasPermission) {
          ctx.status = 403;
          ctx.body = {
            code: '100010',
            data: {},
            msg: '暂无权限访问',
          };
          return;
        }

        // 增加记录
        // ctx.service.api.v1.schoolLog.sendLog(ctx.state.user.id, method, url);

        await next();
      } catch (err) {
        ctx.status = 401;
        ctx.body = {
          message: 'token失效或解析错误',
          data: null,
        };

      }
    }
  };
};
