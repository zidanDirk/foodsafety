import Link from 'next/link';

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">About Page</h1>
      <p className="text-xl mb-4">
        This is a sample React application built with:
      </p>
      <ul className="list-disc space-y-2 mb-8">
        <li>React</li>
        <li>Next.js</li>
        <li>Redux Toolkit</li>
        <li>Tailwind CSS</li>
        <li>SCSS</li>
        <li>TypeScript</li>
      </ul>
      <Link href="/" className="text-blue-500 hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
