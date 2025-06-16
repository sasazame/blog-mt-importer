# API Documentation

## Current API Endpoints

### Blog Posts

#### Get All Blog Posts
```http
GET /api/blog-posts
```

**Response:**
```json
[
  {
    "id": 1,
    "author": "sasazame",
    "title": "自分で買ったことない野菜を買って料理してみる　ししとう編",
    "basename": "2025/06/16/120000",
    "status": "Publish",
    "allowComments": true,
    "convertBreaks": false,
    "publishedAt": "2025-06-16T12:00:00.000Z",
    "category": "料理",
    "imageUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20250615/20250615175935.png",
    "body": "<p>記事本文...</p>",
    "extendedBody": "<p>拡張記事本文...</p>",
    "createdAt": "2025-06-16T12:00:00.000Z",
    "updatedAt": "2025-06-16T12:00:00.000Z"
  }
]
```

#### Get Single Blog Post
```http
GET /api/blog-posts/:id
```

**Response:**
```json
{
  "id": 1,
  "author": "sasazame",
  "title": "自分で買ったことない野菜を買って料理してみる　ししとう編",
  "basename": "2025/06/16/120000",
  "status": "Publish",
  "allowComments": true,
  "convertBreaks": false,
  "publishedAt": "2025-06-16T12:00:00.000Z",
  "category": "料理",
  "imageUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/s/sasazame/20250615/20250615175935.png",
  "body": "<p>記事本文...</p>",
  "extendedBody": "<p>拡張記事本文...</p>",
  "createdAt": "2025-06-16T12:00:00.000Z",
  "updatedAt": "2025-06-16T12:00:00.000Z"
}
```

#### Create Blog Post
```http
POST /api/blog-posts
Content-Type: application/json
```

**Request Body:**
```json
{
  "author": "sasazame",
  "title": "New Blog Post",
  "basename": "2025/06/16/130000",
  "status": "Publish",
  "allowComments": true,
  "convertBreaks": false,
  "publishedAt": "2025-06-16T13:00:00.000Z",
  "category": "テクノロジー",
  "imageUrl": "https://example.com/image.jpg",
  "body": "<p>記事本文</p>",
  "extendedBody": "<p>拡張記事本文</p>"
}
```

#### Update Blog Post
```http
PUT /api/blog-posts/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Blog Post Title",
  "body": "<p>更新された記事本文</p>"
}
```

#### Delete Blog Post
```http
DELETE /api/blog-posts/:id
```

**Response:** `204 No Content`

---

## Planned API Endpoints (Future Implementation)

### Export Endpoints

#### Export Single Post as Markdown
```http
GET /api/blog-posts/:id/export/markdown
```

#### Export Multiple Posts
```http
GET /api/export/markdown?category=料理&start_date=2025-01-01&end_date=2025-12-31
```

### Recommendation Endpoints

#### Get Random Article
```http
GET /api/blog-posts/random
GET /api/blog-posts/random?count=3
GET /api/blog-posts/random?category=料理
```

#### Get Related Articles
```http
GET /api/blog-posts/:id/related
GET /api/recommendations?category=料理
```

### Card Generation Endpoints

#### Generate Article Card
```http
GET /api/blog-posts/:id/card
GET /api/blog-posts/:id/card/iframe?theme=light&size=medium
GET /api/blog-posts/random/card
```

---

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Blog post not found",
  "error": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "author should not be empty"
  ],
  "error": "Bad Request"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Query Parameters

### Pagination (Future Implementation)
```http
GET /api/blog-posts?page=1&limit=10
```

### Filtering (Future Implementation)
```http
GET /api/blog-posts?category=料理&author=sasazame&status=Publish
```

### Sorting (Future Implementation)
```http
GET /api/blog-posts?sort=publishedAt&order=desc
```