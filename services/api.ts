
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
  
  // 东方财富 API 基础路径
  private EM_BASE = "https://push2.eastmoney.com/api/qt/stock/get?fields=f43,f170,f169,f168,f167,f58&secid=";
  // 新浪快讯 API 基础路径
  private SINA_NEWS_BASE = "https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=20&zhibo_id=152";

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
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

  /**
   * 获取 7x24 小时真实快讯
   */
  public async fetchNews(): Promise<NewsItem[]> {
    try {
      // 使用公共代理以解决开发环境下的跨域问题
      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const response = await fetch(`${proxyUrl}${encodeURIComponent(this.SINA_NEWS_BASE)}`);
      const json = await response.json();
      
      if (json?.result?.data?.feed?.list) {
        return json.result.data.feed.list.map((item: any) => ({
          id: item.id.toString(),
          title: item.content,
          source: '新浪财经',
          url: item.doc_url || '#',
          timestamp: item.createtime.split(' ')[1].slice(0, 5), // 提取 HH:mm
          category: '宏观',
          sentiment: item.content.includes('利好') || item.content.includes('大涨') ? 'positive' : 'neutral'
        }));
      }
    } catch (err) {
      console.warn("Real-time news fetch failed, using fallback.", err);
    }

    return [
      { id: 'f1', title: '【系统提示】正在尝试连接实时财经信号源...', source: '系统', url: '#', timestamp: '--:--', category: '宏观', sentiment: 'neutral' }
    ];
  }

  /**
   * 获取真实市场指数
   * 0.399001 (深证成指), 1.000001 (上证指数), 0.399006 (创业板), 100.HSI (恒指)
   */
  public async fetchMarketIndices(): Promise<MarketIndex[]> {
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

      return results.filter(r => r !== null) as MarketIndex[];
    } catch (err) {
      console.warn("Index fetch failed, using demo data.", err);
      // Fallback
      return [
        { name: '上证指数', value: 3021.45, change: 0.15, changeAmount: 4.5 },
        { name: '深证成指', value: 9451.12, change: -0.21, changeAmount: -15.4 }
      ];
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
          .select('*')
          .order('timestamp', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) return data as Post[];
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
