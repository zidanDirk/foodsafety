/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF7E33',
        secondary: '#4ECDC4',
        accent: '#FFBE0B',
        background: '#F9F7F3',
        text: '#2D3748',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      fontFamily: {
        sans: ['Comic Neue', 'cursive', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
