/**
 * 简单权限测试脚本
 * 使用Node内置http模块测试权限
 */

const http = require('http');

const BASE_URL = 'localhost:7011';

function makeRequest(method, path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 7011,
      path: path,
      method: method,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ username: 'admin', password: 'admin123456' }));
    }
    req.end();
  });
}

async function testAdminPermissions() {
  console.log('🚀 开始测试超级管理员权限...\n');

  try {
    // 1. 登录获取token
    console.log('🔐 登录获取token...');
    const loginResponse = await makeRequest('POST', '/api/v1/userAuths/login');

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
      { method: 'GET', url: '/api/v1/system/menus/simple', desc: '简化菜单列表' },
      { method: 'GET', url: '/api/v1/userInfo', desc: '用户详细信息' }
    ];

    let successCount = 0;
    let failCount = 0;

    for (const api of testApis) {
      try {
        console.log(`📡 测试: ${api.desc} (${api.method} ${api.url})`);
        
        const response = await makeRequest(api.method, api.url, token);

        if (response.statusCode === 200 && response.data.code === 0) {
          console.log(`✅ ${api.desc}: 成功`);
          successCount++;
        } else if (response.statusCode === 403) {
          console.log(`❌ ${api.desc}: 权限被拒绝`);
          failCount++;
        } else {
          console.log(`❌ ${api.desc}: 失败 (${response.statusCode}) - ${response.data.msg || response.data}`);
          failCount++;
        }
      } catch (error) {
        console.log(`⚠️ ${api.desc}: 请求错误 - ${error.message}`);
        failCount++;
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