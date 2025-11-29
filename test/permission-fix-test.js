/**
 * 权限修复验证脚本
 * 测试超级管理员权限是否正常工作
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:7011';

async function testAdminPermissions() {
  console.log('🚀 开始测试超级管理员权限...\n');

  try {
    // 1. 登录获取token
    console.log('🔐 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/userAuths/login`, {
      username: 'admin',
      password: 'admin123456'
    });

    if (loginResponse.data.code !== 0) {
      console.log('❌ 登录失败:', loginResponse.data.msg);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token\n');

    // 2. 测试各种API接口
    const testApis = [
      { method: 'GET', url: '/api/v1/user/info', desc: '用户信息' },
      { method: 'GET', url: '/api/v1/user', desc: '用户列表' },
      { method: 'GET', url: '/api/v1/userRole', desc: '角色列表' },
      { method: 'GET', url: '/api/v1/sysMenu', desc: '菜单列表' },
      { method: 'GET', url: '/api/v1/sysFile', desc: '文件列表' },
      { method: 'GET', url: '/api/v1/system/menus/simple', desc: '简化菜单列表' },
      { method: 'GET', url: '/api/v1/sysMenu/findTree', desc: '菜单树' },
      { method: 'GET', url: '/api/v1/userInfo', desc: '用户详细信息' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const api of testApis) {
      try {
        console.log(`📡 测试: ${api.desc} (${api.method} ${api.url})`);
        
        const response = await axios({
          method: api.method,
          url: `${BASE_URL}${api.url}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.code === 0) {
          console.log(`✅ ${api.desc}: 成功`);
          successCount++;
        } else {
          console.log(`❌ ${api.desc}: 失败 - ${response.data.msg}`);
          failCount++;
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log(`❌ ${api.desc}: 权限被拒绝`);
          failCount++;
        } else {
          console.log(`⚠️ ${api.desc}: 请求错误 - ${error.message}`);
          failCount++;
        }
      }
    }

    console.log('\n📊 测试结果统计:');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`📈 成功率: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);

    if (failCount === 0) {
      console.log('\n🎉 所有权限测试通过！超级管理员权限正常工作。');
    } else {
      console.log('\n⚠️ 部分权限测试失败，需要进一步检查。');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAdminPermissions();
}

module.exports = { testAdminPermissions };