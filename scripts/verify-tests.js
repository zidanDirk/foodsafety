// 测试运行脚本 - 验证测试环境配置是否正确
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

async function runTest() {
  try {
    console.log('🔍 验证测试环境配置...')
    
    // 检查是否安装了jest
    await execPromise('npx jest --version')
    console.log('✅ Jest已正确安装')
    
    // 检查测试文件是否存在
    const { stdout } = await execPromise('ls __tests__/api/*.test.ts | wc -l')
    const testFileCount = parseInt(stdout.trim())
    
    if (testFileCount > 0) {
      console.log(`✅ 已创建 ${testFileCount} 个API测试文件`)
    } else {
      console.log('❌ 未找到API测试文件')
      process.exit(1)
    }
    
    // 运行一个简单的测试来验证配置
    console.log('🧪 运行示例测试...')
    await execPromise('npx jest __tests__/api/health.test.ts --passWithNoTests')
    console.log('✅ 测试环境配置正确')
    
    console.log('\n🚀 可以使用以下命令运行测试:')
    console.log('   npm test              # 运行所有测试')
    console.log('   npm run test:watch    # 监听模式运行测试')
    console.log('   npm run test:coverage # 运行测试并生成覆盖率报告')
    
  } catch (error) {
    console.error('❌ 测试环境配置验证失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
runTest().catch(console.error)