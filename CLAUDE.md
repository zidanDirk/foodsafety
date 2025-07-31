# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a food safety detection system built with Next.js 14, TypeScript, and Tailwind CSS. The application allows users to upload food product images for OCR (Optical Character Recognition) processing and AI-based health analysis of ingredients.

## Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with @vercel/postgres
- **Deployment**: Netlify

## Architecture Overview

The application follows a layered architecture:

1. **Frontend**: Next.js pages and components for the user interface
2. **API Layer**: Next.js API routes handling file uploads and task management
3. **Business Logic**: TaskProcessor coordinating OCR and AI analysis workflows
4. **Data Layer**: Dual storage system with PostgreSQL database and memory fallback
5. **External Services**: Integration with OCR and AI analysis services

### Core Components

1. **Task Management System** (`lib/task-manager.ts`):
   - Orchestrates the complete processing workflow from image upload to AI analysis
   - Implements a dual storage strategy (database with memory fallback)
   - Handles task lifecycle: pending → processing → completed/failed
   - Provides real-time updates via WebSocket connections

2. **Storage Layer**:
   - Database (`lib/database.ts`): PostgreSQL implementation with connection pooling
   - Memory Storage (`lib/memory-storage.ts`): In-memory fallback for when database is unavailable

3. **Processing Pipeline**:
   - OCR Service (`lib/ocr-service.ts`): Extracts text and ingredients from images
   - AI Analysis Service (`lib/ai-analysis-service.ts`): Analyzes ingredients for health insights

## Common Development Commands

### Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Build and Deployment
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Testing

Tests are written with Jest and located in the `__tests__` directory. The test setup includes:
- API route tests in `__tests__/api/`
- Integration tests in `__tests__/integration/`
- Test utilities in `__tests__/test-utils.ts`

Run specific tests:
```bash
# Run a single test file
pnpm jest __tests__/api/upload.test.ts

# Run tests matching a pattern
pnpm jest -t "upload"
```

## Key Implementation Details

1. **Dual Storage Strategy**: The application automatically falls back to memory storage if the PostgreSQL database is unavailable, ensuring continued operation in degraded conditions.

2. **Asynchronous Processing**: File processing is performed asynchronously to avoid blocking API responses, with WebSocket updates for real-time progress tracking.

3. **Memory Management**: Large file uploads are processed in chunks to prevent memory overflow, especially important for the Netlify deployment environment.

4. **Error Handling**: Comprehensive error handling with detailed error messages propagated to the frontend.

5. **Environment Configuration**: The application supports both POSTGRES_URL and DATABASE_URL environment variables for database configuration.

## Database Schema

The tasks table contains the following key fields:
- id: Task identifier
- status: Processing status (pending, processing, completed, failed)
- progress: Completion percentage
- processing_step: Current processing stage
- file_info: JSON metadata about the uploaded file
- ocr_result: JSON results from OCR processing
- ai_result: JSON results from AI analysis
- error_message: Error details if processing fails
- Timestamps for creation, updates, and completion

## Netlify Deployment Considerations

- Maximum file upload size is 5MB
- Response time limit is 10 seconds for API functions
- Static assets are cached with immutable headers