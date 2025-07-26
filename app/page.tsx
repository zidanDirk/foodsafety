export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          食品安全检测系统
        </h1>
        <p className="text-gray-600 mb-8">
          通过AI技术智能识别食品配料，分析健康度
        </p>
        <a 
          href="/detection" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          开始检测
        </a>
      </div>
    </div>
  )
}
