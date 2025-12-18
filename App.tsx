
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
  const [isManageMode, setIsManageMode] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [hotStocks, setHotStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: '', content: '', author: '日斗投资', avatar: '',
    tags: [], isFeatured: false
  });

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
    if (tabId === 'strategy' || tabId === 'daily-talk' || tabId === 'wechat-follow') {
      const links = {
        'strategy': { title: "日斗深度策略", desc: "您即将访问日斗智库官方微信研报合集。", url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100037966654046208#wechat_redirect" },
        'daily-talk': { title: "日斗每日财经说", desc: "您即将前往日斗官方视频/图文合集。", url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100042146043101193#wechat_redirect" },
        'wechat-follow': { title: "关注日斗官方号", desc: "您即将跳转至微信关注‘日斗投资咨询有限公司’官方公众号。智库仅作投研支持，合规披露以此为准。", url: "https://mp.weixin.qq.com/s/your_wechat_follow_page", isWechat: true }
      };
      setConfirmingLink(links[tabId as keyof typeof links]);
    } else {
      setActiveTab(tabId);
      setSelectedPost(null);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setIsSubmitting(true);
    try {
      await DataService.getInstance().createPost({
        ...newPost,
        timestamp: new Date().toLocaleDateString(),
        likes: 0, comments: 0, views: 0
      } as Post);
      await fetchData();
      setIsNewPostModalOpen(false);
      setNewPost({ title: '', content: '', tags: [], isFeatured: false });
    } catch (err) {
      alert("发布失败。");
    } finally {
      setIsSubmitting(false);
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
          <button className="w-10 h-10 flex items-center justify-center text-slate-300 active-scale">
            <span className="text-xl">⋯</span>
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-16 pb-40">
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
            <h1 className="text-2xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 leading-tight tracking-tighter italic">{selectedPost.title}</h1>
          </header>
          <article className="prose prose-slate prose-lg max-w-none mb-16 md:mb-20">
            <div className="text-slate-600 text-base md:text-lg leading-[1.8] whitespace-pre-wrap font-medium font-sans">{selectedPost.content}</div>
          </article>
          <div className="space-y-12 md:space-y-16">
            <div className="flex flex-wrap gap-2 md:gap-2.5">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-slate-100">#{tag}</span>
              ))}
            </div>
            {selectedPost.attachments && selectedPost.attachments.length > 0 && (
              <div className="bg-slate-50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-inner">
                <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-4 md:w-2 md:h-5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> 关联附件 (Attachments)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:gap-5">
                  {selectedPost.attachments.map((file, i) => (
                    <div key={i} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[1.75rem] border border-slate-100 flex items-center justify-between group cursor-pointer active:bg-slate-50 transition-all duration-300">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="text-2xl md:text-3xl filter grayscale group-active:grayscale-0 transition-all">{file.type === 'PDF' ? '📕' : '📊'}</div>
                        <div>
                          <p className="text-xs md:text-sm font-black text-slate-800 line-clamp-1">{file.name}</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider">{file.type} · {file.size}</p>
                        </div>
                      </div>
                      <span className="text-lg opacity-40 group-active:opacity-100">📥</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    <div className="px-4 md:px-8 space-y-8 md:space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 px-1 -mx-4 md:mx-0 px-4 md:px-0">
        {indices.map(idx => (
          <div key={idx.name} className="flex-shrink-0 bg-white px-4 md:px-5 py-3 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 md:gap-4">
            <span className="text-[10px] md:text-xs font-black text-slate-500 whitespace-nowrap">{idx.name}</span>
            <span className={`text-xs md:text-sm font-black tabular-nums ${idx.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>{idx.value}</span>
            <span className={`text-[9px] md:text-[10px] font-bold ${idx.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{idx.change}%</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div onClick={() => handleTabChange('strategy')} className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white group cursor-pointer active-scale relative overflow-hidden border-b-4 border-amber-700/30">
               <h3 className="text-xl md:text-2xl font-black mb-2 relative z-10 italic">日斗深度策略</h3>
               <p className="opacity-80 text-xs md:text-sm relative z-10 font-bold">核心龙头 · 情绪周期博弈</p>
               <span className="absolute -bottom-4 -right-4 text-6xl md:text-7xl opacity-20 transition-transform">🎯</span>
            </div>
            <div onClick={() => handleTabChange('daily-talk')} className="bg-gradient-to-br from-rose-500 to-red-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white group cursor-pointer active-scale relative overflow-hidden border-b-4 border-rose-800/20">
               <h3 className="text-xl md:text-2xl font-black mb-2 relative z-10 italic">每日财经说</h3>
               <p className="opacity-80 text-xs md:text-sm relative z-10 font-bold">视频解读 · 盘中逻辑瞬达</p>
               <span className="absolute -bottom-4 -right-4 text-6xl md:text-7xl opacity-20 transition-transform">🎙️</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 md:gap-3 italic">
                <span className="w-1.5 md:w-2 h-6 md:h-8 bg-[#C0950E] rounded-full"></span>
                {isManageMode ? '内容管理中心' : '精华投研'}
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsManageMode(!isManageMode)} className={`text-[9px] md:text-[10px] font-black uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${isManageMode ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 shadow-sm'}`}>
                  {isManageMode ? '退出' : '管理'}
                </button>
                {isManageMode && (
                  <button onClick={() => setIsNewPostModalOpen(true)} className="bg-amber-500 text-black text-[9px] md:text-[10px] font-black uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg">+ 新增</button>
                )}
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              {posts.length > 0 ? posts.map(p => (
                <div key={p.id} className="relative group/manage active-scale">
                  <PostItem post={p} onClick={(post) => setSelectedPost(post)} />
                  {isManageMode && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); if(window.confirm("确定删除吗？")) DataService.getInstance().deletePost(p.id).then(fetchData)}} className="bg-red-500 text-white p-2 rounded-xl shadow-xl">🗑️</button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-16 md:p-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[2.5rem] text-sm font-bold uppercase tracking-widest">同步中...</div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 h-full hidden lg:block"><RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} /></div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'private-society': return renderPrivateSociety();
      case 'markets': return renderMarketsPage();
      case 'about': return renderAboutUs();
      case 'home':
      default: return renderHomeContent();
    }
  };

  const renderPrivateSociety = () => (
    <div className="animate-in fade-in zoom-in-95 duration-1000">
      <section className="relative pt-12 md:pt-20 pb-24 md:pb-32 px-4 bg-[#080808] text-white min-h-screen overflow-hidden selection:bg-amber-500 selection:text-black font-sans">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/15 blur-[160px] rounded-full animate-pulse"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <button onClick={() => setActiveTab('home')} className="mb-8 md:mb-14 inline-flex items-center gap-3 px-6 md:px-8 py-2 md:py-3 bg-white/5 rounded-full text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase border border-white/10 backdrop-blur-2xl active-scale">
            ← BACK TO PLAZA
          </button>
          
          <h1 className="text-5xl md:text-[10rem] font-black mb-4 md:mb-8 italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 leading-[0.9]">
            RIDOU X 10TH
          </h1>
          <p className="text-amber-500 font-black mb-16 md:mb-24 tracking-[0.6em] md:tracking-[1.2em] uppercase text-[10px] md:text-sm">
            第十届财富论坛 · 核心投研基建
          </p>

          <div className="bg-gradient-to-br from-white/5 via-black/40 to-white/5 p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] border border-white/5 mb-20 md:mb-28 text-left relative overflow-hidden">
            <h3 className="text-xl md:text-3xl font-black mb-10 md:mb-16 flex items-center gap-4 italic tracking-tighter">
              <span className="w-2 md:w-2.5 h-8 md:h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>
              飞书数字基建配置指南
            </h3>
            
            <div className="space-y-16 md:space-y-24 relative">
              <div className="absolute left-[20px] md:left-[27px] top-6 bottom-6 w-px border-l border-dashed border-white/20"></div>
              
              {/* Step 1 */}
              <div className="flex gap-6 md:gap-10 relative group">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shrink-0 text-xs md:text-base">01</div>
                <div className="flex-1">
                  <h4 className="font-black mb-4 uppercase text-sm md:text-lg tracking-widest text-amber-500 italic">获取官方协作工具 (Feishu)</h4>
                  <p className="text-xs md:text-sm text-white/40 leading-relaxed mb-6 font-medium">请点击下方按钮前往下载。飞书官网将根据您的系统（Windows/Mac/Android/iOS）自动分发对应版本。</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://www.feishu.cn/download" target="_blank" rel="noopener noreferrer" className="bg-amber-500 text-black px-8 py-4 rounded-2xl font-black text-xs md:text-sm active-scale flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/20">
                      <i className="fas fa-external-link-alt"></i> 前往飞书官网下载中心
                    </a>
                    <div className="flex gap-3 items-center px-4 py-3 bg-white/5 border border-white/10 rounded-2xl">
                       <span className="text-[10px] text-white/20 uppercase font-black">Supported:</span>
                       <span className="text-white/60 text-lg">💻 📱</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 md:gap-10 relative group">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shrink-0 text-xs md:text-base">02</div>
                <div>
                  <h4 className="font-black mb-4 uppercase text-sm md:text-lg tracking-widest text-amber-500 italic">开启搜索权限 (核心设置)</h4>
                  <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium">
                    入驻私享会前，请务必在飞书执行以下配置，否则导师无法向您发起连接：<br/>
                    进入 <span className="text-white">“设置”</span> → <span className="text-white">“隐私”</span> → 开启 <span className="text-amber-500 font-black">“通过手机号搜索我”</span>。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 md:gap-10 relative group">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shrink-0 text-xs md:text-base">03</div>
                <div>
                  <h4 className="font-black mb-4 uppercase text-sm md:text-lg tracking-widest text-amber-500 italic">安全连接协议</h4>
                  <p className="text-xs md:text-sm text-white/40 leading-relaxed font-medium">
                    日斗坚持极简数字社交。提交申请后，导师将<span className="text-white underline">仅通过飞书</span>主动发起好友请求。<br/>
                    <span className="text-amber-500 font-black uppercase mt-2 block italic">日斗官方及导师绝不拨打任何形式的骚扰电话，请认准飞书官方认证标识。</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group inline-block w-full md:w-auto px-4">
            <button onClick={() => setIsAppModalOpen(true)} className="w-full md:w-auto bg-amber-500 text-black px-12 md:px-24 py-6 md:py-9 rounded-2xl md:rounded-[3rem] font-black shadow-2xl active-scale text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.4em] uppercase italic">
              立即免费申请席位
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAboutUs = () => (
    <div className="animate-in fade-in duration-700 px-4 md:px-8 max-w-[1200px] mx-auto py-6 md:py-10">
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 lg:p-24 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <span className="text-amber-600 font-black tracking-[0.5em] text-[8px] md:text-[10px] uppercase mb-4 md:mb-6 inline-block">About Ridou Investment</span>
          <h1 className="text-3xl md:text-7xl font-black text-slate-900 mb-6 md:mb-10 tracking-tighter uppercase italic leading-tight">专注核心资产 <br/> 穿透波动迷雾</h1>
          <p className="text-base md:text-xl text-slate-500 leading-relaxed mb-10 md:mb-16 font-medium">日斗财富论坛是由日斗投资发起的专业投研社区。始终坚持以“产业逻辑为锚，情绪博弈为桨”，连接具备独立深研能力的实战型投资者。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
             <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#07C160] rounded-full"></span> 官方公众号 (Official)</h4>
                  <p className="text-[11px] md:text-xs text-slate-500 mb-6 leading-relaxed font-medium">由 <span className="text-slate-900 font-bold">日斗投资咨询有限公司</span> 独立运营。作为合规研报发布与品牌披露的唯一官方终端。</p>
                </div>
                <button onClick={() => handleTabChange('wechat-follow')} className="w-full bg-[#07C160] text-white py-4 rounded-2xl font-black active-scale shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                  <i className="fab fa-weixin text-xl"></i> 前往关注
                </button>
             </div>
             <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <h4 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-amber-500 rounded-full"></span> 企业主体 (Compliance)</h4>
                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                  日斗投研内容仅供交流探讨。实际主体为 <span className="text-slate-900 font-bold">日斗投资咨询有限公司</span>。请认准官方飞书及微信渠道，防范任何冒名电话或诱导性转账请求。
                </p>
             </div>
          </div>
          <div className="pt-8 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">运营主体：日斗投资咨询有限公司 | Ridou Investment Consulting Co., Ltd.</p>
          </div>
        </div>
      </div>
      <div className="mt-12 text-center opacity-30">
         <Logo className="h-6 mx-auto mb-4" showText={false} />
         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Copyright © 2025 Ridou Investment Consulting Co., Ltd.</p>
      </div>
    </div>
  );

  const renderMarketsPage = () => (
    <div className="px-4 md:px-8 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <RealtimeQuotes indices={indices} summary={{ riseCount: 2842, fallCount: 1950, flatCount: 200, turnover: "9,850亿" }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <div className="bg-[#0c0c0c] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <h3 className="text-white font-black mb-8 md:mb-12 flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter text-lg md:text-xl">
              <span className="w-2 h-6 md:w-2.5 md:h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></span>板块监控实时看板
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {sectors.map((s, i) => (
                <div key={i} className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 active:bg-white/10 transition-all group cursor-pointer shadow-inner active-scale">
                  <span className="text-3xl md:text-4xl mb-4 md:mb-5 block transition-transform">{s.icon}</span>
                  <div className="text-white/40 text-[9px] md:text-[10px] font-black uppercase mb-1 md:mb-2 tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">{s.name}</div>
                  <div className={`text-xl md:text-2xl font-black tabular-nums ${s.change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>{s.change}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {hotStocks.map((s, i) => <MarketCard key={i} stock={s} />)}
          </div>
        </div>
        <div className="lg:col-span-4 h-full hidden lg:block"><RealtimeNewsFeed news={news} loading={loading} onRefresh={fetchData} /></div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-slate-50 flex-col md:flex-row font-sans selection:bg-amber-100">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        <main ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
          {activeTab !== 'private-society' && (
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 md:px-8 py-3 md:py-5 flex justify-between items-center border-b border-slate-100 h-14 md:h-auto">
              <div className="flex items-center gap-3 md:gap-4">
                <Logo className="h-6 md:h-8" showText={false} />
                <div className="h-5 md:h-6 w-px bg-slate-200 hidden md:block"></div>
                <h1 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tighter italic whitespace-nowrap">
                   {activeTab === 'home' ? '财富广场' : activeTab === 'markets' ? '行情中心' : activeTab === 'about' ? '关于日斗' : ''}
                </h1>
              </div>
              <div className={`text-[8px] md:text-[10px] font-black uppercase px-2.5 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm flex items-center gap-2 transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
              </div>
            </header>
          )}
          <div className={`flex-1 ${activeTab === 'private-society' ? '' : 'pb-24 pt-4 md:pt-10'}`}>{renderContent()}</div>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-2xl border-t border-slate-100 px-6 py-2 pb-[calc(8px+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
          {[
            { id: 'home', icon: '🏠', label: '广场' },
            { id: 'markets', icon: '📈', label: '行情' },
            { id: 'private-society', icon: '🔱', label: '入驻' },
            { id: 'about', icon: '🏛️', label: '关于' }
          ].map((nav) => (
            <button key={nav.id} onClick={() => handleTabChange(nav.id)} className={`flex flex-col items-center gap-0.5 transition-all active-scale relative py-1 px-3 ${activeTab === nav.id ? 'text-amber-600' : 'text-slate-400'}`}>
              <span className={`text-2xl transition-transform ${activeTab === nav.id ? 'scale-110 -translate-y-1' : ''}`}>{nav.icon}</span>
              <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === nav.id ? 'opacity-100' : 'opacity-60'}`}>{nav.label}</span>
              {activeTab === nav.id && (<span className="absolute -bottom-1 w-1 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>)}
            </button>
          ))}
        </nav>
      </div>
      {renderPostDetail()}
      {confirmingLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl md:text-2xl font-black mb-2 italic uppercase text-slate-900 tracking-tighter">{confirmingLink.title}</h3>
            <p className="text-slate-500 text-xs md:text-sm mb-8 leading-relaxed font-medium">{confirmingLink.desc}</p>
            <div className="flex gap-3 md:gap-4">
              <button onClick={() => setConfirmingLink(null)} className="flex-1 py-3 md:py-4 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs">返回</button>
              <a href={confirmingLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmingLink(null)} className={`flex-1 py-3 md:py-4 text-white text-center rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-lg active-scale ${confirmingLink.isWechat ? 'bg-[#07C160]' : 'bg-amber-500 text-black'}`}>确认</a>
            </div>
          </div>
        </div>
      )}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl overflow-y-auto">
          <div className="bg-[#111] w-full max-w-lg p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white relative shadow-2xl border border-white/5">
             <button onClick={() => setIsAppModalOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors text-2xl">✕</button>
             {submitSuccess ? (
               <div className="text-center animate-in zoom-in py-8">
                  <div className="text-6xl md:text-7xl mb-6 md:mb-8">✨</div>
                  <h2 className="text-2xl md:text-3xl font-black mb-4 italic uppercase text-amber-500">申请已同步</h2>
                  <p className="text-slate-400 text-xs md:text-sm mb-10 leading-relaxed font-bold">请确保飞书开启“通过手机号搜索我”。导师将在 24 小时内发起连接。日斗坚持极简数字社交，除飞书外我们不拨打任何骚扰电话。</p>
                  <button onClick={() => {setIsAppModalOpen(false); setSubmitSuccess(null);}} className="w-full bg-white text-black py-4 md:py-5 rounded-2xl font-black uppercase italic shadow-xl active-scale">我已知晓 · 开启飞书</button>
               </div>
             ) : (
               <>
                 <h2 className="text-3xl md:text-4xl font-black mb-2 md:mb-4 italic uppercase tracking-tighter">私享席位申请</h2>
                 <p className="text-white/20 text-[9px] md:text-[10px] mb-8 md:mb-12 uppercase tracking-[0.4em] font-black">Ridou Intel Core Stream Admission</p>
                 <form onSubmit={handleFormSubmit} className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-white/30 uppercase ml-1">真实姓名</label>
                      <input required value={appData.name} onChange={e=>setAppData({...appData, name:e.target.value})} placeholder="如何称呼您" className="w-full bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 outline-none focus:border-amber-500/50 transition-colors font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-black text-white/30 uppercase ml-1">飞书注册手机号</label>
                      <input required type="tel" value={appData.phone} onChange={e=>setAppData({...appData, phone:e.target.value})} placeholder="唯一连接凭证" className="w-full bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 outline-none focus:border-amber-500/50 transition-colors font-bold" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-black py-4 md:py-5 rounded-2xl font-black text-lg shadow-lg active-scale transition-all uppercase italic mt-4">
                      {isSubmitting ? '申请中...' : '提交入驻申请'}
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
