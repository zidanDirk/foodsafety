import Link from 'next/link';
import '../src/App.scss';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background font-sans">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-primary text-white shadow-lg rounded-b-3xl">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-wide">🍏 食品安全检测系统</h1>
                <nav>
                  <ul className="flex space-x-8">
                    <li>
                      <Link href="/" className="hover:text-accent transition-colors text-lg">首页</Link>
                    </li>
                    <li>
                      <Link href="/about" className="hover:text-accent transition-colors text-lg">关于</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            <footer className="bg-secondary text-white py-6 rounded-t-3xl">
              <div className="container mx-auto px-4 text-center">
                <p className="text-md">
                  🍎 &copy; {new Date().getFullYear()} 食品安全检测系统 - 让食品更安全
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
