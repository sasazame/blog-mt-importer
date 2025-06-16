# Blog MT Importer

A Node.js/NestJS application for importing MovableType format blog backups into PostgreSQL database.

## Features

- Import MT format blog backups
- Store blog posts in PostgreSQL
- RESTful API for blog management
- Built with NestJS and TypeScript
- CLI tool for easy import

## Prerequisites

- Node.js (v20 or higher recommended)
- PostgreSQL
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and update the database connection settings:

```bash
cp .env.example .env
```

## Usage

### Importing MT Format Files

#### Using the import script (recommended):

```bash
# Linux/Mac
./import-mt.sh /path/to/your/mt-file.txt

# Windows
import-mt.bat C:\path\to\your\mt-file.txt
```

#### Using npm commands directly:

```bash
# Import MT file
npm run cli:dev import /path/to/your/mt-file.txt
```

### Starting the API Server

```bash
# Using the start script
./start-server.sh

# Or using npm commands
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

### API Endpoints

- `GET /api/blog-posts` - Get all blog posts
- `GET /api/blog-posts/:id` - Get a specific blog post
- `POST /api/blog-posts` - Create a new blog post
- `PUT /api/blog-posts/:id` - Update a blog post
- `DELETE /api/blog-posts/:id` - Delete a blog post

## Testing

A sample MT format file is provided in `sample-data/sample-mt.txt` for testing:

```bash
./import-mt.sh sample-data/sample-mt.txt
```

## Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Format code
npm run format

# Lint
npm run lint

# Tests
npm run test
npm run test:watch
npm run test:cov
```

## Documentation

- [API Documentation](./docs/API.md) - REST API endpoints and usage
- [Architecture](./docs/ARCHITECTURE.md) - System design and structure
- [Roadmap](./ROADMAP.md) - Future features and implementation plans
- [Contributing](./docs/CONTRIBUTING.md) - Development guidelines and setup

## Next Features (Planned)

### 1. Markdown Export
Export blog posts from database to Markdown format with YAML front matter.

### 2. Article Recommendations
- Random article picker
- Related article suggestions
- Embeddable article cards with iframe support

See [ROADMAP.md](./ROADMAP.md) for detailed implementation plans.