
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
      console.error("Data Sync Failure", err);
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
        desc: "您即将跳转至微信关注‘日斗投资咨询有限公司’官方公众号。", 
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
      alert("提交失败，请检查网络。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostDetail = () => {
    if (!selectedPost) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar selection:bg-amber-100 touch-pan-y">
        <div className="h-[env(safe-area-inset-top)] bg-white/90 sticky top-0 z-30"></div>
        <div className="sticky top-[env(safe-area-inset-top)] bg-white/90 backdrop-blur-xl z-20 px-4 md:px-10 py-4 border-b border-slate-50 flex items-center justify-between">
          <button onClick={() => setSelectedPost(null)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900 active-scale">
             <span className="text-2xl font-light">✕</span>
          </button>
          <div className="flex flex-col items-center">
            <Logo className="h-6" showText={false} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1">Research Detail</span>
          </div>
          <div className="w-12"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-20 pb-40">
          <header className="mb-12">
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4">Report / {selectedPost.timestamp}</div>
            <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tighter italic">{selectedPost.title}</h1>
          </header>
          <article className="prose prose-slate prose-lg lg:prose-xl max-w-none mb-20">
            <div className="text-slate-600 text-lg md:text-xl leading-[1.8] whitespace-pre-wrap font-medium">{selectedPost.content}</div>
          </article>
          <div className="flex flex-wrap gap-3">
            {selectedPost.tags.map(tag => (
              <span key={tag} className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderHomeContent = () => (
    <div className="px-4 md:px-12 2xl:px-24 space-y-10 md:space-y-16 animate-in fade-in duration-700 max-w-[1920px] mx-auto">
      {/* Dynamic Index Bar */}
      <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-2 -mx-4 md:mx-0 px-4 md:px-0">
        {indices.map(idx => (
          <div key={idx.name} className="flex-shrink-0 md:flex-1 min-w-[170px] bg-white p-5 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-3 group hover:shadow-xl transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{idx.name}</span>
            <div className="flex items-end justify-between">
              <span className={`text-lg md:text-2xl font-black tabular-nums ${idx.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>{idx.value}</span>
              <span className={`text-xs font-bold ${idx.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{idx.change >= 0 ? '+' : ''}{idx.change}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Responsive Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-14 2xl:gap-20">
        <div className="lg:col-span-8 2xl:col-span-9 space-y-12">
          {/* Main Entrance Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => setActiveTab('strategy')} className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 rounded-[3rem] p-10 text-white cursor-pointer active-scale transition-all shadow-lg border-b-4 border-amber-700/20">
               <div className="relative z-10">
                 <h3 className="text-3xl font-black mb-2 italic tracking-tighter uppercase">深度策略</h3>
                 <p className="opacity-80 text-sm font-bold uppercase tracking-widest">Core Alpha Stream</p>
               </div>
               <span className="absolute -bottom-8 -right-8 text-9xl opacity-10 transition-transform group-hover:scale-110 group-hover:-rotate-12">🎯</span>
            </div>
            <div onClick={() => setActiveTab('daily-talk')} className="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-700 rounded-[3rem] p-10 text-white cursor-pointer active-scale transition-all shadow-lg border-b-4 border-rose-800/20">
               <div className="relative z-10">
                 <h3 className="text-3xl font-black mb-2 italic tracking-tighter uppercase">每日财经说</h3>
                 <p className="opacity-80 text-sm font-bold uppercase tracking-widest">Logic Decryption</p>
               </div>
               <span className="absolute -bottom-8 -right-8 text-9xl opacity-10 transition-transform group-hover:scale-110 group-hover:-rotate-12">🎙️</span>
            </div>
          </div>
          
          <div className="space-y-8">
            <h3 className="text-2xl md:text-4xl font-black text-slate-800 flex items-center gap-5 italic tracking-tighter uppercase">
              <span className="w-2.5 h-10 bg-amber-500 rounded-full"></span>
              精华投研
            </h3>
            <div className="grid grid-cols-1 gap-8">
              {posts.map(p => (
                <PostItem key={p.id} post={p} onClick={(post) => setSelectedPost(post)} />
              ))}
            </div>
          </div>
        </div>
        
        {/* News Feed - Column Sticky on Desktop */}
        <div className="lg:col-span-4 2xl:col-span-3 h-full hidden lg:block sticky top-36">
          <RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy': return <div className="p-4 md:p-12 text-center text-slate-400">深度策略模块正在载入...</div>;
      case 'daily-talk': return <div className="p-4 md:p-12 text-center text-slate-400">每日财经说正在载入...</div>;
      case 'private-society': return <div className="p-4 md:p-12 text-center text-slate-400">入驻系统同步中...</div>;
      case 'markets': return <div className="px-4 md:px-12 2xl:px-24 pb-20"><RealtimeQuotes indices={indices} /></div>;
      case 'about': return <div className="p-4 md:p-12 text-center text-slate-400">关于日斗载入中...</div>;
      case 'home':
      default: return renderHomeContent();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-slate-50 flex-col md:flex-row font-sans selection:bg-amber-100">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <main ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
          {activeTab !== 'private-society' && (
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-4 md:px-12 py-5 md:py-10 flex justify-between items-center border-b border-slate-100 h-16 md:h-auto">
              <div className="flex items-center gap-5 md:gap-8">
                <Logo className="h-10 md:h-14" showText={false} />
                <div className="h-8 md:h-12 w-px bg-slate-200 hidden md:block"></div>
                <h1 className="text-lg md:text-3xl font-black text-slate-800 uppercase tracking-tighter italic whitespace-nowrap">
                   {activeTab === 'home' ? '财富广场' : activeTab === 'markets' ? '行情中心' : activeTab === 'about' ? '关于日斗' : activeTab === 'strategy' ? '深度策略' : activeTab === 'daily-talk' ? '财经说' : ''}
                </h1>
              </div>
              <div className="flex items-center">
                <div className={`text-[10px] md:text-xs font-black uppercase px-5 py-2.5 md:px-8 md:py-4 rounded-full shadow-sm flex items-center gap-3 transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="tracking-widest hidden md:inline">{isOnline ? 'Network Active' : 'Offline'}</span>
                </div>
              </div>
            </header>
          )}
          
          <div className={`flex-1 ${activeTab === 'private-society' ? '' : 'pb-32 pt-8 md:pt-20'}`}>
            {renderContent()}
          </div>
        </main>
        
        {/* Mobile Tactile Bottom Navigation - Fixed for native feel */}
        <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 px-10 py-4 pb-[calc(12px+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-50 shadow-[0_-15px_50px_rgba(0,0,0,0.06)]">
          {[
            { id: 'home', icon: '🏠', label: '广场' },
            { id: 'markets', icon: '📈', label: '行情' },
            { id: 'private-society', icon: '🔱', label: '入驻' },
            { id: 'about', icon: '🏛️', label: '关于' }
          ].map((nav) => (
            <button 
              key={nav.id} 
              onClick={() => handleTabChange(nav.id)} 
              className={`flex flex-col items-center gap-1.5 transition-all active-scale relative px-3 ${activeTab === nav.id ? 'text-amber-600' : 'text-slate-400'}`}
            >
              <span className={`text-2xl transition-transform ${activeTab === nav.id ? 'scale-125 -translate-y-2.5' : ''}`}>
                {nav.icon}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeTab === nav.id ? 'opacity-100' : 'opacity-40'}`}>
                {nav.label}
              </span>
              {activeTab === nav.id && (
                <span className="absolute -bottom-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {renderPostDetail()}

      {confirmingLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
          <div className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
            <h3 className="text-2xl font-black mb-3 italic uppercase text-slate-900 tracking-tighter">{confirmingLink.title}</h3>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">{confirmingLink.desc}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmingLink(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs active-scale">返回</button>
              <a href={confirmingLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmingLink(null)} className={`flex-1 py-5 text-white text-center rounded-2xl font-black uppercase text-xs shadow-xl active-scale ${confirmingLink.isWechat ? 'bg-[#07C160]' : 'bg-amber-500 text-black'}`}>确认前往</a>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;
