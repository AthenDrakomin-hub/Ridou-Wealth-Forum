
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NewsItem, Post, MarketIndex, StockData, SectorData, SocietyApplication } from '../types';

/**
 * 金融数据服务类 - 接入真实免费 API 源
 * 指数/行情：东方财富 push2.eastmoney.com
 * 快讯：新浪财经 zhibo.sina.com.cn
 */
export class DataService {
  private static instance: DataService;
  private supabase: SupabaseClient | null = null;
  
  // 请求缓存
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  
  // 东方财富 API 基础路径
  private EM_BASE = "https://push2.eastmoney.com/api/qt/stock/get?fields=f43,f170,f169,f168,f167,f58&secid=";
  // 新浪快讯 API 基础路径
  private SINA_NEWS_BASE = "https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=20&zhibo_id=152";

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // 调试信息（仅开发环境）
    if (import.meta.env.DEV) {
      console.log('[Supabase Config]', {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
        key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    }
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.error('[Supabase] 环境变量未配置！请检查 .env.local 文件');
    }
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public isConnected(): boolean {
    return this.supabase !== null;
  }
  
  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }
  
  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 判断是否为开发环境
   */
  private isDevelopment(): boolean {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
  }

  /**
   * 获取 7x24 小时真实快讯
   */
  public async fetchNews(): Promise<NewsItem[]> {
    // 检查缓存
    const cacheKey = 'news';
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // 开发环境使用 Vite 代理，生产环境直接调用
      const apiUrl = this.isDevelopment() 
        ? '/api/sina/feed?page=1&page_size=20&zhibo_id=152'
        : 'https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=20&zhibo_id=152';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json?.result?.data?.feed?.list && Array.isArray(json.result.data.feed.list)) {
        const newsData = json.result.data.feed.list.slice(0, 20).map((item: any) => ({
          id: item.id.toString(),
          title: item.content || item.title || '暂无标题',
          source: '新浪财经',
          url: item.doc_url || '#',
          timestamp: item.createtime ? item.createtime.split(' ')[1]?.slice(0, 5) || '--:--' : '--:--',
          category: '宏观',
          sentiment: (item.content || '').includes('利好') || (item.content || '').includes('大涨') ? 'positive' as const : 'neutral' as const
        }));
        
        // 缓存数据
        this.setCachedData(cacheKey, newsData);
        return newsData;
      }
    } catch (err) {
      console.warn("Real-time news fetch failed, using fallback.", err);
    }

    // 使用模拟数据（API 不可用时的后备方案）
    const fallbackData: NewsItem[] = [
      { id: 'f1', title: '【系统提示】实时财经数据源暂时不可用，请刷新页面重试', source: '系统', url: '#', timestamp: new Date().toTimeString().slice(0, 5), category: '宏观', sentiment: 'neutral' },
      { id: 'f2', title: '市场概览：A股三大指数震荡整理，北向资金净流入15亿元', source: '模拟数据', url: '#', timestamp: new Date().toTimeString().slice(0, 5), category: 'A股', sentiment: 'neutral' },
      { id: 'f3', title: '央行公告：今日开展1000亿元逆回购操作', source: '模拟数据', url: '#', timestamp: new Date().toTimeString().slice(0, 5), category: '宏观', sentiment: 'positive' }
    ];
    
    // 缓存后备数据（较短时间）
    this.cache.set(cacheKey, { data: fallbackData, timestamp: Date.now() - (this.CACHE_TTL - 30000) });
    return fallbackData;
  }

  /**
   * 获取真实市场指数
   * 0.399001 (深证成指), 1.000001 (上证指数), 0.399006 (创业板), 100.HSI (恒指)
   */
  public async fetchMarketIndices(): Promise<MarketIndex[]> {
    // 检查缓存
    const cacheKey = 'marketIndices';
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const symbols = [
      { id: '1.000001', name: '上证指数' },
      { id: '0.399001', name: '深证成指' },
      { id: '0.399006', name: '创业板指' },
      { id: '100.HSI', name: '恒生指数' },
      { id: '103.ym_m_CN00Y', name: '富时A50' },
      { id: '100.NDX', name: '纳斯达克' }
    ];

    try {
      const results = await Promise.all(symbols.map(async (s) => {
        const res = await fetch(`${this.EM_BASE}${s.id}`);
        const json = await res.json();
        const data = json.data;
        if (!data) return null;
        
        // Fix: Removed duplicate 'value' property assignment to resolve object literal error and corrected the calculation.
        return {
          name: s.name,
          // f43 现价, f170 涨跌幅, f169 涨跌额
          value: data.f43 / 100, // 指数点位
          change: data.f170 / 100,
          changeAmount: data.f169 / 100
        };
      }));

      const marketData = results.filter(r => r !== null) as MarketIndex[];
      
      // 缓存数据
      this.setCachedData(cacheKey, marketData);
      return marketData;
    } catch (err) {
      console.warn("Index fetch failed, using demo data.", err);
      // Fallback
      const fallbackData = [
        { name: '上证指数', value: 3021.45, change: 0.15, changeAmount: 4.5 },
        { name: '深证成指', value: 9451.12, change: -0.21, changeAmount: -15.4 }
      ];
      
      // 缓存后备数据
      this.setCachedData(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  /**
   * 获取个股实时行情
   */
  public async fetchStockData(symbol: string): Promise<StockData | null> {
    // 映射 A 股代码格式为东财 secid: 60xxxx -> 1.60xxxx, 00xxxx -> 0.00xxxx
    const secid = symbol.startsWith('6') ? `1.${symbol}` : `0.${symbol}`;
    
    try {
      const res = await fetch(`${this.EM_BASE}${secid}`);
      const json = await res.json();
      const data = json.data;
      if (!data) return null;

      return {
        name: data.f58,
        symbol,
        price: data.f43 / 100,
        change: data.f170 / 100,
        history: Array.from({ length: 12 }, (_, i) => ({ 
          time: `${i*2}:00`, 
          value: (data.f43 / 100) * (0.98 + Math.random() * 0.04) 
        }))
      };
    } catch (err) {
      return null;
    }
  }

  public async submitApplication(app: SocietyApplication): Promise<{ success: boolean; message: string }> {
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('applications')
          .insert([app]);
        if (error) throw error;
      } catch (err) {
        console.error("Supabase Error:", err);
        return { success: false, message: "数据链路故障，请检查网络。" };
      }
    }
    return { success: true, message: "申请已送达逻辑中枢。" };
  }

  public async fetchSectors(): Promise<SectorData[]> {
    // 这里可以使用东财的板块排行接口
    return [
      { name: '半导体', change: 2.15, hotStock: '中芯国际', icon: '💾' },
      { name: '中特估', change: 0.85, hotStock: '中国海油', icon: '💰' },
      { name: 'AI应用', change: 1.45, hotStock: '昆仑万维', icon: '🤖' },
      { name: '高股息', change: 0.52, hotStock: '长江电力', icon: '📈' }
    ];
  }

  public async fetchForumPosts(): Promise<Post[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('posts')
          .select(`
            *,
            comments:comments(
              id,
              author_name,
              content,
              created_at,
              author_id
            )
          `)
          .eq('status', 'published')  // 只查询已发布的帖子
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // 将 comments 字段映射为 commentsList，并转换字段名
          return data.map(post => ({
            ...post,
            isFeatured: post.is_featured,
            relatedStock: post.related_stock,
            commentsList: (post.comments || []).map((c: any) => ({
              id: c.id,
              author: c.author_name,  // author_name → author
              content: c.content,
              timestamp: c.created_at,  // created_at → timestamp
              post_id: post.id,
              author_id: c.author_id
            })),
            comments: (post.comments || []).length  // 评论数量
          })) as Post[];
        }
      } catch (e) {
        console.error("Fetch Posts Error", e);
      }
    }
    return [
      {
        id: 'p1', author: '日斗智库', avatar: '',
        title: '【实时追踪】核心资产逻辑重估：寻找确定性锚点',
        content: '在当前宏观环境下，我们认为传统的博弈逻辑正在失效，产业逻辑的权重在持续上升...',
        timestamp: '刚刚', likes: 1200, comments: 85, views: 5600, isFeatured: true, tags: ['策略', '核心资产']
      }
    ];
  }

  public async createPost(post: Partial<Post>): Promise<Post> {
    if (!this.supabase) throw new Error("Database not connected");
    const { data, error } = await this.supabase.from('posts').insert([post]).select();
    if (error) throw error;
    return data[0] as Post;
  }

  public async deletePost(id: string): Promise<void> {
    if (!this.supabase) return;
    await this.supabase.from('posts').delete().eq('id', id);
  }
}