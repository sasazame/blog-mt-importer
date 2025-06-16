# Blog MT Importer - Roadmap

## Next Implementation Steps

### 1. Markdown Export Functionality

DBに保存された記事をMarkdown形式でエクスポートする機能を追加します。

#### Features to implement:
- **Export single post**: 指定したIDの記事をMarkdown形式でエクスポート
- **Export all posts**: 全記事を個別のMarkdownファイルとしてエクスポート
- **Batch export**: 複数記事を一つのMarkdownファイルにまとめてエクスポート
- **Front matter support**: YAMLフロントマターでメタデータを含める

#### Technical Implementation:
```typescript
// Export Service Structure
class MarkdownExportService {
  async exportSinglePost(id: number): Promise<string>
  async exportAllPosts(format: 'individual' | 'batch'): Promise<void>
  async exportByCategory(category: string): Promise<void>
  async exportByDateRange(startDate: Date, endDate: Date): Promise<void>
}
```

#### CLI Commands:
```bash
# Single post export
npm run cli:dev export --post-id 1 --output ./exports/

# All posts export (individual files)
npm run cli:dev export --all --format individual --output ./exports/

# Category-based export
npm run cli:dev export --category "料理" --output ./exports/

# Date range export
npm run cli:dev export --start-date 2025-01-01 --end-date 2025-12-31 --output ./exports/
```

#### Output Format Example:
```markdown
---
title: "自分で買ったことない野菜を買って料理してみる　ししとう編"
author: "sasazame"
date: "2025-06-16T12:00:00.000Z"
category: "料理"
basename: "2025/06/16/120000"
status: "Publish"
image: "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20250615/20250615175935.png"
---

# 自分で買ったことない野菜を買って料理してみる　ししとう編

[Body content in markdown format...]

<!-- Extended Body -->
[Extended body content in markdown format...]
```

#### API Endpoints:
- `GET /api/blog-posts/:id/export/markdown` - Single post markdown export
- `GET /api/export/markdown?category=xxx&start_date=xxx&end_date=xxx` - Filtered export

---

### 2. Random Article Recommendation & Card Generation

ランダムな記事の表示や、記事カード（iframe対応）の生成機能を追加します。

#### Features to implement:
- **Random article picker**: ランダムに記事を選択
- **Article card generator**: 記事の概要カードをHTML/iframe形式で生成
- **Recommendation engine**: カテゴリベースやタグベースの関連記事推薦
- **Embeddable widgets**: 外部サイトに埋め込み可能なiframe形式のカード

#### Technical Implementation:
```typescript
// Recommendation Service Structure
class RecommendationService {
  async getRandomArticle(): Promise<BlogPost>
  async getRandomArticlesByCategory(category: string, count: number): Promise<BlogPost[]>
  async getRelatedArticles(postId: number, count: number): Promise<BlogPost[]>
  async generateArticleCard(postId: number, style: CardStyle): Promise<string>
}

// Card Style Options
interface CardStyle {
  theme: 'light' | 'dark' | 'minimal'
  size: 'small' | 'medium' | 'large'
  showImage: boolean
  showCategory: boolean
  showDate: boolean
  showExcerpt: boolean
}
```

#### API Endpoints:
```typescript
// Random article endpoints
GET /api/blog-posts/random                    // Get single random article
GET /api/blog-posts/random?count=3            // Get multiple random articles
GET /api/blog-posts/random?category=料理       // Get random articles by category

// Article card generation
GET /api/blog-posts/:id/card                  // Generate HTML card
GET /api/blog-posts/:id/card/iframe           // Generate iframe-embeddable card
GET /api/blog-posts/random/card               // Generate random article card

// Recommendation endpoints
GET /api/blog-posts/:id/related               // Get related articles
GET /api/recommendations?category=xxx         // Category-based recommendations
```

#### Card Output Examples:

**HTML Card Format:**
```html
<div class="blog-card blog-card--medium blog-card--light">
  <div class="blog-card__image">
    <img src="[image_url]" alt="[title]" />
  </div>
  <div class="blog-card__content">
    <span class="blog-card__category">[category]</span>
    <h3 class="blog-card__title">[title]</h3>
    <p class="blog-card__excerpt">[excerpt]</p>
    <time class="blog-card__date">[date]</time>
  </div>
</div>
```

**iframe Embeddable Format:**
```html
<iframe 
  src="http://localhost:3000/api/blog-posts/1/card/iframe?theme=light&size=medium"
  width="400" 
  height="200" 
  frameborder="0"
  scrolling="no">
</iframe>
```

#### CLI Commands:
```bash
# Generate article cards
npm run cli:dev generate-cards --output ./cards/ --theme light

# Generate random article widgets
npm run cli:dev generate-widget --type random --count 5 --output ./widgets/
```

---

### 3. Additional Features (Future Considerations)

#### 3.1 Search & Filter Enhancement
- Full-text search functionality
- Advanced filtering by multiple criteria
- Search result highlighting

#### 3.2 Analytics & Insights
- Article view tracking
- Popular articles dashboard
- Category distribution analysis

#### 3.3 Content Enhancement
- Automatic excerpt generation
- Tag extraction from content
- Related keyword suggestions

#### 3.4 Integration Features
- RSS feed generation
- Sitemap generation for SEO
- Social media sharing optimization

---

## Implementation Priority

1. **High Priority**: Markdown Export (Week 1-2)
   - Essential for content portability and backup
   - Enables integration with static site generators

2. **Medium Priority**: Random Article & Card Generation (Week 3-4)
   - Adds value for content discovery
   - Enables embedding capabilities

3. **Low Priority**: Additional Features (Future releases)
   - Nice-to-have features for enhanced functionality
   - Can be implemented based on user feedback

---

## Technical Requirements

### Dependencies to Add:
```json
{
  "turndown": "^7.1.2",          // HTML to Markdown conversion
  "cheerio": "^1.0.0-rc.12",     // HTML parsing for card generation
  "mustache": "^4.2.0"           // Template engine for card generation
}
```

### New Modules Structure:
```
src/modules/
├── export/
│   ├── services/markdown-export.service.ts
│   ├── controllers/export.controller.ts
│   └── export.module.ts
├── recommendation/
│   ├── services/recommendation.service.ts
│   ├── services/card-generator.service.ts
│   ├── controllers/recommendation.controller.ts
│   └── recommendation.module.ts
└── analytics/ (future)
    ├── services/analytics.service.ts
    └── analytics.module.ts
```

### Environment Variables:
```env
# Export settings
EXPORT_BASE_PATH=/exports
EXPORT_MAX_BATCH_SIZE=100

# Card generation
CARD_BASE_URL=http://localhost:3000
CARD_CACHE_TTL=3600

# Recommendation settings
RECOMMENDATION_CACHE_TTL=1800
MAX_RELATED_ARTICLES=10
```

This roadmap provides a clear direction for the next implementation phases while maintaining flexibility for future enhancements.