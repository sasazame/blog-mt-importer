# Contributing to Blog MT Importer

Thank you for your interest in contributing to Blog MT Importer! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js v20 or higher
- PostgreSQL 12 or higher
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/sasazame/blog-mt-importer.git
   cd blog-mt-importer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. **Start PostgreSQL and create database**
   ```sql
   CREATE DATABASE blog_mt_importer;
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Test import functionality
   ./import-mt.sh sample-data/sample-mt.txt
   ```

## Project Structure

Please familiarize yourself with the project structure outlined in [ARCHITECTURE.md](./ARCHITECTURE.md).

Key directories:
- `src/modules/` - Feature modules
- `src/common/` - Shared utilities
- `docs/` - Documentation
- `sample-data/` - Test data

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow the conventional commit format:
```
type(scope): description

Examples:
feat(export): add markdown export functionality
fix(parser): handle malformed MT date formats
docs(api): update endpoint documentation
refactor(blog): extract validation logic to helper
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, testable code
   - Follow the existing code style
   - Add/update tests as needed
   - Update documentation

3. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   npm run format
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a pull request on GitHub.

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### NestJS Patterns
- Follow NestJS module structure
- Use dependency injection
- Implement proper error handling
- Use DTOs for data validation

### Database
- Use TypeORM decorators consistently
- Write migrations for schema changes
- Index frequently queried columns
- Use transactions for complex operations

## Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

### Test Structure
- Place tests alongside source files (`*.spec.ts`)
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases

### Example Test
```typescript
describe('MTParser', () => {
  describe('parse', () => {
    it('should parse valid MT format content', () => {
      const content = 'AUTHOR: test\nTITLE: test\n...';
      const result = MTParser.parse(content);
      
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe('test');
    });
    
    it('should handle malformed content gracefully', () => {
      const content = 'invalid content';
      const result = MTParser.parse(content);
      
      expect(result).toHaveLength(0);
    });
  });
});
```

## Documentation

### Code Documentation
- Add JSDoc comments for public methods
- Document complex algorithms
- Include usage examples
- Update README for new features

### API Documentation
- Update `docs/API.md` for new endpoints
- Include request/response examples
- Document error responses
- Add authentication requirements (when implemented)

## Feature Implementation Guidelines

### Adding New Modules

1. **Create module structure**
   ```
   src/modules/your-module/
   ├── dto/
   ├── entities/
   ├── services/
   ├── controllers/
   └── your-module.module.ts
   ```

2. **Implement core components**
   - Service for business logic
   - Controller for HTTP endpoints
   - DTOs for data validation
   - Entity for database mapping (if needed)

3. **Add to main app module**
   ```typescript
   @Module({
     imports: [
       // ... existing modules
       YourModule,
     ],
   })
   export class AppModule {}
   ```

4. **Write tests**
   - Unit tests for services
   - Integration tests for controllers
   - E2E tests for critical paths

### Adding CLI Commands

1. **Extend CLI interface**
   ```typescript
   program
     .command('your-command <arg>')
     .description('Your command description')
     .action(async (arg: string) => {
       // Implementation
     });
   ```

2. **Add script shortcuts**
   ```json
   {
     "scripts": {
       "your-command": "tsx src/cli.ts your-command"
     }
   }
   ```

## Performance Guidelines

### Database Queries
- Use `select` to limit returned fields
- Implement pagination for large datasets
- Use proper indexing
- Avoid N+1 query problems

### Memory Management
- Stream large files instead of loading into memory
- Use generators for processing large datasets
- Clean up resources in finally blocks

### Caching
- Implement appropriate caching strategies
- Use Redis for distributed caching
- Cache expensive computations
- Implement cache invalidation

## Error Handling

### Service Layer
```typescript
async someMethod(): Promise<Result> {
  try {
    // Implementation
    return result;
  } catch (error) {
    this.logger.error('Error in someMethod', error);
    throw new ServiceException('Descriptive error message');
  }
}
```

### Controller Layer
```typescript
@Post()
async create(@Body() dto: CreateDto) {
  try {
    return await this.service.create(dto);
  } catch (error) {
    throw new BadRequestException('Invalid input data');
  }
}
```

## Security Best Practices

### Input Validation
- Validate all user inputs
- Use DTOs with class-validator
- Sanitize HTML content
- Prevent SQL injection with TypeORM

### File Handling
- Validate file types and sizes
- Prevent path traversal attacks
- Use temporary directories for processing
- Clean up uploaded files

## Release Process

### Version Bumping
```bash
npm version patch  # Bug fixes
npm version minor  # New features
npm version major  # Breaking changes
```

### Changelog
- Update CHANGELOG.md
- Follow Keep a Changelog format
- Include migration instructions for breaking changes

## Getting Help

- Check existing [issues](https://github.com/sasazame/blog-mt-importer/issues)
- Review [documentation](./README.md)
- Create new issue for bugs or feature requests
- Join discussions in issues and PRs

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing to Blog MT Importer!