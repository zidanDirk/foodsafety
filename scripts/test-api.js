// 简单的 API 测试脚本
const baseUrl = process.env.TEST_URL || 'http://localhost:3000'

async function testHealthAPI() {
  try {
    console.log('🔍 测试健康检查 API...')
    const response = await fetch(`${baseUrl}/api/health`)
    const data = await response.json()
    
    console.log('✅ 健康检查响应:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message)
    return null
  }
}

async function testInitDB() {
  try {
    console.log('🔍 测试数据库初始化 API...')
    const response = await fetch(`${baseUrl}/api/init-db`, {
      method: 'POST'
    })
    const data = await response.json()
    
    console.log('✅ 数据库初始化响应:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message)
    return null
  }
}

async function testUploadAPI() {
  try {
    console.log('🔍 测试上传 API (模拟)...')
    
    // 创建一个简单的测试文件
    const formData = new FormData()
    const blob = new Blob(['test image data'], { type: 'image/jpeg' })
    formData.append('image', blob, 'test.jpg')
    
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    console.log('✅ 上传 API 响应:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('❌ 上传 API 失败:', error.message)
    return null
  }
}

async function runTests() {
  console.log(`🚀 开始测试 API (${baseUrl})...\n`)
  
  // 测试健康检查
  const health = await testHealthAPI()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 测试数据库初始化
  const initResult = await testInitDB()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 测试上传 API
  const uploadResult = await testUploadAPI()
  console.log('\n' + '='.repeat(50) + '\n')
  
  // 总结
  console.log('📊 测试总结:')
  console.log(`- 健康检查: ${health ? '✅ 通过' : '❌ 失败'}`)
  console.log(`- 数据库初始化: ${initResult ? '✅ 通过' : '❌ 失败'}`)
  console.log(`- 上传 API: ${uploadResult ? '✅ 通过' : '❌ 失败'}`)
  
  if (health && health.services) {
    console.log('\n🔧 服务配置状态:')
    console.log(`- 数据库: ${health.services.database ? '✅ 已配置' : '❌ 未配置'}`)
    console.log(`- OCR: ${health.services.ocr ? '✅ 已配置' : '❌ 未配置'}`)
    console.log(`- AI: ${health.services.ai ? '✅ 已配置' : '❌ 未配置'}`)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testHealthAPI, testInitDB, testUploadAPI, runTests }
