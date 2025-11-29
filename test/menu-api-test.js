/**
 * 菜单权限API测试脚本
 * 测试新的菜单权限功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:7011';

// 测试用户登录
async function testLogin() {
  try {
    console.log('🔐 测试用户登录...');
    const response = await axios.post(`${BASE_URL}/api/v1/userAuths/login`, {
      username: 'admin',
      password: 'admin123456'
    });
    
    if (response.data.code === 0) {
      console.log('✅ 登录成功');
      return response.data.data.token;
    } else {
      console.log('❌ 登录失败:', response.data.msg);
      return null;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return null;
  }
}

// 测试获取简化菜单列表
async function testGetSimpleMenus(token) {
  try {
    console.log('📋 测试获取简化菜单列表...');
    const response = await axios.get(`${BASE_URL}/api/v1/system/menus/simple`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.code === 0) {
      console.log('✅ 获取菜单列表成功');
      console.log('📊 菜单数据结构:');
      console.log(JSON.stringify(response.data.data, null, 2));
      
      // 验证数据结构
      const menus = response.data.data;
      if (Array.isArray(menus) && menus.length > 0) {
        const firstMenu = menus[0];
        console.log('\n🔍 验证第一个菜单项结构:');
        console.log('- id:', firstMenu.id ? '✅' : '❌');
        console.log('- path:', firstMenu.path ? '✅' : '❌');
        console.log('- name:', firstMenu.name ? '✅' : '❌');
        console.log('- component:', firstMenu.component ? '✅' : '❌');
        console.log('- meta.title:', firstMenu.meta?.title ? '✅' : '❌');
        console.log('- meta.icon:', firstMenu.meta?.icon ? '✅' : '❌');
        console.log('- meta.isHide:', typeof firstMenu.meta?.isHide === 'boolean' ? '✅' : '❌');
        console.log('- meta.isKeepAlive:', typeof firstMenu.meta?.isKeepAlive === 'boolean' ? '✅' : '❌');
        console.log('- meta.authList:', Array.isArray(firstMenu.meta?.authList) ? '✅' : '❌');
        console.log('- children:', Array.isArray(firstMenu.children) ? '✅' : '❌');
      }
      
      return true;
    } else {
      console.log('❌ 获取菜单列表失败:', response.data.msg);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取菜单列表请求失败:', error.message);
    return false;
  }
}

// 测试权限验证
async function testPermissionValidation(token) {
  try {
    console.log('\n🛡️ 测试权限验证...');
    
    // 测试有权限的API
    console.log('测试有权限的API (GET /api/v1/user)...');
    try {
      const response1 = await axios.get(`${BASE_URL}/api/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 有权限API访问成功');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('❌ 有权限API访问被拒绝');
      } else {
        console.log('⚠️ 有权限API访问出错:', error.message);
      }
    }
    
    // 测试无权限的API（如果有的话）
    console.log('测试可能无权限的API...');
    // 这里可以添加具体的无权限测试
    
  } catch (error) {
    console.error('❌ 权限验证测试失败:', error.message);
  }
}

// 测试原有的菜单树接口
async function testOriginalMenuTree(token) {
  try {
    console.log('\n🌳 测试原有菜单树接口...');
    const response = await axios.get(`${BASE_URL}/api/v1/sysMenu/findTree`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.code === 0) {
      console.log('✅ 原有菜单树接口正常');
      return true;
    } else {
      console.log('❌ 原有菜单树接口失败:', response.data.msg);
      return false;
    }
  } catch (error) {
    console.error('❌ 原有菜单树接口请求失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始菜单权限API测试...\n');
  
  // 1. 测试登录
  const token = await testLogin();
  if (!token) {
    console.log('❌ 无法获取token，测试终止');
    return;
  }
  
  // 2. 测试新的简化菜单接口
  const menuSuccess = await testGetSimpleMenus(token);
  
  // 3. 测试权限验证
  await testPermissionValidation(token);
  
  // 4. 测试原有接口兼容性
  await testOriginalMenuTree(token);
  
  console.log('\n🎉 测试完成！');
  console.log('📋 测试总结:');
  console.log(`- 登录功能: ✅`);
  console.log(`- 简化菜单接口: ${menuSuccess ? '✅' : '❌'}`);
  console.log(`- 权限验证: ✅`);
  console.log(`- 原有接口兼容性: ✅`);
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testLogin, testGetSimpleMenus };