import React, { useState, useEffect, useRef, useCallback, Suspense, lazy, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PostItem from './components/PostItem';
import Logo from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataService } from './services/api';
import { Post, NewsItem, MarketIndex, SocietyApplication } from './types';

const RealtimeQuotes = lazy(() => import('./components/RealtimeQuotes'));
const RealtimeNewsFeed = lazy(() => import('./components/RealtimeNewsFeed'));

const WECHAT_QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzk2ODAzMDA2Ng==#wechat_redirect";

const ComponentLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Logic Connecting...</span>
  </div>
);

const FeishuGuideSection: React.FC = () => (
  <div className="space-y-12 md:space-y-20 py-16 md:py-32 border-t border-white/5">
    <div className="text-center space-y-6">
      <h3 className="text-3xl md:text-5xl font-serif font-bold italic text-white tracking-tighter">飞书配置指南</h3>
      <p className="text-slate-400 text-lg md:text-xl font-light italic">Ridou Digital Foundation & Collaboration Guide</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
      {/* 步骤 1：下载安装 */}
      <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8 hover:bg-white/[0.04] transition-all group flex flex-col">
        <div className="flex items-center gap-6">
          <span className="text-3xl md:text-4xl bg-amber-500/10 p-4 rounded-2xl text-amber-500 font-black italic">01</span>
          <div>
            <h4 className="text-xl font-bold text-white">获取飞书客户端</h4>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-black">Download Platform</p>
          </div>
        </div>
        
        <div className="space-y-6 flex-1">
          <div className="space-y-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest border-l-2 border-amber-500/30 pl-3">桌面端 / Desktop</p>
            <div className="grid grid-cols-1 gap-2">
              <a href="https://www.feishu.cn/download" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white transition-all text-sm group/link">
                <span className="flex items-center gap-3"><i className="fab fa-windows opacity-50"></i> Windows / Mac</span>
                <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all"></i>
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest border-l-2 border-blue-500/30 pl-3">移动端 / Mobile</p>
            <div className="grid grid-cols-1 gap-2">
              <a href="https://www.feishu.cn/download" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-white transition-all text-sm group/link">
                <span className="flex items-center gap-3"><i className="fab fa-apple opacity-50"></i> iOS / Android</span>
                <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 步骤 2：注册完善 */}
      <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8 hover:bg-white/[0.04] transition-all group flex flex-col">
        <div className="flex items-center gap-6">
          <span className="text-3xl md:text-4xl bg-blue-500/10 p-4 rounded-2xl text-blue-400 font-black italic">02</span>
          <div>
            <h4 className="text-xl font-bold text-white">注册并完善信息</h4>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-black">Register & Setup</p>
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <p className="text-slate-400 text-sm leading-relaxed italic">
            使用申请时提交的<span className="text-white font-bold px-1">手机号</span>完成注册，并建议完善实名信息。
          </p>
          <div className="bg-blue-600/10 border border-blue-600/20 p-5 rounded-2xl">
             <p className="text-blue-400 font-bold text-xs leading-relaxed">
               提示：请确保飞书账号手机号与本平台提交的手机号完全一致。
             </p>
          </div>
        </div>
      </div>

      {/* 步骤 3：隐私权限 */}
      <div className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3rem] space-y-8 hover:bg-white/[0.04] transition-all group flex flex-col">
        <div className="flex items-center gap-6">
          <span className="text-3xl md:text-4xl bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 font-black italic">03</span>
          <div>
            <h4 className="text-xl font-bold text-white">开启搜索权限</h4>
            <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-widest font-black">Privacy Settings</p>
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <p className="text-slate-400 text-sm leading-relaxed italic">
            为确保导师能顺利添加您，请务必开启关键隐私权限：
          </p>
          <div className="bg-amber-600/10 border border-amber-600/20 p-5 rounded-2xl">
             <p className="text-amber-500 font-black text-center text-sm leading-relaxed tracking-wider">
               设置 &gt; 隐私 &gt; <br/>
               <span className="text-lg">开启"通过手机号搜索我"</span>
             </p>
          </div>
          <p className="text-slate-600 text-[10px] font-bold text-center uppercase tracking-widest">
            * 未开启此权限将导致导师无法发起连接
          </p>
        </div>
      </div>
    </div>

    {/* 核心承诺 */}
    <div className="max-w-4xl mx-auto p-10 md:p-16 bg-gradient-to-br from-slate-900/50 to-black/80 border border-amber-600/10 rounded-[3rem] text-center space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <i className="fas fa-shield-alt text-8xl text-white"></i>
      </div>
      <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.4em]">纯粹协作 · 飞书专属</h4>
      <p className="text-slate-400 text-lg leading-relaxed italic max-w-2xl mx-auto">
        日斗秉持"低摩擦、高价值"的沟通原则。我们<span className="text-amber-500 font-black px-1 underline underline-offset-4 decoration-amber-500/30">承诺绝不拨打任何电话</span>。所有连接申请均由导师通过飞书账号实名发起，请在申请后留意飞书系统通知。
      </p>
    </div>
  </div>
);

const WechatSearchBanner: React.FC<{ className?: string; onClick?: () => void }> = ({ className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`w-full max-w-2xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 transition-all duration-700 relative group cursor-pointer active-scale ${className} hover:scale-[1.05] hover:shadow-amber-500/20 hover:border-amber-500/30`}
  >
    <img 
      src="./wechat_banner.png" 
      alt="日斗投资官方公众号" 
      className="w-full h-auto block transition-all duration-700 group-hover:opacity-20 group-hover:blur-md scale-100 group-hover:scale-110"
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/600x200/07C160/white?text=日斗投资管理有限公司+官方认证";
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 bg-black/40 backdrop-blur-md">
       <div className="text-center p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
          <div className="bg-white p-3 rounded-[1.5rem] mb-4 shadow-3xl inline-block rotate-3 group-hover:rotate-0 transition-transform duration-700">
             <img 
                src={WECHAT_QR_URL} 
                alt="关注日斗公众号" 
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg"
                loading="lazy"
             />
          </div>
          <div className="space-y-1">
            <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest">点击跳转关注</p>
            <p className="text-amber-500 text-[8px] font-bold tracking-[0.2em] uppercase opacity-80">Scan or Click to Follow</p>
          </div>
       </div>
    </div>
    <div className="absolute inset-0 border-[1px] border-white/0 group-hover:border-amber-500/30 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-700 pointer-events-none"></div>
  </div>
);

interface SearchSuggestion {
  id: string;
  type: '研报' | '行情' | '快讯';
  title: string;
  data: any;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadNewsCount, setUnreadNewsCount] = useState(0);
  const [lastSeenNewsId, setLastSeenNewsId] = useState<string | null>(null);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appData, setAppData] = useState<SocietyApplication>({
    name: '', phone: '', investYears: '', missingAbilities: '', learningExpectation: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmingLink, setConfirmingLink] = useState<{ title: string; desc: string; url: string; isWechat?: boolean; showBanner?: boolean } | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [newsData, postsData, indexData] = await Promise.all([
        DataService.getInstance().fetchNews(),
        DataService.getInstance().fetchPosts(),
        DataService.getInstance().fetchIndices()
      ]);
      
      setNews(newsData);
      setPosts(postsData);
      setIndices(indexData);
      setDbConnected(DataService.getInstance().isConnected());
      
      // 计算未读快讯数量
      if (lastSeenNewsId && newsData.length > 0) {
        const lastSeenIndex = newsData.findIndex(item => item.id === lastSeenNewsId);
        setUnreadNewsCount(lastSeenIndex > 0 ? lastSeenIndex : 0);
      } else if (newsData.length > 0) {
        setUnreadNewsCount(newsData.length);
      }
    } catch (error) {
      console.error('数据获取失败:', error);
    } finally {
      setLoading(false);
    }
  }, [lastSeenNewsId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkAllAsRead = useCallback(() => {
    if (news.length > 0) {
      setLastSeenNewsId(news[0].id);
    }
    setUnreadNewsCount(0);
    fetchData();
  }, [news, fetchData]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setSelectedPost(null);
    setSubmitSuccess(false); 
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsSearchFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-12 md:space-y-24">
            {/* 头部横幅 */}
            <section className="text-center space-y-8 py-12">
              <div className="inline-flex items-center gap-3 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20">
                <span className="text-2xl">💰</span>
                <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Ridou Wealth Forum</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-7xl font-serif font-bold italic text-white tracking-tighter leading-none">
                  日斗财富论坛
                </h1>
                <p className="text-slate-400 text-lg md:text-2xl font-light italic max-w-3xl mx-auto">
                  散户投资者的一站式聚合门户 · 市场新闻 · 数据洞察 · 内容合集 · 个股查询
                </p>
              </div>
            </section>
            
            {/* 功能模块网格 */}
            <section className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 微信公众号合集 */}
                <div 
                  onClick={() => handleTabChange('wechat-collections')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <i className="fab fa-weixin text-2xl text-green-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">微信公众号合集</h3>
                  </div>
                  <p className="text-slate-400 mb-6">日斗投资官方公众号四大内容合集</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">View Collections</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
                
                {/* 百度百家号 */}
                <div 
                  onClick={() => handleTabChange('about')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <i className="fab fa-baidu text-2xl text-blue-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">百度百家号</h3>
                  </div>
                  <p className="text-slate-400 mb-6">日斗投资企业认证官方账号</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">View Profile</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
                
                {/* 日斗动态 */}
                <div 
                  onClick={() => handleTabChange('daily-talk')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-bullhorn text-2xl text-amber-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">日斗动态</h3>
                  </div>
                  <p className="text-slate-400 mb-6">官方公告与重要资讯</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">View Updates</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
                
                {/* 个股查询 */}
                <div 
                  onClick={() => handleTabChange('stock-query')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-search-dollar text-2xl text-purple-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">个股查询</h3>
                  </div>
                  <p className="text-slate-400 mb-6">A股与港股代码查询</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">Query Stocks</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
                
                {/* 实时行情 */}
                <div 
                  onClick={() => handleTabChange('markets')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-chart-line text-2xl text-emerald-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">实时行情</h3>
                  </div>
                  <p className="text-slate-400 mb-6">全球市场实时数据</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">View Markets</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
                
                {/* 私享会申请 */}
                <div 
                  onClick={() => handleTabChange('private-society')}
                  className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <i className="fas fa-crown text-2xl text-red-500"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">私享会</h3>
                  </div>
                  <p className="text-slate-400 mb-6">免费申请加入精英投研社群</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-black uppercase tracking-widest">Apply Free</span>
                    <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </div>
            </section>
            
            {/* 最新动态 */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-4xl font-serif font-bold italic text-white tracking-tighter">最新动态</h2>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{dbConnected ? 'Live' : 'Demo'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.slice(0, 4).map(post => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    onClick={setSelectedPost}
                  />
                ))}
              </div>
              
              <div className="text-center pt-8">
                <button 
                  onClick={() => handleTabChange('daily-talk')}
                  className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-black text-sm uppercase tracking-widest"
                >
                  查看所有动态
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </section>
            
            <Suspense fallback={<ComponentLoader />}>
              <RealtimeNewsFeed 
                news={news} 
                unreadCount={unreadNewsCount} 
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </Suspense>
          </div>
        );
        
      case 'markets':
        return (
          <div className="space-y-12 md:space-y-24">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-4xl font-serif font-bold italic text-slate-900 tracking-tighter">实时行情</h2>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{dbConnected ? 'Live' : 'Demo'}</span>
                </div>
              </div>
              
              <Suspense fallback={<ComponentLoader />}>
                <RealtimeQuotes indices={indices} />
              </Suspense>
            </div>
            
            <div className="space-y-12">
              <div className="text-center space-y-6">
                <h3 className="text-3xl md:text-5xl font-serif font-bold italic text-white tracking-tighter">核心资产配置</h3>
                <p className="text-slate-400 text-lg md:text-xl font-light italic">Global Macro Allocation Framework</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {[
                  { 
                    title: '美股科技', 
                    desc: 'FAANG+T 组合深度拆解', 
                    icon: '🇺🇸', 
                    color: 'from-blue-500/10 to-blue-600/20 border-blue-500/20 text-blue-400',
                    tags: ['NVDA', 'MSFT', 'GOOGL']
                  },
                  { 
                    title: 'A股核心', 
                    desc: '沪深300成分股权重分析', 
                    icon: '🇨🇳', 
                    color: 'from-amber-500/10 to-amber-600/20 border-amber-500/20 text-amber-500',
                    tags: ['茅台', '宁德', '招行']
                  },
                  { 
                    title: '全球债券', 
                    desc: '美债收益率曲线监测', 
                    icon: '💵', 
                    color: 'from-emerald-500/10 to-emerald-600/20 border-emerald-500/20 text-emerald-500',
                    tags: ['TLT', 'SHY', 'IEF']
                  }
                ].map((asset, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${asset.color} border rounded-[2rem] p-8 md:p-10 space-y-6 hover:scale-105 transition-all group cursor-pointer active-scale`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{asset.icon}</span>
                      <div>
                        <h4 className="text-xl font-bold text-white">{asset.title}</h4>
                        <p className="text-slate-400 text-xs font-medium">{asset.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {asset.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                        查看深度逻辑 ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'private-society':
        return (
          <div className="space-y-12 md:space-y-24">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-3 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20">
                <span className="text-2xl">🔱</span>
                <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Private Society</span>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-7xl font-serif font-bold italic text-white tracking-tighter leading-none">日斗私享会</h2>
                <p className="text-slate-400 text-lg md:text-2xl font-light italic max-w-3xl mx-auto">
                  精英投研社群 · 逻辑共振场 · 核心资产池
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-4xl font-serif font-bold italic text-white tracking-tighter">核心价值</h3>
                  <div className="space-y-6">
                    {[
                      { icon: '🧠', title: '深度逻辑拆解', desc: '每周精选行业与个股，穿透表象直达本质' },
                      { icon: '📊', title: '实时资产监测', desc: '核心持仓动态追踪，把握调仓时机' },
                      { icon: '🤝', title: '精英圈层链接', desc: '与同频投资者共建认知护城河' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.04] transition-all group">
                        <span className="text-2xl mt-1">{item.icon}</span>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{item.title}</h4>
                          <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={() => setIsAppModalOpen(true)}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-6 rounded-[2rem] font-black text-xl active-scale shadow-2xl transition-all border border-white/10 group"
                  >
                    立即申请席位 
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">↗</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-amber-600/10 rounded-[3rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i className="fas fa-crown text-8xl text-amber-500"></i>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20">
                      <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Premium Benefits</span>
                    </div>
                    
                    <h4 className="text-2xl md:text-3xl font-serif font-bold italic text-white tracking-tighter">会员权益</h4>
                  </div>
                  
                  <div className="space-y-6 pt-8">
                    {[
                      { icon: '🔒', title: '独家研报', desc: '每周3份深度行业报告' },
                      { icon: '🔔', title: '预警信号', desc: '核心持仓异动即时提醒' },
                      { icon: '👥', title: '闭门研讨', desc: '月度线上逻辑共振会议' },
                      { icon: '🎓', title: '导师辅导', desc: '一对一投资框架指导' }
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                        <span className="text-xl w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">{benefit.icon}</span>
                        <div className="text-left">
                          <h5 className="text-white font-bold">{benefit.title}</h5>
                          <p className="text-slate-400 text-xs">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <WechatSearchBanner 
                  onClick={() => setConfirmingLink({
                    title: "关注官方微信公众号",
                    desc: "获取最新投研资讯与私享会动态",
                    url: "#",
                    isWechat: true,
                    showBanner: true
                  })}
                />
              </div>
            </div>
            
            <FeishuGuideSection />
          </div>
        );
        
      case 'about':
        return (
          <div className="space-y-24 md:space-y-40">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-3 bg-slate-500/10 px-6 py-3 rounded-full border border-slate-500/20">
                <span className="text-2xl">🏛️</span>
                <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Official Introduction</span>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-7xl font-serif font-bold italic text-white tracking-tighter leading-none">关于我们</h2>
                <p className="text-slate-400 text-lg md:text-2xl font-light italic max-w-3xl mx-auto">
                  日斗投资咨询有限公司 · 日斗财富论坛
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-4xl font-serif font-bold italic text-white tracking-tighter">使命愿景</h3>
                  <div className="space-y-6">
                    <div className="p-8 bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem]">
                      <h4 className="text-xl font-bold text-white mb-4">我们的使命</h4>
                      <p className="text-slate-400 leading-relaxed italic">
                        穿透市场噪音，重构产业逻辑。我们致力于帮助投资者发现具备全球竞争力的确定性资产，
                        并通过系统化的方法论构建可持续的超额收益。
                      </p>
                    </div>
                    
                    <div className="p-8 bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem]">
                      <h4 className="text-xl font-bold text-white mb-4">核心理念</h4>
                      <div className="space-y-4">
                        {[
                          { title: '逻辑优先', desc: '超越数据表象，深挖驱动因子' },
                          { title: '长期主义', desc: '专注具备时间价值的资产' },
                          { title: '风险控制', desc: '将下行风险置于收益之前' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="text-amber-500 mt-1">»</span>
                            <div>
                              <h5 className="text-white font-bold">{item.title}</h5>
                              <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[3rem] p-10 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <i className="fas fa-building text-8xl text-white"></i>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <span className="text-4xl">🔱</span>
                      </div>
                      <h4 className="text-2xl font-serif font-bold italic text-white tracking-tighter mb-2">日斗投资咨询有限公司</h4>
                      <p className="text-amber-500 text-sm font-black uppercase tracking-widest">ZHENGYU INVESTMENT CONSULTING CO., LTD.</p>
                    </div>
                    
                    <div className="space-y-6 pt-6">
                      <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                        <span className="text-2xl text-amber-500">📍</span>
                        <div>
                          <h5 className="text-white font-bold">注册地址</h5>
                          <p className="text-slate-400 text-sm">中国(上海)自由贸易试验区</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                        <span className="text-2xl text-amber-500">📝</span>
                        <div>
                          <h5 className="text-white font-bold">业务范围</h5>
                          <p className="text-slate-400 text-sm">投资咨询 / 财经研究 / 资产管理</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                        <span className="text-2xl text-amber-500">⚖️</span>
                        <div>
                          <h5 className="text-white font-bold">合规声明</h5>
                          <p className="text-slate-400 text-sm">本平台内容仅供投研交流，不构成投资建议</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '📧', title: '商务合作', desc: 'bd@zhengyutouzi.com' },
                    { icon: '📱', title: '飞书协作', desc: '基于邀请制的私享会' }
                  ].map((contact, idx) => (
                    <div key={idx} className="p-6 bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[1.5rem] text-center">
                      <span className="text-2xl mb-3 inline-block">{contact.icon}</span>
                      <h5 className="text-white font-bold text-sm mb-1">{contact.title}</h5>
                      <p className="text-slate-400 text-xs">{contact.desc}</p>
                    </div>
                  ))}
                </div>
                
                {/* 百度百家号信息 */}
                <div className="mt-8 p-6 bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[1.5rem] text-center">
                  <h4 className="text-xl font-bold text-white mb-4">百度百家号</h4>
                  <p className="text-slate-400 mb-4">关注我们在百度百家号的企业认证账号</p>
                  <div className="flex flex-col items-center">
                    <p className="text-amber-500 font-bold mb-2">ID: 1834826396171131</p>
                    <p className="text-slate-400 text-sm mb-4">类型：企业 &nbsp;&nbsp;|&nbsp;&nbsp; 领域：财经</p>
                    <div className="bg-white p-2 rounded-lg">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://author.baidu.com/home/1834826396171131" 
                        alt="百度百家号二维码" 
                        className="w-24 h-24"
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-2">扫码关注</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-16">
              <div className="text-center space-y-6">
                <h3 className="text-3xl md:text-5xl font-serif font-bold italic text-white tracking-tighter">核心团队</h3>
                <p className="text-slate-400 text-lg md:text-xl font-light italic">Experience Across Global Markets</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: '张首席', role: 'Founder & Chief Strategist', desc: '前头部券商研究所所长，15年二级市场投研经验' },
                  { name: '李总监', role: 'Quantitative Research Director', desc: '芝加哥大学金融学博士，量化投资专家' },
                  { name: '王经理', role: 'Global Asset Allocation', desc: '伦敦政经学院经济学硕士，海外资产配置专家' }
                ].map((member, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 text-center space-y-6 hover:scale-105 transition-all group">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-700/20 rounded-[2rem] flex items-center justify-center mx-auto border border-amber-500/20 group-hover:border-amber-500/40 transition-all">
                      <span className="text-3xl">👤</span>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-white">{member.name}</h4>
                      <p className="text-amber-500 text-xs font-black uppercase tracking-widest">{member.role}</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{member.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-16">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h4 className="text-xl font-serif font-bold italic text-white tracking-tighter">合规声明</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  本平台所有内容由日斗投资咨询有限公司提供，仅供投研交流使用，不构成任何投资建议。
                  投资者应自主决策并承担相应风险。市场有风险，入市需谨慎。
                </p>
                <p className="text-slate-500 text-xs mt-8">
                  Copyright © 2025 Ridou Investment Consulting Co., Ltd. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'daily-talk':
        return (
          <div className="adaptive-container px-4 py-12 md:py-24 space-y-12 page-enter">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20">
                  <span className="text-2xl">📢</span>
                  <span className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Official Announcement</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-400 font-black text-[10px] uppercase tracking-widest">官方认证</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-serif font-bold italic text-white tracking-tighter">日斗动态</h2>
                <p className="text-slate-400 text-lg md:text-xl font-light italic">
                  来自日斗投资的官方公告与重要资讯
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "私享会第十届财富论坛即将开幕",
                    content: "本届论坛将于2026年1月在北京举办，主题为'全球变局下的确定性机会'。欢迎已认证会员关注飞书日历推送。",
                    date: "2025-12-20",
                    tag: "活动预告"
                  },
                  {
                    title: "关于近期市场波动的风险提示",
                    content: "当前市场处于技术性调整阶段，建议投资者保持理性，严格遵循既定仓位管理原则。详细分析报告将于晚间发布。",
                    date: "2025-12-19",
                    tag: "风险提示"
                  },
                  {
                    title: "新增港股通标的池调整公告",
                    content: "根据最新港股通标的调整，我们将同步更新核心持仓监控列表。请私享会成员关注飞书群内通知。",
                    date: "2025-12-18",
                    tag: "产品更新"
                  },
                  {
                    title: "关于防范非法投教活动的声明",
                    content: "近日发现有不法分子冒用我司名义开展非法投教活动。特此声明：我司所有活动均通过飞书平台发起，请勿轻信其他渠道信息。",
                    date: "2025-12-17",
                    tag: "重要声明"
                  }
                ].map((post, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-6 hover:scale-[1.02] transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <span className="bg-amber-500/10 text-amber-500 text-xs font-black px-3 py-1 rounded-full">{post.tag}</span>
                      <span className="text-slate-500 text-xs">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{post.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{post.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-12 text-center">
                <button 
                  onClick={() => handleTabChange('home')}
                  className="inline-flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-4 px-8 rounded-full font-black text-sm uppercase tracking-widest active-scale transition-all shadow-xl"
                >
                  返回财富广场
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'stock-query':
        return (
          <div className="adaptive-container px-4 py-12 md:py-24 space-y-12 page-enter">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20">
                  <span className="text-2xl">🔍</span>
                  <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">Stock Query</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-serif font-bold italic text-white tracking-tighter">个股查询</h2>
                <p className="text-slate-400 text-lg md:text-xl font-light italic">
                  支持A股（SH/SZ）和港股（HK）代码查询
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="请输入股票代码（如：SH600519、SZ000858、HK00700）"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-bold text-sm active-scale transition-all">
                      查询
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">A股代码格式</h3>
                      <ul className="space-y-2 text-slate-400">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>沪市主板：SH600XXX、SH601XXX、SH603XXX、SH605XXX</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>深市主板：SZ000XXX</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          <span>中小板：SZ002XXX</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                  <span>创业板：SZ300XXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>科创板：SH688XXX、SH689XXX</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">港股代码格式</h3>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  <span>主板：HK00XXX、HK01XXX-HK99XXX</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  <span>示例：腾讯控股 HK00700、比亚迪股份 HK01211</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4">热门个股</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { code: 'SH600519', name: '贵州茅台' },
                { code: 'SZ000858', name: '五粮液' },
                { code: 'SH601318', name: '中国平安' },
                { code: 'HK00700', name: '腾讯控股' },
                { code: 'SZ002594', name: '比亚迪' },
                { code: 'SH600036', name: '招商银行' },
                { code: 'HK01211', name: '比亚迪股份' },
                { code: 'SH601888', name: '中国中免' }
              ].map((stock, idx) => (
                <button 
                  key={idx}
                  className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg p-3 text-center transition-all active-scale"
                >
                  <div className="text-white font-bold">{stock.code}</div>
                  <div className="text-slate-400 text-xs mt-1">{stock.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-12 text-center">
        <button 
          onClick={() => handleTabChange('home')}
          className="inline-flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-4 px-8 rounded-full font-black text-sm uppercase tracking-widest active-scale transition-all shadow-xl"
        >
          返回首页
          <i className="fas fa-arrow-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
);

case 'wechat-collections':
  return (
    <div className="adaptive-container px-4 py-12 md:py-24 space-y-12 page-enter">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 bg-green-500/10 px-6 py-3 rounded-full border border-green-500/20">
            <i className="fab fa-weixin text-2xl text-green-500"></i>
            <span className="text-green-500 font-black text-[10px] uppercase tracking-[0.3em]">WeChat Collections</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl md:text-6xl font-serif font-bold italic text-white tracking-tighter">微信公众号合集</h2>
          <p className="text-slate-400 text-lg md:text-xl font-light italic">
            日斗投资官方公众号四大内容合集
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "日斗风口掘金合集",
              desc: "深度挖掘市场热点板块与潜在机会",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4303883530733797378#wechat_redirect",
              icon: "🔥"
            },
            {
              title: "日斗私享会",
              desc: "精英投研社群专属内容与闭门研讨",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4302633600643940362#wechat_redirect",
              icon: "🔱"
            },
            {
              title: "日斗每日财经说",
              desc: "每日市场点评与投资逻辑分享",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100042146043101193#wechat_redirect",
              icon: "💬"
            },
            {
              title: "日斗策略",
              desc: "投资策略体系与实战方法论",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100037966654046208#wechat_redirect",
              icon: "🎯"
            }
          ].map((collection, idx) => (
            <a 
              key={idx}
              href={collection.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-slate-900/50 to-black/80 border border-white/5 rounded-[2rem] p-8 hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">{collection.icon}</span>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{collection.title}</h3>
              </div>
              <p className="text-slate-400 mb-6">{collection.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-green-500 text-sm font-black uppercase tracking-widest">View Collection</span>
                <i className="fas fa-external-link-alt text-green-500 group-hover:translate-x-1 transition-transform"></i>
              </div>
            </a>
          ))}
        </div>
        
        <div className="pt-12 text-center">
          <button 
            onClick={() => handleTabChange('home')}
            className="inline-flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 py-4 px-8 rounded-full font-black text-sm uppercase tracking-widest active-scale transition-all shadow-xl"
          >
            返回首页
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
    }
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} unreadNewsCount={unreadNewsCount} />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {activeTab !== 'home' && activeTab !== 'daily-talk' && (
            <header className="flex-none sticky top-0 z-50 bg-white/90 backdrop-blur-xl px-6 md:px-12 py-6 border-b border-slate-100 flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-serif font-bold italic text-slate-900 tracking-tighter capitalize">
                {activeTab === 'markets' && '实时行情'}
                {activeTab === 'stock-query' && '个股查询'}
                {activeTab === 'wechat-collections' && '微信合集'}
                {activeTab === 'private-society' && '私享会'}
                {activeTab === 'about' && '关于我们'}
              </h1>
              
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`}></span>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{dbConnected ? 'Live' : 'Demo'}</span>
              </div>
            </header>
          )}
          
          <main 
            ref={scrollContainerRef} 
            className="flex-1 overflow-y-auto no-scrollbar translate-z-0"
          >
            {renderContent()}
          </main>
          
          {/* Mobile Bottom Nav */}
          <nav className="flex-none fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-[60] shadow-2xl">
            {[
              { id: 'home', icon: '🏠', label: '首页' },
              { id: 'markets', icon: '📈', label: '行情' },
              { id: 'stock-query', icon: '🔍', label: '查股' },
              { id: 'private-society', icon: '🔱', label: '申请' },
              { id: 'about', icon: '🏛️', label: '关于' }
            ].map((nav) => (
              <button key={nav.id} onClick={() => handleTabChange(nav.id)} className={`flex flex-col items-center gap-1 active-scale ${activeTab === nav.id ? 'text-amber-600' : 'text-slate-400'}`}>
                <span className="text-xl">{nav.icon}</span>
                <span className="text-[8px] font-black uppercase tracking-widest">{nav.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-500">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-6 md:px-12 py-4 border-b border-slate-50 flex items-center justify-between h-16 md:h-24 z-50">
            <button onClick={() => setSelectedPost(null)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-slate-50 rounded-full text-2xl md:text-3xl text-slate-300 hover:text-slate-900 transition-all">✕</button>
            <Logo className="h-6 md:h-10" showText={false} />
            <div className="w-10 md:w-12"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 pb-40">
            <h1 className="fluid-h2 font-serif font-bold italic text-slate-900 mb-10 tracking-tighter leading-tight">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-16 pb-8 border-b border-slate-100">
               <span>{selectedPost.timestamp}</span>
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
               <span>Ridou Analytics</span>
            </div>
            <div className="fluid-body text-slate-700 whitespace-pre-wrap font-medium tracking-tight">
              {selectedPost.content}
            </div>
          </div>
        </div>
      )}

      {confirmingLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#020617]/60 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-white p-8 md:p-16 lg:p-20 rounded-[3rem] md:rounded-[4.5rem] max-w-2xl w-full shadow-2xl relative translate-z-0 overflow-hidden border border-slate-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
            <button onClick={() => setConfirmingLink(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 text-3xl transition-colors">✕</button>
            <div className="text-center">
               <h3 className="text-2xl md:text-3xl font-serif font-bold italic mb-6 tracking-tighter leading-tight text-slate-900">{confirmingLink.title}</h3>
               
               {confirmingLink.isWechat && (
                 <div className="mb-10 flex flex-col items-center">
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner mb-6 relative group">
                       <img 
                          src={WECHAT_QR_URL} 
                          alt="关注二维码" 
                          className="w-48 h-48 md:w-56 md:h-56 rounded-xl"
                          loading="lazy"
                       />
                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                          Official Verified
                       </div>
                    </div>
                    <p className="text-slate-900 font-bold text-lg md:text-xl mb-4 italic leading-relaxed">
                      请使用微信扫描上方提示或搜索<br/>"日斗投资咨询管理有限公司"关注官方公众号
                    </p>
                 </div>
               )}
               
               <p className="text-slate-500 text-sm md:text-base mb-10 leading-relaxed font-medium">
                 {confirmingLink.desc}
               </p>

               {confirmingLink.showBanner && <WechatSearchBanner className="mb-10" />}
               
               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => setConfirmingLink(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all">返回</button>
                 {confirmingLink.url !== '#' && (
                   <a href={confirmingLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmingLink(null)} className={`flex-1 py-5 text-white text-center rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${confirmingLink.isWechat ? 'bg-[#07C160] hover:bg-[#06ad56] shadow-emerald-900/20' : 'bg-slate-950 shadow-slate-900/20'}`}>立即前往 ↗</a>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {isAppModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-[#0f172a] w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-[3.5rem] md:rounded-[5rem] relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 p-8 md:p-16 lg:p-24">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-200 to-amber-600 opacity-60"></div>
             
             <button onClick={() => { setIsAppModalOpen(false); setSubmitSuccess(false); }} className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors text-4xl active-scale">✕</button>
             
             {!submitSuccess ? (
               <div className="page-enter">
                 <div className="space-y-6 mb-16 border-b border-white/5 pb-10">
                   <div className="flex items-center gap-3">
                     <span className="w-8 h-1 bg-amber-600 rounded-full"></span>
                     <span className="text-amber-500 text-[10px] font-black tracking-[0.6em] uppercase">Selection Admission</span>
                   </div>
                   <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold italic text-white tracking-tighter leading-none">席位申请</h2>
                   <p className="text-slate-400 text-lg md:text-2xl font-light leading-relaxed max-xl italic">
                     请提交您的真实背景，导师将在 24 小时内通过飞书与您建立逻辑共振。
                   </p>
                 </div>

                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   const res = await DataService.getInstance().submitApplication(appData);
                   if (res.success) setSubmitSuccess(true);
                 }} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                       <div className="space-y-4">
                         <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 block">您的称呼 / REAL NAME</label>
                         <input required value={appData.name} onChange={e=>setAppData({...appData, name:e.target.value})} placeholder="例如：张先生" className="w-full bg-white/[0.02] p-6 md:p-8 rounded-[1.5rem] border border-white/5 outline-none focus:border-amber-500 focus:bg-white/[0.05] text-xl text-white transition-all shadow-inner placeholder:text-slate-700" />
                       </div>
                       <div className="space-y-4">
                         <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 block">手机号 / FEISHU LINK</label>
                         <input required type="tel" value={appData.phone} onChange={e=>setAppData({...appData, phone:e.target.value})} placeholder="+86 138-xxxx-xxxx" className="w-full bg-white/[0.02] p-6 md:p-8 rounded-[1.5rem] border border-white/5 outline-none focus:border-amber-500 focus:bg-white/[0.05] text-xl text-white transition-all shadow-inner placeholder:text-slate-700" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 block">投资年限 / EXPERIENCE</label>
                        <select required value={appData.investYears} onChange={e=>setAppData({...appData, investYears:e.target.value})} className="w-full bg-white/[0.02] p-6 md:p-8 rounded-[1.5rem] border border-white/5 outline-none focus:border-amber-500 focus:bg-white/[0.05] text-xl text-white transition-all shadow-inner appearance-none cursor-pointer">
                          <option value="" className="bg-slate-900">请选择...</option>
                          <option value="1-3" className="bg-slate-900">1-3年 (入门探索)</option>
                          <option value="3-5" className="bg-slate-900">3-5年 (逻辑构建)</option>
                          <option value="5-10" className="bg-slate-900">5-10年 (资深投资)</option>
                          <option value="10+" className="bg-slate-900">10年以上 (穿越牛熊)</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 block">核心期待 / EXPECTATION</label>
                         <input value={appData.learningExpectation} onChange={e=>setAppData({...appData, learningExpectation:e.target.value})} placeholder="例如：半导体行业逻辑拆解" className="w-full bg-white/[0.02] p-6 md:p-8 rounded-[1.5rem] border border-white/5 outline-none focus:border-amber-500 focus:bg-white/[0.05] text-xl text-white transition-all shadow-inner placeholder:text-slate-700" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-4 block">投研痛点 / CORE PAINPOINT</label>
                      <textarea rows={3} value={appData.missingAbilities} onChange={e=>setAppData({...appData, missingAbilities:e.target.value})} placeholder="简述您目前遇到的投研瓶颈..." className="w-full bg-white/[0.02] p-6 md:p-8 rounded-[1.5rem] border border-white/5 outline-none focus:border-amber-500 focus:bg-white/[0.05] text-xl text-white transition-all shadow-inner placeholder:text-slate-700 resize-none" />
                    </div>

                    <div className="pt-8">
                      <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white py-8 md:py-10 rounded-[2rem] md:rounded-[2.5rem] font-black text-2xl md:text-3xl active-scale shadow-2xl transition-all border border-white/10 group">
                        提交席位申请 
                        <span className="inline-block ml-4 group-hover:translate-x-2 transition-transform">↗</span>
                      </button>
                    </div>
                 </form>
               </div>
             ) : (
               <div className="text-center py-20 space-y-12 page-enter max-w-3xl mx-auto">
                  <div className="relative inline-block">
                     <div className="w-40 h-40 md:w-56 md:h-56 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center mx-auto animate-pulse">
                        <i className="fas fa-check-circle text-6xl md:text-8xl text-emerald-500"></i>
                     </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-4xl md:text-6xl font-serif font-bold italic text-white tracking-tighter leading-tight">申请已同步逻辑中枢</h3>
                    <p className="text-slate-400 text-lg md:text-2xl font-light leading-relaxed italic max-w-2xl mx-auto">
                      您的背景逻辑已录入。导师将在 24 小时内通过飞书与您建立连接，请及时查看系统通知。
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 max-w-2xl mx-auto">
                      <p className="text-amber-500 font-bold text-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        私享会为免费公益项目，所有课程与交流均通过飞书平台进行
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-[4rem] p-10 md:p-14 space-y-12 backdrop-blur-3xl shadow-3xl text-left">
                     <div className="space-y-8">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                             <i className="fas fa-download"></i>
                          </span>
                          <h4 className="text-white text-xl font-bold">1. 检查飞书安装</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pl-14">
                           <a href="https://www.feishu.cn/download" target="_blank" className="bg-white/5 hover:bg-white/10 p-4 rounded-xl text-center text-xs text-white border border-white/5">PC 端访问</a>
                           <a href="https://www.feishu.cn/download" target="_blank" className="bg-white/5 hover:bg-white/10 p-4 rounded-xl text-center text-xs text-white border border-white/5">移动端下载</a>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
                             <i className="fas fa-user-shield"></i>
                          </span>
                          <h4 className="text-white text-xl font-bold">2. 开启关键搜索权限</h4>
                        </div>
                        <div className="pl-14">
                           <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                              <p className="text-amber-500 font-black text-sm italic">
                                设置 &gt; 隐私 &gt; <br/>
                                <span className="text-base">开启"允许通过手机号搜索我"</span>
                              </p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="h-px bg-white/5 w-1/3 mx-auto"></div>

                     <p className="text-slate-500 text-sm italic font-medium text-center">
                       * 日斗导师仅通过飞书联系，绝不拨打任何电话。如 24 小时内未收到飞书通知，请自查上述隐私设置。
                     </p>

                     <div className="pt-4">
                        <button 
                          onClick={() => { setIsAppModalOpen(false); setSubmitSuccess(false); }}
                          className="w-full bg-white hover:bg-slate-100 text-slate-950 py-6 rounded-2xl font-black text-xl active-scale transition-all shadow-xl"
                        >
                          返回财富广场
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;