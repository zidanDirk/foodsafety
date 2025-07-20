import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← 返回首页
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="text-3xl font-bold text-center mb-8">关于食品安全检测系统</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">系统简介</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  食品安全检测系统是一个基于人工智能技术的创新平台，旨在通过图像识别和深度学习算法，
                  快速、准确地检测食品的安全状况。我们的系统能够识别食品中的潜在安全隐患，
                  为消费者和食品行业提供可靠的安全保障。
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">核心功能</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">智能图像识别</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          采用先进的计算机视觉技术，精确识别食品外观异常
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">实时检测分析</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          秒级响应，实时获取检测结果和安全评估
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">详细报告生成</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          提供全面的检测报告和专业建议
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">多格式支持</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          支持多种图片格式，适应不同使用场景
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">技术特点</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>基于深度学习的图像识别算法</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>云端部署，高可用性保障</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>响应式设计，支持多设备访问</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>数据安全加密，保护用户隐私</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">使用说明</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">上传图片</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        点击&ldquo;开始检测&rdquo;按钮，选择要检测的食品图片（支持JPG、PNG、GIF格式，最大8MB）
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">AI分析</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        系统自动对上传的图片进行AI分析，识别潜在的食品安全问题
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">查看结果</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        获取详细的检测报告，包括安全评级、问题描述和改进建议
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="text-center pt-8">
                <Link href="/detection" className="btn-primary text-lg px-8 py-3">
                  立即开始检测
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
