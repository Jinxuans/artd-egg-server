/**
 * 用户信息数据修复验证脚本
 * 验证角色和按钮权限是否正确返回
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

async function testUserInfoFix() {
  console.log('🚀 开始测试用户信息数据修复...\n');

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

    // 2. 测试用户信息接口
    console.log('📡 测试: /api/v1/user/info');
    
    const response = await makeRequest('GET', '/api/v1/user/info', token);

    if (response.statusCode === 200 && response.data.code === 0) {
      console.log('✅ 接口调用成功');
      
      const userInfo = response.data.data;
      console.log('\n📊 返回的数据结构:');
      console.log(JSON.stringify(userInfo, null, 2));
      
      console.log('\n🔍 数据验证:');
      
      // 验证必要字段
      const validations = [
        { field: 'userId', expected: 'number', actual: typeof userInfo.userId, valid: typeof userInfo.userId === 'number' },
        { field: 'userName', expected: 'string', actual: typeof userInfo.userName, valid: typeof userInfo.userName === 'string' },
        { field: 'email', expected: 'string', actual: typeof userInfo.email, valid: typeof userInfo.email === 'string' },
        { field: 'avatar', expected: 'string', actual: typeof userInfo.avatar, valid: typeof userInfo.avatar === 'string' },
        { field: 'roles', expected: 'array', actual: Array.isArray(userInfo.roles) ? 'array' : typeof userInfo.roles, valid: Array.isArray(userInfo.roles) },
        { field: 'buttons', expected: 'array', actual: Array.isArray(userInfo.buttons) ? 'array' : typeof userInfo.buttons, valid: Array.isArray(userInfo.buttons) }
      ];
      
      let allValid = true;
      for (const validation of validations) {
        const status = validation.valid ? '✅' : '❌';
        console.log(`${status} ${validation.field}: 期望 ${validation.expected}, 实际 ${validation.actual}`);
        if (!validation.valid) {
          allValid = false;
        }
      }

      // 详细信息
      console.log('\n📋 详细信息:');
      console.log(`   用户ID: ${userInfo.userId}`);
      console.log(`   用户名: ${userInfo.userName}`);
      console.log(`   邮箱: ${userInfo.email}`);
      console.log(`   头像: ${userInfo.avatar || '无'}`);
      console.log(`   角色数量: ${userInfo.roles.length}`);
      if (userInfo.roles.length > 0) {
        console.log(`   角色列表: ${userInfo.roles.join(', ')}`);
      }
      console.log(`   按钮权限数量: ${userInfo.buttons.length}`);
      if (userInfo.buttons.length > 0) {
        console.log(`   按钮权限: ${userInfo.buttons.slice(0, 5).join(', ')}${userInfo.buttons.length > 5 ? '...' : ''}`);
      }

      if (allValid && userInfo.roles.length > 0) {
        console.log('\n🎉 数据格式验证通过！用户信息接口修复成功。');
      } else {
        console.log('\n⚠️ 数据格式验证失败，需要进一步检查。');
        if (userInfo.roles.length === 0) {
          console.log('💡 提示：角色数组为空，可能是用户角色分配问题');
        }
        if (userInfo.buttons.length === 0) {
          console.log('💡 提示：按钮权限为空，可能是权限配置问题');
        }
      }

    } else {
      console.log(`❌ 接口调用失败: ${response.statusCode} - ${response.data.msg || response.data}`);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
if (require.main === module) {
  testUserInfoFix();
}

module.exports = { testUserInfoFix };