export interface MTBlogPost {
  author: string;
  title: string;
  basename: string;
  status: 'Publish' | 'Draft';
  allowComments: boolean;
  convertBreaks: boolean;
  date: Date;
  category?: string;
  image?: string;
  body?: string;
  extendedBody?: string;
}