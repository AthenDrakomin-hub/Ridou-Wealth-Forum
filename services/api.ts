
import { NewsItem, Post, MarketIndex, StockData, SectorData, SocietyApplication } from '../types';

export class DataService {
  private static instance: DataService;
  
  private supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  private supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  private esBaseUrl = (process.env.ELASTICSEARCH_URL || '').replace(/\/$/, '');
  private esApiKey = process.env.ELASTICSEARCH_API_KEY || '';
  private marketApiUrl = (process.env.MARKET_DATA_API_URL || '').replace(/\/$/, '');

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private async supabaseRequest(table: string, method: string = 'GET', body?: any) {
    if (!this.supabaseUrl) return null;
    const url = `${this.supabaseUrl}/rest/v1/${table}`;
    const headers: Record<string, string> = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    const response = await fetch(url + (method === 'GET' ? '?select=*' : ''), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error(`Supabase Error: ${response.statusText}`);
    return response.json();
  }

  private async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) throw new Error(`API Request Failed: ${response.status}`);
    return response.json();
  }

  public async fetchNews(): Promise<NewsItem[]> {
    return [
      { id: '1', title: '【核心逻辑】两市融资余额增加 32.8 亿，半导体国产设备链条出现主力资金回流。', source: '日斗智库', url: '#', timestamp: '09:30', category: 'A股', sentiment: 'positive' },
      { id: '2', title: '恒生指数盘中拉升逾 300 点，中资保险与券商板块成为护盘核心力量。', source: '行情中心', url: '#', timestamp: '10:45', category: '港股', sentiment: 'positive' },
      { id: '3', title: '美联储最新纪要暗示加息周期终结，离岸人民币走强，北向资金净流入扩大。', source: '国际部', url: '#', timestamp: '08:15', category: '宏观', sentiment: 'positive' },
      { id: '4', title: '工信部：将加快 6G 技术研发与卫星互联网产业化，相关通信设备板块异动。', source: '日斗快讯', url: '#', timestamp: '11:20', category: 'A股', sentiment: 'neutral' }
    ];
  }

  public async fetchMarketIndices(): Promise<MarketIndex[]> {
    const drift = (val: number) => val * (1 + (Math.random() * 0.0006 - 0.0003));
    return [
      { name: '上证指数', value: parseFloat(drift(3062.15).toFixed(2)), change: 0.92, changeAmount: 28.14 },
      { name: '深证成指', value: parseFloat(drift(9580.42).toFixed(2)), change: 1.25, changeAmount: 118.2 },
      { name: '创业板指', value: parseFloat(drift(1865.30).toFixed(2)), change: 1.48, changeAmount: 27.2 },
      { name: '恒生指数', value: parseFloat(drift(16920.5).toFixed(2)), change: 0.15, changeAmount: 25.4 }
    ];
  }

  public async fetchStockData(symbol: string): Promise<StockData | null> {
    const dataMap: Record<string, {name: string, price: number}> = {
      'SH688981': { name: '中芯国际', price: 71.42 },
      'SH601138': { name: '工业富联', price: 24.85 },
      'SZ300059': { name: '东方财富', price: 15.92 },
      'SH600519': { name: '贵州茅台', price: 1718.50 }
    };
    const base = dataMap[symbol] || { name: '日斗标的', price: 100.00 };
    return {
      name: base.name,
      symbol,
      price: base.price,
      change: 2.35,
      history: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, value: base.price * (0.94 + Math.random() * 0.12) }))
    };
  }

  public async submitApplication(app: SocietyApplication): Promise<{ success: boolean; message: string }> {
    return { 
      success: true, 
      message: "申请已同步。请确保飞书开启‘通过手机号搜索我’。导师将在 24 小时内发起连接。为了隐私安全，我们绝不拨打您的私人电话。" 
    };
  }

  public async fetchSectors(): Promise<SectorData[]> {
    return [
      { name: '半导体国产化', change: 3.85, hotStock: '中芯国际', icon: '💾' },
      { name: 'AI 计算力', change: 4.12, hotStock: '工业富联', icon: '🤖' },
      { name: '中特估/红利', change: 1.15, hotStock: '中国海油', icon: '💰' },
      { name: '新质生产力', change: 2.45, hotStock: '赛力斯', icon: '🔋' }
    ];
  }

  public async fetchForumPosts(): Promise<Post[]> {
    if (this.supabaseUrl) {
      try {
        const data = await this.supabaseRequest('posts');
        if (data && data.length > 0) return data;
      } catch (e) { console.error("Supabase Fetch Posts Error", e); }
    }
    
    return [
      {
        id: 'p1', author: '日斗投资', avatar: '',
        title: '核心逻辑：半导体情绪周期进入“第二阶段”，逻辑重于博弈',
        content: '我们观察到，当前市场对于国产替代的确定性逻辑正在从单一的设备端向材料端蔓延。随着二季度产能释放，板块内部将出现明显的强弱切换。\n\n关键逻辑支撑：\n1. 成熟制程去库存已进入历史大底，晶圆代工厂稼动率显著回升。\n2. 先进制程资本开支逆势提速，光刻膠、前驱体等核心材料国产替代空间巨大。\n3. 情绪博弈正向产业基本面回归，估值修复具备持续性。',
        timestamp: '2025-03-24', likes: 1840, comments: 156, views: 12500, isFeatured: true, tags: ['策略研报', '半导体', '国产替代'],
        attachments: [
          { name: '2025半导体产业链深度剖析.pdf', url: '#', type: 'PDF', size: '4.2MB' },
          { name: '核心标的盈利预测与估值模型.xlsx', url: '#', type: 'XLSX', size: '1.5MB' }
        ]
      },
      {
        id: 'p2', author: '日斗投资', avatar: '',
        title: '因子跟踪：高股息风格出现拥挤度预警，关注成长股修复契机',
        content: '红利指数近期持续走高，但从拥挤度模型来看已触及历史极值。建议投资者在防守的同时，开始关注具备产业边际变化的科创板核心标的。\n\n量化模型显示：\n- 红利因子收益率偏离中枢超过1.5个标准差。\n- 部分白马股出现主力资金净流出，需警惕抱团瓦解风险。\n- 科创50指数具备明显的反转因子加持。',
        timestamp: '2025-03-23', likes: 920, comments: 42, views: 8200, isFeatured: false, tags: ['量化策略', '红利', '拥挤度'],
        attachments: [
          { name: '红利风格拥挤度月报.pdf', url: '#', type: 'PDF', size: '2.8MB' }
        ]
      }
    ];
  }

  public async createPost(post: Partial<Post>): Promise<Post> {
    if (this.supabaseUrl) {
      const result = await this.supabaseRequest('posts', 'POST', post);
      return result[0];
    }
    throw new Error("Supabase 未配置");
  }

  public async deletePost(id: string): Promise<void> {
    if (this.supabaseUrl) {
      const url = `${this.supabaseUrl}/rest/v1/posts?id=eq.${id}`;
      await fetch(url, {
        method: 'DELETE',
        headers: { 'apikey': this.supabaseKey, 'Authorization': `Bearer ${this.supabaseKey}` }
      });
    }
  }
}
