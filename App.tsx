
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
               设置 > 隐私 > <br/>
               <span className="text-lg">开启“通过手机号搜索我”</span>
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
        日斗秉持“低摩擦、高价值”的沟通原则。我们<span className="text-amber-500 font-black px-1 underline underline-offset-4 decoration-amber-500/30">承诺绝不拨打任何电话</span>。所有连接申请均由导师通过飞书账号实名发起，请在申请后留意飞书系统通知。
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = useCallback(async () => {
    const ds = DataService.getInstance();
    setDbConnected(ds.isConnected());
    try {
      const [newsData, postsData, indexData] = await Promise.all([
        ds.fetchNews(),
        ds.fetchForumPosts(),
        ds.fetchMarketIndices()
      ]);

      if (lastSeenNewsId && newsData.length > 0 && newsData[0].id !== lastSeenNewsId) {
        const newIndex = newsData.findIndex(item => item.id === lastSeenNewsId);
        const count = newIndex === -1 ? newsData.length : newsData.length;
        if (count > 0) setUnreadNewsCount(prev => prev + count);
      } else if (!lastSeenNewsId && newsData.length > 0) {
        setLastSeenNewsId(newsData[0].id);
      }

      setNews(newsData);
      setPosts(postsData);
      setIndices(indexData);
    } catch (err) {
      console.error("Data sync error", err);
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

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: SearchSuggestion[] = [];

    indices.forEach(idx => {
      if (idx.name.toLowerCase().includes(query)) {
        results.push({ id: `idx-${idx.name}`, type: '行情', title: idx.name, data: idx });
      }
    });

    posts.forEach(p => {
      if (p.title.toLowerCase().includes(query)) {
        results.push({ id: `post-${p.id}`, type: '研报', title: p.title, data: p });
      }
    });

    news.forEach(n => {
      if (n.title.toLowerCase().includes(query)) {
        results.push({ id: `news-${n.id}`, type: '快讯', title: n.title, data: n });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, indices, posts, news]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    if (suggestion.type === '研报') {
      setSelectedPost(suggestion.data);
    } else if (suggestion.type === '行情') {
      handleTabChange('markets');
    } else if (suggestion.type === '快讯') {
      handleTabChange('home');
    }
  };

  const homeContent = useMemo(() => (
    <div className="adaptive-container space-y-8 md:space-y-16 px-4 py-6 md:py-12 page-enter">
      <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-8 lg:gap-10 xl:gap-12 3xl:gap-16">
        {indices.map(idx => (
          <div key={idx.name} className="premium-card p-6 md:p-8 2xl:p-10 3xl:p-12 rounded-[1.5rem] md:rounded-[2.5rem] 3xl:rounded-[3.5rem] bg-white border border-slate-50 group hover:-translate-y-2 transition-transform duration-500 shadow-sm hover:shadow-2xl">
            <p className="text-[9px] md:text-[11px] 2xl:text-xs 3xl:text-sm font-black text-slate-400 mb-4 md:mb-6 uppercase tracking-[0.2em]">{idx.name}</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-1">
              <span className={`text-xl md:text-3xl 2xl:text-4xl 3xl:text-5xl font-black tabular-nums tracking-tighter ${idx.change >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] md:text-xs 2xl:text-sm 3xl:text-base font-black px-2 py-0.5 rounded-lg w-fit ${idx.change >= 0 ? 'bg-red-50 text-red-400' : 'bg-emerald-50 text-emerald-500'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
        <div className="lg:col-span-8 space-y-10 md:space-y-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 lg:gap-10">
            <div onClick={() => handleTabChange('strategy')} className="bg-[#0f172a] p-8 md:p-12 rounded-[2.5rem] text-white cursor-pointer active-scale shadow-2xl group border border-white/5 relative overflow-hidden transition-all duration-500">
               <div className="flex justify-between items-start mb-8 md:mb-12 relative z-10">
                 <h3 className="text-2xl md:text-4xl font-serif font-bold italic tracking-tighter">日斗策略</h3>
                 <span className="text-amber-500 text-xl md:text-2xl opacity-40 group-hover:opacity-100 italic">25 articles</span>
               </div>
               <p className="font-black text-slate-500 text-[10px] uppercase tracking-[0.4em]">Strategic Intelligence Hub</p>
            </div>
            <div onClick={() => handleTabChange('daily-talk')} className="bg-amber-600 p-8 md:p-12 rounded-[2.5rem] text-white cursor-pointer active-scale shadow-2xl group border border-amber-500 relative overflow-hidden transition-all duration-500">
               <div className="flex justify-between items-start mb-8 md:mb-12 relative z-10">
                 <h3 className="text-2xl md:text-4xl font-serif font-bold italic text-slate-950 tracking-tighter">财经说</h3>
                 <span className="text-white text-xl md:text-2xl opacity-40 group-hover:opacity-100 italic">Daily Feed</span>
               </div>
               <p className="font-black text-amber-950/40 text-[10px] uppercase tracking-[0.4em]">Morning & Evening Update</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 md:pb-10">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 flex items-center gap-4 italic tracking-tight uppercase">
                <span className="w-1 h-6 md:h-8 bg-amber-600 rounded-full"></span>
                精华内参
              </h3>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hidden sm:block">Premium Feed</span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:gap-10">
              {posts.map(p => (
                <PostItem key={p.id} post={p} onClick={(post) => setSelectedPost(post)} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 sticky top-8 h-fit hidden lg:block">
          <Suspense fallback={<ComponentLoader />}>
            <RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} />
          </Suspense>
        </div>
      </div>
    </div>
  ), [indices, posts, news, loading, handleTabChange, fetchData]);

  const strategyPage = useMemo(() => (
    <div className="adaptive-container px-4 py-8 md:py-16 space-y-12 page-enter">
      <div className="relative min-h-[500px] md:min-h-[700px] bg-[#020617] rounded-[2.5rem] md:rounded-[5rem] p-8 md:p-24 lg:p-32 text-white overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border border-white/10 group transition-all duration-1000">
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#020617] to-black"></div>
          <div className="absolute -top-[10%] -right-[5%] w-[60%] h-[70%] bg-amber-600/10 blur-[180px] rounded-full animate-pulse transition-opacity duration-1000 opacity-80"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[80%] bg-blue-900/15 blur-[200px] rounded-full opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
             <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent rotate-12 -translate-x-full animate-[shimmer_8s_infinite]"></div>
             <div className="absolute top-0 right-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-200 to-transparent -rotate-12 translate-x-full animate-[shimmer_12s_infinite_reverse]"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-white/[0.015] blur-[150px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.04] mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-[0.02] mix-blend-soft-light"></div>
          <div className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none">
             <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <filter id='noiseFilter'>
                  <feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/>
                </filter>
                <rect width='100%' height='100%' filter='url(#noiseFilter)' opacity="0.3"/>
             </svg>
          </div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-transparent rounded-full shadow-[0_0_10px_rgba(192,149,14,0.5)]"></div>
            <span className="text-amber-500 text-[11px] font-black uppercase tracking-[0.6em] opacity-90 drop-shadow-md">Strategy Intelligence</span>
          </div>
          <h1 className="fluid-h1 font-serif font-bold italic mb-10 md:mb-16 tracking-tighter leading-none">
            深度策略<br/>
            <span className="bg-gradient-to-r from-amber-200 via-amber-500 to-amber-100 bg-clip-text text-transparent drop-shadow-2xl">逻辑专刊</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-slate-300 mb-14 md:mb-24 font-light leading-relaxed italic max-w-2xl border-l-2 border-amber-600/30 pl-10">
            穿透市场噪音，重构产业逻辑。日斗投研团队诚意出品 <span className="text-amber-500 font-bold">25 篇</span> 策略深度专辑，涵盖从宏观因子到微观壁垒的全链条拆解。
          </p>
          <div className="flex flex-wrap gap-8 items-center">
            <button 
              onClick={() => setConfirmingLink({ 
                title: "订阅深度专辑", 
                desc: "即将跳转至微信查看 25 篇策略全集专栏。建议在微信内收藏该专辑以便实时追踪逻辑更新。",
                url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100037966654046208#wechat_redirect"
              })}
              className="group relative bg-amber-600 hover:bg-amber-500 text-white px-12 py-7 md:px-20 md:py-10 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl active-scale transition-all shadow-[0_25px_60px_-15px_rgba(192,149,14,0.4)] border border-amber-400/20"
            >
              阅读全部 25 篇策略 ↗
            </button>
            <div className="flex flex-col gap-4">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[12px] font-bold text-slate-400 shadow-xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/10 to-transparent"></div>
                      <i className="fas fa-user-shield relative z-10"></i>
                   </div>
                 ))}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 border-l border-white/5">
                  12.5k+ Readers Joined · Top Tier Analytics
               </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-16 -right-16 text-[25rem] text-white opacity-[0.015] rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-[3000ms] pointer-events-none font-serif font-black italic select-none">
          RIDOU
        </div>
        <div className="absolute top-10 right-10 w-24 h-24 border border-amber-500/20 rounded-full flex items-center justify-center opacity-30 animate-spin-slow">
           <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
        </div>
      </div>
    </div>
  ), []);

  const aboutPage = useMemo(() => (
    <div className="relative min-h-full overflow-x-hidden page-enter pb-32 md:pb-56">
      <div className="absolute inset-0 -z-10 bg-[#000000] pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[150vh] bg-gradient-to-b from-[#020617] via-[#000000] to-[#020617]"></div>
        <div className="absolute top-[5%] -left-[10%] w-[80%] h-[60%] bg-amber-600/5 blur-[200px] rounded-full animate-pulse opacity-70"></div>
        <div className="absolute bottom-[10%] -right-[15%] w-[70%] h-[70%] bg-blue-600/5 blur-[200px] rounded-full opacity-60"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="adaptive-container px-6 py-20 md:py-40 space-y-40 md:space-y-64">
        <section className="text-center space-y-16 md:space-y-24 relative">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full scale-150 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
            <Logo className="h-32 md:h-64 lg:h-80 mx-auto drop-shadow-[0_40px_80px_rgba(192,149,14,0.4)] relative z-10 transition-transform duration-1000 group-hover:scale-105" showText={false} />
          </div>
          <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="fluid-h1 font-serif font-bold italic text-white tracking-tighter uppercase leading-[0.82]">
              逻辑驱动<br/>
              <span className="bg-gradient-to-r from-amber-100 via-amber-500 to-amber-800 bg-clip-text text-transparent">复利人生</span>
            </h1>
            <div className="flex flex-col items-center gap-4">
              <div className="h-0.5 w-16 bg-amber-600 rounded-full opacity-50"></div>
              <p className="text-[10px] md:text-xs font-black text-amber-500/70 uppercase tracking-[1em] md:tracking-[1.2em]">Logic Driven · Compound · Intelligent</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {[
            { title: '极致专业', desc: '以产业逻辑为锚点，穿透市场情绪噪音。', icon: '💎', color: 'amber' },
            { title: '协作共生', desc: '基于飞书数字底座，构建极低摩擦的研报共享。', icon: '🤝', color: 'blue' },
            { title: '长期主义', desc: '不赌博、不投机，只赚取逻辑兑现的确定性。', icon: '⏳', color: 'slate' }
          ].map((val, i) => (
            <div key={i} className="group p-12 md:p-16 bg-white/[0.01] border border-white/[0.05] rounded-[4rem] hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-700 hover:-translate-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <span className="text-5xl mb-12 block transform transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6">{val.icon}</span>
              <h3 className="text-3xl font-serif font-bold italic text-white mb-6">{val.title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed font-light italic">{val.desc}</p>
            </div>
          ))}
        </section>

        <section className="relative rounded-[4rem] md:rounded-[8rem] p-12 md:p-32 lg:p-40 border border-white/[0.08] bg-gradient-to-br from-slate-900/40 to-black/80 backdrop-blur-3xl overflow-hidden group shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)]">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center relative z-10">
              <div className="lg:col-span-7 space-y-16 md:space-y-20">
                 <div className="space-y-6">
                    <h2 className="fluid-h2 font-serif font-bold italic text-white tracking-tighter leading-none">
                      日斗投资管理<br/>
                      <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600 bg-clip-text text-transparent">有限公司</span>
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="h-1 w-20 bg-amber-600 rounded-full"></div>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-60">Registered & Certified</span>
                    </div>
                 </div>
                 
                 <p className="text-xl md:text-3xl text-slate-400 font-light leading-relaxed italic max-w-3xl border-l-2 border-amber-600/20 pl-10">
                   我们不是一家传统的资产管理公司。我们是一个由深度研究者、产业专家组成的智慧共同体，旨在寻找那些被市场低估的“逻辑锚点”。
                 </p>

                 <div className="space-y-12">
                    <p className="text-[11px] font-black text-amber-500/60 uppercase tracking-[0.6em]">Official Digital Presence</p>
                    <WechatSearchBanner 
                      onClick={() => setConfirmingLink({
                        title: "关注日斗官方",
                        desc: "请使用微信扫描下方提示或搜索“日斗投资咨询管理有限公司”关注官方公众号。",
                        url: "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzk2ODAzMDA2Ng==#wechat_redirect",
                        isWechat: true,
                        showBanner: false
                      })}
                      className="mx-0 border-white/5 shadow-inner scale-100" 
                    />
                 </div>

                 <div className="pt-8 flex flex-col sm:flex-row items-center gap-10">
                   <div className="bg-white/5 p-4 rounded-[2rem] border border-amber-500/20 shadow-[0_0_40px_rgba(192,149,14,0.1)] group/qr">
                      <img 
                        src={WECHAT_QR_URL} 
                        alt="日斗官方二维码" 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-xl transition-transform duration-500 group-hover/qr:scale-105"
                        loading="lazy"
                      />
                   </div>
                   <div className="text-center sm:text-left space-y-4">
                      <p className="text-white font-bold text-lg md:text-xl">官方微信二维码</p>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed italic max-w-xs">
                        使用微信扫描左侧二维码，<br/>
                        或搜索“日斗投资咨询管理有限公司”关注。
                      </p>
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-8 pt-8">
                    <button onClick={() => setConfirmingLink({
                      title: "关注日斗官方",
                      desc: "请使用微信扫描下方提示或搜索“日斗投资咨询管理有限公司”关注官方公众号。",
                      url: "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzk2ODAzMDA2Ng==#wechat_redirect",
                      isWechat: true,
                      showBanner: false
                    })} className="bg-[#07C160] hover:bg-[#06ad56] text-white px-12 py-6 md:px-16 md:py-10 rounded-[2.5rem] font-black text-lg transition-all shadow-3xl shadow-emerald-900/30 active-scale flex items-center gap-4 group/btn">
                      <i className="fab fa-weixin text-2xl group-hover/btn:rotate-12 transition-transform"></i>
                      立即跳转关注
                    </button>
                    <button onClick={() => setActiveTab('private-society')} className="bg-white/5 border border-white/10 text-white px-12 py-6 md:px-16 md:py-10 rounded-[2.5rem] font-black text-lg hover:bg-white/10 transition-all backdrop-blur-xl border-white/20">
                      查看飞书指南
                    </button>
                 </div>
              </div>

              <div className="lg:col-span-5 hidden lg:flex flex-col gap-12 relative">
                <div className="absolute -inset-20 bg-amber-500/5 blur-[150px] rounded-full animate-pulse"></div>
                
                <div className="relative p-16 bg-white/[0.02] border border-white/[0.08] rounded-[5rem] shadow-3xl backdrop-blur-3xl -rotate-3 hover:rotate-0 transition-all duration-1000 group/quote">
                   <div className="mb-10 text-amber-600/40 group-hover/quote:text-amber-500 transition-colors">
                      <i className="fas fa-quote-left text-5xl"></i>
                   </div>
                   <p className="text-4xl xl:text-5xl text-white font-serif italic font-bold leading-tight tracking-tighter">“数字基建：飞书协同，逻辑共振。”</p>
                   <div className="mt-16 flex items-center gap-6">
                      <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <i className="fas fa-gem text-amber-500"></i>
                      </div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Ridou Executive Committee</span>
                   </div>
                </div>

                <div className="relative p-12 bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-600/10 rounded-[4rem] shadow-2xl self-end max-w-sm rotate-6 hover:rotate-0 transition-all duration-1000 delay-150">
                   <p className="text-slate-400 text-base italic font-medium leading-relaxed">
                     所有入驻私享会的成员均通过飞书实现毫秒级协同。我们拒绝传统干扰，只在云端共享智慧。
                   </p>
                </div>
              </div>
           </div>
        </section>
        
        <section className="text-center pt-32 pb-20 border-t border-white/[0.03]">
           <div className="flex flex-col items-center gap-6">
             <div className="flex items-center gap-8 text-[11px] font-black text-slate-700 uppercase tracking-widest">
               <span className="hover:text-amber-500 transition-colors cursor-pointer">Compliance</span>
               <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
               <span className="hover:text-amber-500 transition-colors cursor-pointer">Security</span>
               <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
               <span className="hover:text-amber-500 transition-colors cursor-pointer">Terms</span>
             </div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] opacity-50">Copyright © 2025 Ridou Investment Consulting Co., Ltd.</p>
           </div>
        </section>
      </div>
    </div>
  ), []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return homeContent;
      case 'strategy': return strategyPage;
      case 'daily-talk': return (
        <div className="adaptive-container px-4 py-12 md:py-24 space-y-12 page-enter text-center">
           <h1 className="fluid-h1 font-serif font-bold italic text-slate-900 leading-none">每日财经说</h1>
           <div className="max-w-4xl mx-auto bg-slate-50 p-12 md:p-24 rounded-[3rem] md:rounded-[5rem] border border-slate-100 shadow-inner">
             <p className="text-lg md:text-2xl text-slate-500 mb-12 font-light">逻辑不断，复利永生。每日早盘提示与盘后深度复盘。</p>
             <button 
                onClick={() => setConfirmingLink({ 
                  title: "阅读日更专辑", 
                  desc: "即将前往微信查看《每日财经说》日更新专辑合集。",
                  url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100042146043101193#wechat_redirect"
                })}
                className="bg-slate-950 text-white px-12 py-6 md:px-20 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black text-xl active-scale shadow-2xl"
             >
               查阅复盘笔记 ↗
             </button>
           </div>
        </div>
      );
      case 'markets': return (
        <div className="adaptive-container px-4 py-8 md:py-16 space-y-12 page-enter pt-8 pb-32">
          <Suspense fallback={<ComponentLoader />}>
            <RealtimeQuotes indices={indices} />
          </Suspense>
        </div>
      );
      case 'private-society': return (
        <div className="min-h-full bg-slate-950 overflow-y-auto page-enter pt-24 pb-40">
          <div className="adaptive-container px-6 space-y-24">
            <div className="max-w-5xl mx-auto bg-[#0f172a] rounded-[3rem] md:rounded-[6rem] p-12 md:p-24 text-white border border-white/5 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <i className="fas fa-gem text-[10rem] rotate-12"></i>
              </div>
              <h2 className="fluid-h2 font-serif font-bold italic mb-10 tracking-tighter relative z-10">日斗私享会</h2>
              <p className="text-xl md:text-3xl text-slate-400 font-light mb-16 leading-relaxed relative z-10 italic max-w-2xl">
                加入日斗核心研报圈层，解锁极密策略内参。我们坚持数字协同，仅通过飞书建立联系。
              </p>
              <button 
                onClick={() => setIsAppModalOpen(true)}
                className="w-full bg-amber-600 hover:bg-amber-500 py-8 md:py-12 rounded-3xl md:rounded-[3.5rem] font-black text-2xl md:text-4xl active-scale shadow-3xl shadow-amber-600/20 relative z-10"
              >
                立即开启申请 ↗
              </button>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <FeishuGuideSection />
            </div>
          </div>
        </div>
      );
      case 'about': return aboutPage;
      default: return homeContent;
    }
  };

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 flex bg-[#fdfdfd] flex-col md:flex-row font-sans overflow-hidden lock-horizontal">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        <div className="flex-1 h-full flex flex-col relative overflow-hidden">
          {activeTab !== 'private-society' && (
            <header className="flex-none z-50 glass-nav px-6 md:px-12 border-b border-slate-100 flex justify-between items-center h-16 md:h-28 lg:h-32">
              <div className="flex items-center gap-4 md:gap-6 flex-1">
                <Logo className="h-8 md:h-12 lg:h-16" showText={false} />
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 shrink-0">
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-serif font-bold italic text-slate-900 uppercase tracking-tighter">
                    {activeTab === 'home' ? '广场' : activeTab === 'markets' ? '行情中心' : activeTab === 'about' ? '关于日斗' : activeTab === 'strategy' ? '投研策略' : '财经说'}
                  </h1>
                  {unreadNewsCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2 bg-amber-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg shadow-amber-600/30 animate-pulse active-scale hover:bg-amber-500 transition-all"
                    >
                      <i className="fas fa-bolt text-[10px]"></i>
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">
                        {unreadNewsCount} 新
                      </span>
                    </button>
                  )}
                </div>

                <div ref={searchRef} className="relative hidden lg:flex items-center flex-1 max-w-md ml-8">
                  <div className="absolute left-4 text-slate-400">
                    <i className="fas fa-search"></i>
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="搜索投研报告、行情、快讯..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-full py-3 pl-12 pr-4 outline-none focus:border-amber-500 focus:bg-white transition-all text-sm font-medium"
                  />
                  {isSearchFocused && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="max-h-96 overflow-y-auto no-scrollbar">
                        {searchSuggestions.map((s) => (
                          <button 
                            key={s.id}
                            onClick={() => handleSuggestionClick(s)}
                            className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center gap-4 transition-colors group"
                          >
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase shrink-0 ${
                              s.type === '研报' ? 'bg-amber-50 text-amber-600' : 
                              s.type === '行情' ? 'bg-blue-50 text-blue-600' : 
                              'bg-red-50 text-red-600'
                            }`}>
                              {s.type}
                            </span>
                            <span className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-950">{s.title}</span>
                            <i className="fas fa-chevron-right ml-auto text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-all"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 ml-4 shrink-0">
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
          <nav className="flex-none fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 px-6 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-[60] shadow-2xl">
            {[
              { id: 'home', icon: '🏠', label: '广场' },
              { id: 'markets', icon: '📈', label: '行情' },
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
                      请使用微信扫描上方提示或搜索<br/>“日斗投资咨询管理有限公司”关注官方公众号
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
                                设置 > 隐私 > <br/>
                                <span className="text-base">开启“允许通过手机号搜索我”</span>
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
