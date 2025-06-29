import Link from 'next/link';
import Button from '../../src/components/Button'; // 导入Button组件

export default function About() {
  const technologies = [
    { name: 'React', icon: '⚛️' },
    { name: 'Next.js', icon: '🚀' },
    { name: 'Redux Toolkit', icon: '📦' },
    { name: 'Tailwind CSS', icon: '🎨' },
    { name: 'SCSS', icon: '💅' },
    { name: 'TypeScript', icon: '✍️' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-8 px-4">
      <h1 className="text-5xl font-bold text-primary mb-6 text-center">
        关于我们 🌟
      </h1>
      <p className="text-xl text-text mb-8 text-center max-w-prose">
        我们是致力于提升食品安全的小团队，这个项目是我们利用现代Web技术构建的示例应用。
      </p>
      
      <h2 className="text-3xl font-bold text-secondary mb-6">我们的技术栈 🛠️</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {technologies.map((tech) => (
          <div 
            key={tech.name} 
            className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-200"
          >
            <span className="text-5xl mb-3">{tech.icon}</span>
            <p className="text-xl font-semibold text-text">{tech.name}</p>
          </div>
        ))}
      </div>

      <Button variant="primary" href="/">
        🏠 返回首页
      </Button>
    </div>
  );
}
