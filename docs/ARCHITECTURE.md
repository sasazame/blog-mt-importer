# Architecture Documentation

## Project Structure

```
blog-mt-importer/
├── src/
│   ├── modules/
│   │   ├── blog/                    # Blog post management
│   │   │   ├── entities/
│   │   │   │   └── blog-post.entity.ts
│   │   │   ├── services/
│   │   │   │   └── blog.service.ts
│   │   │   ├── controllers/
│   │   │   │   └── blog.controller.ts
│   │   │   └── blog.module.ts
│   │   ├── mt-import/               # MT format import functionality
│   │   │   ├── dto/
│   │   │   │   └── mt-blog-post.dto.ts
│   │   │   ├── parsers/
│   │   │   │   └── mt-parser.ts
│   │   │   ├── services/
│   │   │   │   └── mt-import.service.ts
│   │   │   └── mt-import.module.ts
│   │   └── [future modules]/
│   │       ├── export/              # Markdown export functionality (planned)
│   │       ├── recommendation/      # Article recommendation (planned)
│   │       └── analytics/           # Analytics (planned)
│   ├── common/                      # Shared utilities and types
│   ├── config/                      # Configuration files
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts               # Root application module
│   └── cli.ts                      # CLI interface
├── sample-data/                     # Sample MT format files
├── docs/                           # Documentation
├── import-mt.sh                    # Unix import script
├── import-mt.bat                   # Windows import script
└── start-server.sh                 # Server startup script
```

## Core Components

### 1. Blog Module (`src/modules/blog/`)

**Purpose**: Manages blog post CRUD operations and database interactions.

#### BlogPost Entity
- Maps to `blog_posts` table in PostgreSQL
- Contains all metadata and content fields from MT format
- Uses TypeORM decorators for database mapping

#### BlogService
- Handles business logic for blog post operations
- Provides methods for CRUD operations
- Manages database transactions

#### BlogController
- Exposes REST API endpoints
- Handles HTTP request/response
- Validates input data

### 2. MT Import Module (`src/modules/mt-import/`)

**Purpose**: Handles parsing and importing of MovableType format files.

#### MTParser
- Static class for parsing MT format text
- Extracts metadata and content sections
- Converts MT date format to JavaScript Date objects

#### MTImportService
- Orchestrates the import process
- Reads files from filesystem
- Coordinates with BlogService for data persistence

#### MTBlogPost DTO
- Data Transfer Object for parsed MT data
- Type-safe interface for MT format structure

### 3. CLI Interface (`src/cli.ts`)

**Purpose**: Provides command-line interface for application operations.

**Commands:**
- `import <file>`: Import MT format file
- `server`: Start API server

**Features:**
- File path resolution
- Error handling and logging
- Application context management

## Database Schema

### blog_posts Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-incrementing primary key |
| author | VARCHAR | Article author name |
| title | VARCHAR | Article title |
| basename | VARCHAR | URL-friendly identifier |
| status | ENUM | 'Publish' or 'Draft' |
| allowComments | BOOLEAN | Comment permission flag |
| convertBreaks | BOOLEAN | Line break conversion flag |
| publishedAt | TIMESTAMP | Publication date and time |
| category | VARCHAR | Article category (nullable) |
| imageUrl | VARCHAR | Featured image URL (nullable) |
| body | TEXT | Main article content (nullable) |
| extendedBody | TEXT | Extended article content (nullable) |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Record last update time |

## Data Flow

### Import Process
```
MT File → MTParser → MTBlogPost DTO → MTImportService → BlogService → Database
```

1. **File Reading**: MTImportService reads the MT format file
2. **Parsing**: MTParser converts text to structured data
3. **Data Transfer**: Results mapped to MTBlogPost DTO
4. **Service Layer**: MTImportService coordinates the process
5. **Persistence**: BlogService saves data to database via TypeORM

### API Request Flow
```
HTTP Request → BlogController → BlogService → TypeORM → Database
```

1. **Route Handling**: NestJS routes request to BlogController
2. **Validation**: Request data validated by NestJS pipes
3. **Business Logic**: BlogController delegates to BlogService
4. **Data Access**: BlogService uses TypeORM repository
5. **Response**: Data returned through the same chain

## Technology Stack

### Backend Framework
- **NestJS**: Enterprise-grade Node.js framework
- **TypeScript**: Type-safe JavaScript development
- **TypeORM**: Object-Relational Mapping for database operations

### Database
- **PostgreSQL**: Primary database for blog posts
- **Database Features**:
  - Full-text search capabilities
  - JSONB support for metadata
  - Transaction support

### CLI & Utilities
- **Commander.js**: Command-line interface framework
- **fs/promises**: Asynchronous file system operations

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Nodemon**: Development auto-restart

## Design Patterns

### Module Pattern
- Each feature encapsulated in its own module
- Clear separation of concerns
- Dependency injection for loose coupling

### Repository Pattern
- TypeORM repositories abstract database operations
- Service layer provides business logic
- Controllers handle HTTP concerns only

### Factory Pattern
- MTParser creates DTOs from raw text
- CLI creates application contexts

### Observer Pattern (Future)
- Event-driven architecture for imports
- Analytics tracking for article operations

## Configuration Management

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=blog_mt_importer

# Application Configuration
NODE_ENV=development
PORT=3000
```

### TypeORM Configuration
- Auto-loading of entities
- Synchronization in development
- Migration support for production

## Error Handling

### Import Process
- File validation before processing
- Graceful handling of malformed MT data
- Transaction rollback on errors
- Detailed logging for debugging

### API Layer
- Global exception filters
- Standardized error responses
- Validation pipes for input data
- HTTP status code mapping

## Security Considerations

### Input Validation
- All user inputs validated at controller level
- SQL injection prevention via TypeORM
- File path traversal prevention

### Data Sanitization
- HTML content preserved but validated
- XSS prevention for user-generated content

### Environment Security
- Sensitive data in environment variables
- Database credentials not in source code

## Performance Considerations

### Database
- Indexed columns for common queries
- Pagination support for large datasets
- Connection pooling via TypeORM

### Caching Strategy (Planned)
- Redis for API response caching
- File system caching for exports
- In-memory caching for recommendations

### File Processing
- Streaming for large MT files
- Batch processing for multiple imports
- Memory-efficient parsing

## Scalability Plan

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- Load balancer compatibility

### Vertical Scaling
- Efficient memory usage
- Optimized database queries
- Background job processing

### Microservices Migration (Future)
- Export service separation
- Recommendation service isolation
- Analytics service independence