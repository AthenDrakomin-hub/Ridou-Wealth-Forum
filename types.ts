
export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface RelatedStock {
  name: string;
  symbol: string;
  price: number;
  change: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: string;
  category: 'A股' | '港股' | '中概股' | '宏观';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number;
  images?: string[];
  relatedStock?: RelatedStock;
  isFeatured?: boolean;
  commentsList?: Comment[];
  tags: string[];
  attachments?: Attachment[];
}

export interface StockData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  history: { time: string; value: number }[];
}

export interface SectorData {
  name: string;
  change: number;
  hotStock: string;
  icon: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changeAmount: number;
}

export interface SocietyApplication {
  name: string;
  phone: string;
  investYears: string;
  missingAbilities: string;
  learningExpectation: string;
}
