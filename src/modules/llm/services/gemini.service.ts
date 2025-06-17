import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SummaryResponse {
  summary: string;
  recommendation_stars: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string | undefined;
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    } else {
      this.logger.log(`Gemini API key configured (${this.apiKey.substring(0, 10)}...)`);
    }
  }

  async generateSummaryAndRating(
    title: string,
    content: string,
    category: string,
    date: string,
  ): Promise<SummaryResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = this.buildPrompt(title, content, category, date);

    // Try different model versions
    const modelUrls = [
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    ];

    for (const modelUrl of modelUrls) {
      try {
        this.logger.debug(`Trying model: ${modelUrl}`);
        
        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        };

        this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

        const response = await fetch(`${modelUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        this.logger.debug(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          
          // Handle rate limit errors (429)
          if (response.status === 429) {
            this.logger.error(`Rate limit exceeded for model ${modelUrl}: ${errorText}`);
            
            // Try to extract retry delay from response
            try {
              const errorData = JSON.parse(errorText);
              const retryDelay = errorData.error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
              if (retryDelay) {
                this.logger.error(`Suggested retry delay: ${retryDelay}`);
              }
            } catch (e) {
              // Ignore parsing errors
            }
            
            throw new Error(`Rate limit exceeded. Please wait before retrying. Details: ${errorText}`);
          }
          
          this.logger.warn(`Model ${modelUrl} failed: ${response.status} ${response.statusText} - ${errorText}`);
          continue; // Try next model
        }

        const data = await response.json();
        this.logger.debug(`Response data: ${JSON.stringify(data, null, 2)}`);

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          this.logger.warn(`No text generated from model: ${modelUrl}`);
          continue; // Try next model
        }

        this.logger.log(`Successfully generated summary using model: ${modelUrl}`);
        return this.parseResponse(generatedText);
      } catch (error) {
        this.logger.warn(`Error with model ${modelUrl}:`, error);
        continue; // Try next model
      }
    }

    // If all models failed
    this.logger.error(`All models failed for article: ${title}`);
    throw new Error('All Gemini models failed to generate response');
  }

  private buildPrompt(title: string, content: string, category: string, date: string): string {
    return `以下のブログ記事について、日本語で要約と推薦度を生成してください。

記事情報:
- タイトル: ${title}
- カテゴリ: ${category}
- 投稿日: ${date}
- 内容: ${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

以下の形式で回答してください:

要約: [記事の内容を80-120文字で要約。記事の主要なポイント、感想、評価を含める]
推薦度: [1-5の数字のみ]

推薦度の基準:
5: 必読、非常に優れた内容
4: おすすめ、良い内容
3: 普通、読む価値あり
2: 軽い読み物、時間があれば
1: 個人的記録、一般向けではない

例:
要約: フェイクドキュメンタリー「Q」シリーズの最新作を詳細に考察した記事。インターネット黎明期への郷愁と現代ホラーの融合を絶賛し、映像表現の素晴らしさを熱く語る。
推薦度: 5`;
  }

  private parseResponse(response: string): SummaryResponse {
    try {
      // 要約部分を抽出
      const summaryMatch = response.match(/要約[：:\s]*(.+?)(?=推薦度|$)/s);
      const summary = summaryMatch?.[1]?.trim() || response.substring(0, 100);

      // 推薦度を抽出
      const ratingMatch = response.match(/推薦度[：:\s]*(\d)/);
      const rating = ratingMatch?.[1] ? parseInt(ratingMatch[1], 10) : 3;

      return {
        summary: summary.replace(/\n/g, ' ').trim(),
        recommendation_stars: Math.max(1, Math.min(5, rating)),
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response', { response, error });
      return {
        summary: '記事の要約を生成できませんでした。',
        recommendation_stars: 3,
      };
    }
  }

  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}