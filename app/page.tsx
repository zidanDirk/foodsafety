export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            食品安全检测系统
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            基于Next.js构建，部署在Netlify平台
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              欢迎使用
            </h3>
            <p className="text-gray-600">
              这是一个基础的Next.js项目，已配置好Netlify部署。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
