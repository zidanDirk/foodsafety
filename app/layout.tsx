import Link from 'next/link';
import '../src/App.scss'; // Assuming App.scss contains global styles
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white shadow-md">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold">食品安全管理系统</h1>
                <nav>
                  <ul className="flex space-x-6">
                    <li>
                      <Link href="/" className="hover:text-blue-200 transition-colors">首页</Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-blue-200 transition-colors">关于</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="bg-gray-800 text-white py-6">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm">&copy; {new Date().getFullYear()} 食品安全管理系统 - 版权所有</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
