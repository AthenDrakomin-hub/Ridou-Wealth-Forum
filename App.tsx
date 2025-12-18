
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PostItem from './components/PostItem';
import RealtimeQuotes from './components/RealtimeQuotes';
import RealtimeNewsFeed from './components/RealtimeNewsFeed';
import MarketCard from './components/MarketCard';
import Logo from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataService } from './services/api';
import { Post, NewsItem, MarketIndex, SocietyApplication, SectorData, StockData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [hotStocks, setHotStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appData, setAppData] = useState<SocietyApplication>({
    name: '', phone: '', investYears: '', missingAbilities: '', learningExpectation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [confirmingLink, setConfirmingLink] = useState<{ title: string; desc: string; url: string; isWechat?: boolean } | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const ds = DataService.getInstance();
    try {
      const [newsData, postsData, indexData, sectorData] = await Promise.all([
        ds.fetchNews(),
        ds.fetchForumPosts(),
        ds.fetchMarketIndices(),
        ds.fetchSectors()
      ]);

      setNews(newsData);
      setPosts(postsData);
      setIndices(indexData);
      setSectors(sectorData);
      
      if (activeTab === 'markets') {
        const symbols = ['SH688981', 'SH601138', 'SZ300059', 'SH600519'];
        const stockDetails = await Promise.all(symbols.map(s => ds.fetchStockData(s)));
        setHotStocks(stockDetails.filter(s => s !== null) as StockData[]);
      }
    } catch (err) {
      console.error("Data Synchronizer Failed", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'wechat-follow') {
      setConfirmingLink({ 
        title: "关注日斗官方号", 
        desc: "您即将跳转至微信关注‘日斗投资咨询有限公司’官方公众号。获取最新合规披露与市场一手笔记。", 
        url: "https://mp.weixin.qq.com/s/your_wechat_follow_page", 
        isWechat: true 
      });
    } else {
      setActiveTab(tabId);
      setSelectedPost(null);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await DataService.getInstance().submitApplication(appData);
      if (result.success) {
        setSubmitSuccess(result.message);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("提交失败。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostDetail = () => {
    if (!selectedPost) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar selection:bg-amber-100 touch-pan-y">
        <div className="h-[env(safe-area-inset-top)] bg-white/90 sticky top-0 z-30"></div>
        <div className="sticky top-[env(safe-area-inset-top)] bg-white/90 backdrop-blur-xl z-20 px-4 md:px-6 py-3 md:py-4 border-b border-slate-50 flex items-center justify-between">
          <button onClick={() => setSelectedPost(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900 active-scale">
             <span className="text-2xl">✕</span>
          </button>
          <div className="flex flex-col items-center">
            <Logo className="h-5 md:h-6" showText={false} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1">Research Detail</span>
          </div>
          <div className="w-10"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 md:px-12 py-8 md:py-16 pb-40">
          <div className="flex items-center gap-4 md:gap-5 mb-8 md:mb-16 pb-8 md:pb-10 border-b border-slate-100">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-slate-200 group transition-transform">
               <Logo className="h-8 md:h-10" showText={false} color="#FFFFFF" />
            </div>
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic">日斗投资</h2>
                <span className="bg-emerald-500 text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">官方认证</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                Ridou Investment Center <span className="hidden md:inline w-1 h-1 bg-slate-200 rounded-full"></span> <span className="md:hidden">/</span> 投研报告
              </p>
            </div>
          </div>
          <header className="mb-8 md:mb-12">
            <div className="text-[10px] md:text-[11px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4 md:mb-5">Report / {selectedPost.timestamp}</div>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 md:mb-8 leading-tight tracking-tighter italic">{selectedPost.title}</h1>
          </header>
          <article className="prose prose-slate prose-lg lg:prose-xl max-w-none mb-16 md:mb-20">
            <div className="text-slate-600 text-base md:text-lg lg:text-xl leading-[1.8] whitespace-pre-wrap font-medium font-sans">{selectedPost.content}</div>
          </article>
          <div className="space-y-12 md:space-y-16">
            <div className="flex flex-wrap gap-2 md:gap-2.5">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-slate-100">#{tag}</span>
              ))}
            </div>
          </div>
          <div className="mt-20 md:mt-24 pt-12 md:pt-16 border-t border-slate-50 text-center">
            <Logo className="h-5 md:h-6 mx-auto mb-6 opacity-30" showText={false} />
            <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-relaxed">
              Ridou Intel Hub · Private Data Stream <br/>
              风险提示：本报告内容仅供内部参考，严禁非法分发。
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderHomeContent = () => (
    <div className="px-4 md:px-10 2xl:px-16 space-y-8 md:space-y-12 animate-in fade-in duration-700 max-w-[1920px] mx-auto">
      {/* Index Cards with dynamic scrolling for mobile and grid for desktop */}
      <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-1 px-1 -mx-4 md:mx-0 px-4 md:px-0">
        {indices.map(idx => (
          <div key={idx.name} className="flex-shrink-0 md:flex-1 min-w-[160px] bg-white px-5 md:px-6 py-4 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 group hover:shadow-lg transition-all">
            <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{idx.name}</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm md:text-lg font-black tabular-nums ${idx.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>{idx.value}</span>
              <span className={`text-[9px] md:text-xs font-bold ${idx.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{idx.change >= 0 ? '+' : ''}{idx.change}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Main Grid: Adapts from 1-column to 12-column with 2xl specific spans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 2xl:gap-14">
        <div className="lg:col-span-8 2xl:col-span-9 space-y-8 md:space-y-12">
          {/* Top Entrance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div onClick={() => setActiveTab('strategy')} className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 text-white cursor-pointer active-scale transition-all border-b-4 border-amber-700/30">
               <div className="relative z-10">
                 <h3 className="text-2xl md:text-4xl font-black mb-3 italic tracking-tighter uppercase">日斗深度策略</h3>
                 <p className="opacity-80 text-sm md:text-lg font-bold">核心龙头 · 情绪周期博弈</p>
               </div>
               <span className="absolute -bottom-6 -right-6 text-7xl md:text-9xl opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000">🎯</span>
            </div>
            <div onClick={() => setActiveTab('daily-talk')} className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-700 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 text-white cursor-pointer active-scale transition-all border-b-4 border-rose-800/20">
               <div className="relative z-10">
                 <h3 className="text-2xl md:text-4xl font-black mb-3 italic tracking-tighter uppercase">每日财经说</h3>
                 <p className="opacity-80 text-sm md:text-lg font-bold">视频解读 · 盘中逻辑瞬达</p>
               </div>
               <span className="absolute -bottom-6 -right-6 text-7xl md:text-9xl opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000">🎙️</span>
            </div>
          </div>
          
          {/* Research List */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-4 italic tracking-tighter uppercase">
                <span className="w-2 md:w-2.5 h-8 md:h-10 bg-amber-500 rounded-full"></span>
                精华投研
              </h3>
              <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Latest Research</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
              {posts.map(p => (
                <PostItem key={p.id} post={p} onClick={(post) => setSelectedPost(post)} />
              ))}
            </div>
          </div>
        </div>
        
        {/* News Feed - Fixed width or flexible span on large screens */}
        <div className="lg:col-span-4 2xl:col-span-3 h-full hidden lg:block sticky top-32">
          <RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );

  const renderStrategyPage = () => (
    <div className="px-4 md:px-12 2xl:px-20 pb-20 animate-in fade-in duration-1000 max-w-[1920px] mx-auto">
      <div className="relative rounded-[3rem] md:rounded-[5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-black p-10 md:p-20 lg:p-24 2xl:p-32 overflow-hidden shadow-2xl border border-white/5 mb-16">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
          <span className="text-[15rem] md:text-[25rem] font-black italic leading-none">🎯</span>
        </div>
        <div className="relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-10 md:mb-12">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.4em]">Special Announcement</span>
          </div>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white italic tracking-tighter leading-[0.85] mb-10 md:mb-12 uppercase">
            重磅发布！<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">日斗策略</span> <br/>
            25篇实战合集
          </h1>
          <p className="text-slate-400 text-base md:text-2xl max-w-3xl leading-relaxed font-medium mb-12 md:mb-16">
            全场景覆盖短线交易，助您建立稳定盈利的交易系统。
          </p>
          <button 
            onClick={() => setConfirmingLink({ 
              title: "进入实战合集", 
              desc: "您即将跳转至微信查看 25 篇深度策略专辑。请确认已关注“日斗投资咨询”公众号。",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100037966654046208#wechat_redirect"
            })}
            className="bg-amber-500 text-black px-12 md:px-16 py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-2xl shadow-2xl shadow-amber-500/20 active-scale transition-all flex items-center gap-4 italic uppercase tracking-tighter"
          >
            立即获取完整专辑 ↗
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-8 md:gap-10">
        {[
          { cat: "市场策略分析", count: 3, icon: "📊", titles: ["2025年8月A股全景投资策略", "A股事件投资的四步心法", "快速回本+稳定复利核心密码"] },
          { cat: "短线交易系统建立", count: 4, icon: "🛠️", titles: ["如何建立稳定盈利交易系统", "“两大体系”重塑顶级系统", "反脆弱个人交易生态建立", "炒股养家交易本质解析"] },
          { cat: "实战交易技巧", count: 6, icon: "⚔️", titles: ["连板梯队博弈逻辑全解析", "买在低点、卖在高点挂单技巧", "短线三部曲之“补涨”", "3分钟读懂龙虎榜看穿聪明钱", "集合竞价供需关系深度分析", "老手游戏：抓确定性技巧"] },
          { cat: "顶级战法揭秘", count: 5, icon: "🔥", titles: ["彻底讲透“龙空龙”交易闭环", "3步复制王炸战法提高胜率", "瞄准“主升浪”复盘四步法", "龙头连板关键之换手板", "连板结构与龙头上涨核心"] },
          { cat: "技术分析基础", count: 3, icon: "📉", titles: ["职业炒股之换手率进阶干货", "龙头Vs低吸：一招看清偏好", "“照妖镜”四大法则抄底逃顶"] },
          { cat: "心态与风控", count: 3, icon: "🧠", titles: ["顶级游资心法修炼", "战胜心魔：控制回撤的关键", "大佬失败案例：风控的教训"] }
        ].map((block, i) => (
          <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group border-b-8 border-b-transparent hover:border-b-amber-500/10">
            <div className="flex justify-between items-start mb-8">
              <div className="text-5xl group-hover:scale-110 transition-transform duration-500">{block.icon}</div>
              <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{block.count} 篇内容</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-8 italic tracking-tight group-hover:text-amber-600 transition-colors uppercase">{block.cat}</h3>
            <ul className="space-y-4">
              {block.titles.map((t, idx) => (
                <li key={idx} className="flex gap-3 text-sm md:text-base text-slate-500 font-medium leading-relaxed group/item">
                  <span className="text-amber-500 font-black group-hover/item:scale-150 transition-transform">·</span>
                  <span className="group-hover/item:text-slate-900 transition-colors">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDailyTalkPage = () => (
    <div className="px-4 md:px-12 2xl:px-20 pb-32 animate-in fade-in duration-1000 max-w-[1920px] mx-auto">
      <div className="relative rounded-[3.5rem] md:rounded-[6rem] bg-gradient-to-br from-[#4c0519] via-[#881337] to-[#4c0519] p-10 md:p-24 2xl:p-32 overflow-hidden shadow-2xl border border-white/5 mb-16 group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <span className="text-[20rem] md:text-[30rem] font-black italic leading-none">🎙️</span>
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-16 lg:items-center">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-red-500/20 border border-red-500/30 mb-10 backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-black text-red-100 uppercase tracking-[0.4em]">LIVE ON AIR</span>
            </div>
            <h1 className="text-5xl md:text-8xl 2xl:text-9xl font-black text-white italic tracking-tighter mb-10 uppercase leading-[0.85]">日斗每日<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-white to-red-100">财经说</span></h1>
            <p className="text-red-100/60 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mb-12">
              每日早盘策略前瞻 + 盘后深度复盘。由日斗智库官方出品，通过毫秒级感知的市场逻辑解读。
            </p>
          </div>
          
          <div className="w-full lg:w-[480px] shrink-0">
            <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400/50 to-transparent"></div>
               <div className="flex justify-between items-center mb-10">
                 <div className="text-5xl">📢</div>
                 <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-red-500/20">New Episode</span>
               </div>
               
               <div className="mb-12">
                 <h4 className="text-white font-black italic text-2xl md:text-3xl mb-6 leading-tight">《明天大盘会继续上涨吗？》</h4>
                 <div className="space-y-5">
                    <div className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                       <span className="text-red-400 mt-1.5 text-lg">●</span>
                       <div className="flex-1">
                          <p className="text-white/80 text-sm font-black mb-1 uppercase tracking-widest">核心分析</p>
                          <p className="text-white/40 text-xs leading-relaxed font-medium">深度透视当前市场走势，预判明日大盘潜在走向及情绪转折点。</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                       <span className="text-red-400 mt-1.5 text-lg">●</span>
                       <div className="flex-1">
                          <p className="text-white/80 text-sm font-black mb-1 uppercase tracking-widest">操作建议</p>
                          <p className="text-white/40 text-xs leading-relaxed font-medium">给出具体的仓位控制配比、重点监控板块及防御性操作策略。</p>
                       </div>
                    </div>
                 </div>
               </div>
               
               <button 
                 onClick={() => setConfirmingLink({ 
                  title: "进入音频合集", 
                  desc: "您即将前往微信收听“日斗每日财经说”专辑。建议在安静环境下收听。",
                  url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100042146043101193#wechat_redirect"
                })}
                 className="w-full bg-white text-red-950 py-6 rounded-2xl md:rounded-[2rem] font-black uppercase text-base md:text-lg active-scale shadow-2xl transition-all hover:-translate-y-1"
               >
                 立即收听详情 ↗
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { title: "早盘策略前瞻", desc: "每个交易日开盘前发布，精准锚定当日波动中枢与博弈策略。", icon: "🌅", tag: "Strategy" },
          { title: "个股精选推荐", desc: "从万千标的中精选具备爆发潜质的核心池。", icon: "💎", tag: "Selection" },
          { title: "盘后复盘总结", desc: "穿透当日主力动向与情绪周期，还原行情波动的真实本质。", icon: "🌒", tag: "Review" },
          { title: "实时市场解读", desc: "针对盘中突发异动板块与消息面，提供毫秒级的专业逻辑导引。", icon: "⚡", tag: "Real-time" }
        ].map((f, i) => (
          <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-center mb-10">
              <span className="text-5xl group-hover:scale-125 transition-transform duration-500">{f.icon}</span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-50 px-4 py-1.5 rounded-full">{f.tag}</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-4 italic tracking-tight group-hover:text-red-600 transition-colors uppercase">{f.title}</h4>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarketsPage = () => (
    <div className="px-4 md:px-10 2xl:px-16 space-y-10 md:space-y-14 animate-in fade-in duration-700 pb-32 max-w-[1920px] mx-auto">
      <RealtimeQuotes indices={indices} summary={{ riseCount: 2842, fallCount: 1950, flatCount: 200, turnover: "9,850亿" }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 2xl:gap-16">
        <div className="lg:col-span-8 2xl:col-span-9 space-y-12 md:space-y-16">
          <div className="bg-[#0c0c0c] rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 text-white text-9xl font-black italic select-none">SECTORS</div>
            <h3 className="text-white font-black mb-12 md:mb-16 flex items-center gap-5 uppercase italic tracking-tighter text-2xl md:text-3xl relative z-10">
              <span className="w-2.5 h-10 md:w-3 md:h-12 bg-amber-500 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.6)]"></span>板块监控实时看板
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 relative z-10">
              {sectors.map((s, i) => (
                <div key={i} className="bg-white/5 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 active:bg-white/10 transition-all group cursor-pointer shadow-inner active-scale">
                  <span className="text-4xl md:text-5xl mb-6 block group-hover:scale-110 transition-transform">{s.icon}</span>
                  <div className="text-white/40 text-[10px] md:text-xs font-black uppercase mb-2 tracking-[0.3em] truncate">{s.name}</div>
                  <div className={`text-2xl md:text-4xl font-black tabular-nums ${s.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{s.change >= 0 ? '+' : ''}{s.change}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 md:gap-8">
            {hotStocks.map((s, i) => <MarketCard key={i} stock={s} />)}
          </div>
        </div>
        <div className="lg:col-span-4 2xl:col-span-3 h-full hidden lg:block sticky top-32">
          <RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy': return renderStrategyPage();
      case 'daily-talk': return renderDailyTalkPage();
      case 'private-society': return renderPrivateSociety();
      case 'markets': return renderMarketsPage();
      case 'about': return renderAboutUs();
      case 'home':
      default: return renderHomeContent();
    }
  };

  const renderPrivateSociety = () => (
    <div className="animate-in fade-in zoom-in-95 duration-1000">
      <section className="relative pt-12 md:pt-24 pb-24 md:pb-40 px-4 bg-[#080808] text-white min-h-screen overflow-hidden selection:bg-amber-500 selection:text-black">
        {/* Optimized background for large screens */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[200px] rounded-full animate-pulse"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <button onClick={() => setActiveTab('home')} className="mb-12 md:mb-20 inline-flex items-center gap-4 px-8 md:px-12 py-3 md:py-4 bg-white/5 rounded-full text-[10px] md:text-xs font-black tracking-[0.5em] uppercase border border-white/10 backdrop-blur-3xl active-scale transition-all hover:bg-white/10">
            ← BACK TO PLAZA
          </button>
          
          <h1 className="text-6xl md:text-[12rem] 2xl:text-[16rem] font-black mb-6 md:mb-12 italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/5 leading-[0.8] drop-shadow-2xl">
            RIDOU X 10TH
          </h1>
          <p className="text-amber-500 font-black mb-20 md:mb-32 tracking-[1em] md:tracking-[2em] uppercase text-xs md:text-lg">
            第十届财富论坛 · 核心投研基建
          </p>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/5 via-black/40 to-white/5 p-10 md:p-24 rounded-[4rem] md:rounded-[6rem] border border-white/5 mb-24 md:mb-40 text-left relative overflow-hidden backdrop-blur-xl">
            <h3 className="text-2xl md:text-4xl font-black mb-12 md:mb-20 flex items-center gap-6 italic tracking-tighter uppercase">
              <span className="w-3 md:w-4 h-10 md:h-14 bg-amber-500 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.6)]"></span>
              飞书数字基建配置指南
            </h3>
            
            <div className="space-y-20 md:space-y-28 relative">
              <div className="absolute left-[24px] md:left-[35px] top-8 bottom-8 w-px border-l border-dashed border-white/10"></div>
              
              {[
                { step: '01', title: '获取官方协作工具 (Feishu)', desc: '官方下载页面支持自动识别您的设备系统。请根据提示完成下载与安装。', link: 'https://www.feishu.cn/download', btn: '前往飞书官网下载中心', extra: '💻 📱' },
                { step: '02', title: '开启搜索权限 (核心设置)', desc: '进入 “设置” → “隐私” → 开启 “通过手机号搜索我”。', highlight: true },
                { step: '03', title: '极简数字连接协议', desc: '导师将仅通过飞书申请好友。日斗官方及导师绝不拨打任何形式的骚扰电话。', highlight: true }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-8 md:gap-14 relative group">
                  <div className="w-12 h-12 md:w-18 md:h-18 bg-amber-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center font-black text-black shrink-0 text-sm md:text-xl shadow-xl shadow-amber-500/10 group-hover:scale-110 transition-transform">{item.step}</div>
                  <div className="flex-1">
                    <h4 className={`font-black mb-5 uppercase text-base md:text-2xl tracking-widest italic ${item.highlight ? 'text-amber-500' : 'text-white'}`}>{item.title}</h4>
                    <p className="text-sm md:text-lg text-white/40 leading-relaxed mb-8 font-medium">{item.desc}</p>
                    {item.link && (
                      <div className="flex flex-col sm:flex-row gap-6">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-black px-10 py-5 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm active-scale flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/20 uppercase tracking-widest">
                          {item.btn}
                        </a>
                        <div className="flex gap-4 items-center px-6 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                           <span className="text-[10px] md:text-xs text-white/20 uppercase font-black tracking-widest">Supported:</span>
                           <span className="text-white/60 text-xl md:text-2xl">{item.extra}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group inline-block w-full md:w-auto px-6">
            <button onClick={() => setIsAppModalOpen(true)} className="w-full md:w-auto bg-amber-500 text-black px-16 md:px-32 py-8 md:py-12 rounded-[2.5rem] md:rounded-[4rem] font-black shadow-2xl active-scale text-xl md:text-4xl tracking-[0.2em] md:tracking-[0.5em] uppercase italic group-hover:shadow-amber-500/30 transition-all">
              立即免费申请席位
            </button>
            <p className="mt-8 text-white/20 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black">limited private access stream</p>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAboutUs = () => (
    <div className="animate-in fade-in duration-700 px-4 md:px-12 2xl:px-20 max-w-[1920px] mx-auto py-10 md:py-16">
      <div className="bg-white rounded-[3rem] md:rounded-[6rem] p-10 md:p-24 lg:p-32 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-5xl">
          <span className="text-amber-600 font-black tracking-[0.6em] text-[10px] md:text-xs uppercase mb-8 inline-block">About Ridou Investment</span>
          <h1 className="text-4xl md:text-8xl 2xl:text-9xl font-black text-slate-900 mb-10 md:mb-16 tracking-tighter uppercase italic leading-[0.9]">专注核心资产 <br/> 穿透波动迷雾</h1>
          <p className="text-lg md:text-3xl text-slate-500 leading-relaxed mb-16 md:mb-24 font-medium max-w-4xl">日斗财富论坛是由日斗投资发起的专业投研社区。始终坚持以“产业逻辑为锚，情绪博弈为桨”，连接具备独立深研能力的实战型投资者。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20 md:mb-32">
             <div className="bg-slate-50 p-10 md:p-14 rounded-[3.5rem] border border-slate-100 flex flex-col justify-between group">
                <div>
                  <h4 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3"><span className="w-2 h-6 bg-[#07C160] rounded-full"></span> 官方公众号 (Official)</h4>
                  <p className="text-xs md:text-base text-slate-500 mb-10 leading-relaxed font-medium">由 <span className="text-slate-900 font-bold">日斗投资咨询有限公司</span> 独立运营。作为合规研报发布与品牌披露的官方终端。</p>
                </div>
                <button onClick={() => handleTabChange('wechat-follow')} className="w-full bg-[#07C160] text-white py-6 md:py-8 rounded-[2rem] font-black active-scale shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3 text-lg group-hover:scale-[1.02] transition-transform">
                  <i className="fab fa-weixin text-2xl"></i> 前往关注
                </button>
             </div>
             <div className="bg-slate-50 p-10 md:p-14 rounded-[3.5rem] border border-slate-100 flex flex-col justify-center">
                <h4 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3"><span className="w-2 h-6 bg-amber-500 rounded-full"></span> 企业主体 (Compliance)</h4>
                <p className="text-xs md:text-base text-slate-500 leading-relaxed font-medium">
                  日斗投研内容仅供交流探讨。实际主体为 <span className="text-slate-900 font-bold">日斗投资咨询有限公司</span>。请认准官方飞书及微信渠道，防范任何冒名电话或诱导性转账请求。
                </p>
             </div>
          </div>
          <div className="pt-12 border-t border-slate-100">
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">运营主体：日斗投资咨询有限公司 | Ridou Investment Consulting Co., Ltd. (Compliance No. 20250812)</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-slate-50 flex-col md:flex-row font-sans selection:bg-amber-100">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <main ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
          {activeTab !== 'private-society' && (
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 md:px-10 py-4 md:py-8 flex justify-between items-center border-b border-slate-100 h-16 md:h-auto">
              <div className="flex items-center gap-4 md:gap-6">
                <Logo className="h-8 md:h-12" showText={false} />
                <div className="h-6 md:h-10 w-px bg-slate-200 hidden md:block"></div>
                <h1 className="text-base md:text-2xl font-black text-slate-800 uppercase tracking-tighter italic whitespace-nowrap">
                   {activeTab === 'home' ? '财富广场' : activeTab === 'markets' ? '行情中心' : activeTab === 'about' ? '关于日斗' : activeTab === 'strategy' ? '深度策略' : activeTab === 'daily-talk' ? '财经说' : ''}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-[10px] md:text-xs font-black uppercase px-4 py-2 md:px-6 md:py-3 rounded-full shadow-sm flex items-center gap-3 transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="tracking-widest hidden md:inline">{isOnline ? 'Active Connection' : 'Offline'}</span>
                </div>
              </div>
            </header>
          )}
          
          <div className={`flex-1 ${activeTab === 'private-society' ? '' : 'pb-32 pt-6 md:pt-14'}`}>
            {renderContent()}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation Bar - Optimized for tactile feel */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-2xl border-t border-slate-100 px-8 py-3 pb-[calc(10px+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-50 shadow-[0_-12px_45px_rgba(0,0,0,0.08)]">
          {[
            { id: 'home', icon: '🏠', label: '广场' },
            { id: 'markets', icon: '📈', label: '行情' },
            { id: 'private-society', icon: '🔱', label: '入驻' },
            { id: 'about', icon: '🏛️', label: '关于' }
          ].map((nav) => (
            <button 
              key={nav.id} 
              onClick={() => handleTabChange(nav.id)} 
              className={`flex flex-col items-center gap-1 transition-all active-scale relative py-1 px-4 ${activeTab === nav.id ? 'text-amber-600' : 'text-slate-400'}`}
            >
              <span className={`text-2xl transition-transform ${activeTab === nav.id ? 'scale-125 -translate-y-2' : ''}`}>
                {nav.icon}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === nav.id ? 'opacity-100' : 'opacity-60'}`}>
                {nav.label}
              </span>
              {activeTab === nav.id && (
                <span className="absolute -bottom-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,1)]"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {renderPostDetail()}

      {confirmingLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
          <div className="bg-white p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
            <h3 className="text-2xl md:text-3xl font-black mb-3 italic uppercase text-slate-900 tracking-tighter">{confirmingLink.title}</h3>
            <p className="text-slate-500 text-sm md:text-base mb-10 leading-relaxed font-medium">{confirmingLink.desc}</p>
            <div className="flex gap-4 md:gap-6">
              <button onClick={() => setConfirmingLink(null)} className="flex-1 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs md:text-sm active-scale">返回</button>
              <a href={confirmingLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmingLink(null)} className={`flex-1 py-4 md:py-5 text-white text-center rounded-2xl font-black uppercase text-xs md:text-sm shadow-xl active-scale transition-all hover:brightness-110 ${confirmingLink.isWechat ? 'bg-[#07C160]' : 'bg-amber-500 text-black'}`}>确认前往</a>
            </div>
          </div>
        </div>
      )}

      {isAppModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl overflow-y-auto">
          <div className="bg-[#111] w-full max-w-2xl p-12 md:p-20 rounded-[4rem] md:rounded-[5rem] text-white relative shadow-2xl border border-white/5">
             <button onClick={() => setIsAppModalOpen(false)} className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors text-3xl">✕</button>
             {submitSuccess ? (
               <div className="text-center animate-in zoom-in py-10">
                  <div className="text-8xl mb-10">✨</div>
                  <h2 className="text-3xl md:text-5xl font-black mb-6 italic uppercase text-amber-500 tracking-tighter">申请已同步</h2>
                  <p className="text-slate-400 text-sm md:text-lg mb-12 leading-relaxed font-bold max-w-md mx-auto">请确保飞书开启“通过手机号搜索我”。导师将在 24 小时内发起连接。日斗坚持极简数字社交。</p>
                  <button onClick={() => {setIsAppModalOpen(false); setSubmitSuccess(null);}} className="w-full bg-white text-black py-6 md:py-8 rounded-3xl font-black uppercase italic shadow-2xl active-scale text-lg">我已知晓 · 开启飞书</button>
               </div>
             ) : (
               <>
                 <h2 className="text-4xl md:text-6xl font-black mb-3 md:mb-6 italic uppercase tracking-tighter">私享席位申请</h2>
                 <p className="text-white/20 text-[10px] md:text-xs mb-12 md:mb-16 uppercase tracking-[0.5em] font-black">Ridou Intel Core Stream Admission</p>
                 <form onSubmit={handleFormSubmit} className="space-y-8 md:space-y-12">
                    <div className="space-y-3">
                      <label className="text-[10px] md:text-xs font-black text-white/30 uppercase ml-2 tracking-widest">真实姓名</label>
                      <input required value={appData.name} onChange={e=>setAppData({...appData, name:e.target.value})} placeholder="如何称呼您" className="w-full bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 outline-none focus:border-amber-500/50 transition-colors font-bold text-lg" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] md:text-xs font-black text-white/30 uppercase ml-2 tracking-widest">飞书注册手机号</label>
                      <input required type="tel" value={appData.phone} onChange={e=>setAppData({...appData, phone:e.target.value})} placeholder="唯一连接凭证" className="w-full bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 outline-none focus:border-amber-500/50 transition-colors font-bold text-lg" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-black py-6 md:py-9 rounded-3xl md:rounded-[2.5rem] font-black text-xl md:text-2xl shadow-2xl active-scale transition-all uppercase italic mt-6 group hover:brightness-110">
                      {isSubmitting ? '同步中...' : '提交入驻申请'}
                    </button>
                 </form>
               </>
             )}
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;
