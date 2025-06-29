# React Project with Modern Tech Stack

This is a modern React application built with the following technologies:

- React
- React Router
- Redux Toolkit
- Tailwind CSS
- SCSS
- TypeScript
- Vite
- pnpm

## Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v9 or higher)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd foodsafety

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

This will start the development server at `http://localhost:5173`.

### Building for Production

```bash
# Build the application
pnpm build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
# Preview the production build
pnpm preview
```

## Project Structure

```
foodsafety/
├── public/              # Static assets
├── src/
│   ├── assets/          # Project assets (images, fonts, etc.)
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── routes/          # React Router configuration
│   ├── store/           # Redux store setup
│   │   └── features/    # Redux slices
│   ├── App.scss         # App-specific styles
│   ├── App.tsx          # Main App component
│   ├── index.scss       # Global styles with Tailwind directives
│   └── main.tsx         # Entry point
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm preview` - Preview the production build
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode

## Features

- **Routing**: Uses React Router for navigation
- **State Management**: Uses Redux Toolkit for global state management
- **Styling**: Uses Tailwind CSS for utility-first styling and SCSS for custom styles
- **Type Safety**: Uses TypeScript for type checking
- **Fast Development**: Uses Vite for fast development and building
