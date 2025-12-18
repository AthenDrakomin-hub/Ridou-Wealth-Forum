
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import PostItem from './components/PostItem';
import RealtimeQuotes from './components/RealtimeQuotes';
import RealtimeNewsFeed from './components/RealtimeNewsFeed';
import Logo from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DataService } from './services/api';
import { Post, NewsItem, MarketIndex, SocietyApplication } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appData, setAppData] = useState<SocietyApplication>({
    name: '', phone: '', investYears: '', missingAbilities: '', learningExpectation: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [confirmingLink, setConfirmingLink] = useState<{ title: string; desc: string; url: string; isWechat?: boolean } | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const ds = DataService.getInstance();
    try {
      const [newsData, postsData, indexData] = await Promise.all([
        ds.fetchNews(),
        ds.fetchForumPosts(),
        ds.fetchMarketIndices()
      ]);
      setNews(newsData);
      setPosts(postsData);
      setIndices(indexData);
    } catch (err) {
      console.error("Data sync error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedPost(null);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStrategyPage = () => (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      <div className="relative bg-slate-900 rounded-[3rem] p-10 md:p-20 text-white overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-12 bg-amber-500"></span>
            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-500">Editorial Choice</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold italic mb-8 leading-tight text-white">日斗深度策略合集</h1>
          <p className="text-xl text-slate-400 mb-12 font-light leading-relaxed">
            核心逻辑资产：收录 25 篇针对 A 股/港股情绪周期的投研专辑。从龙空龙交易闭环到反脆弱个人交易生态。
          </p>
          <button 
            onClick={() => setConfirmingLink({ 
              title: "订阅深度专辑", 
              desc: "您即将跳转至微信查看 25 篇策略全集。建议收藏专辑以便后续复习研读。",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100037966654046208#wechat_redirect"
            })}
            className="bg-amber-600 hover:bg-amber-500 text-white px-12 py-6 rounded-2xl font-black text-lg active-scale shadow-2xl shadow-amber-600/20 transition-all uppercase tracking-widest"
          >
            获取完整 25 篇专辑 ↗
          </button>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none hidden md:block">
          <span className="text-[25rem] font-serif font-black italic">Ridou</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { cat: "市场逻辑博弈", icon: "📊", items: ["2025年A股策略全景", "事件投资四步心法", "如何建立稳定盈利交易系统"] },
          { cat: "短线战法揭秘", icon: "⚔️", titles: ["彻底讲透龙空龙交易闭环", "龙头连板关键之换手板", "主升浪复盘四步法"] },
          { cat: "游资心法修炼", icon: "🧠", items: ["炒股养家本质解析", "反脆弱个人交易生态", "顶级游资心法实操"] }
        ].map((group, i) => (
          <div key={i} className="premium-card p-10 rounded-[2.5rem] group">
            <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{group.icon}</div>
            <h3 className="text-2xl font-serif font-bold mb-8 text-slate-900 border-b border-slate-50 pb-6">{group.cat}</h3>
            <ul className="space-y-5 text-slate-500 font-medium text-sm md:text-base">
              {(group.items || group.titles).map((t, idx) => (
                <li key={idx} className="flex gap-4 items-start group/li">
                  <span className="text-amber-500 font-black mt-1">·</span>
                  <span className="group-hover/li:text-slate-900 transition-colors">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDailyTalkPage = () => (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-8xl font-serif font-bold italic text-slate-900 leading-none">每日财经复盘</h1>
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Daily Market Intelligence Feed</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-20 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Logic Stream</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight italic">
            坚持每日早盘逻辑导引 <br/> 
            与盘后文字复盘
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            穿透市场当日波动的本质，梳理主线逻辑与情绪对立面。由日斗智库官方出品，日更不辍。
          </p>
          <button 
             onClick={() => setConfirmingLink({ 
              title: "阅读文字复盘", 
              desc: "即将前往微信查看每日财经说（文字复盘合集）。建议在安静环境中沉浸研读。",
              url: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk2ODAzMDA2Ng==&action=getalbum&album_id=4100042146043101193#wechat_redirect"
            })}
             className="bg-slate-900 text-white px-12 py-6 rounded-2xl font-black text-lg active-scale shadow-2xl hover:bg-black transition-all uppercase tracking-widest"
          >
            查阅复盘笔记 ↗
          </button>
        </div>
        <div className="w-full md:w-80 h-96 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center p-8 relative">
           <div className="absolute inset-0 opacity-5 pointer-events-none font-serif font-bold text-9xl flex items-center justify-center italic">Text</div>
           <div className="text-slate-300 space-y-4 w-full">
              <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
              <div className="h-2 w-full bg-slate-200 rounded-full"></div>
              <div className="h-2 w-1/2 bg-slate-200 rounded-full"></div>
              <div className="h-2 w-5/6 bg-slate-200 rounded-full mt-12"></div>
              <div className="h-2 w-full bg-slate-200 rounded-full"></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="premium-card p-10 rounded-[2.5rem]">
           <span className="text-4xl mb-6 block">🌅</span>
           <h4 className="text-xl font-black text-slate-900 mb-4 italic uppercase">早盘逻辑前瞻</h4>
           <p className="text-slate-500 font-medium leading-relaxed">每个交易日开盘前，锚定市场博弈焦点，给出一手的确定性逻辑导引。</p>
        </div>
        <div className="premium-card p-10 rounded-[2.5rem]">
           <span className="text-4xl mb-6 block">🌒</span>
           <h4 className="text-xl font-black text-slate-900 mb-4 italic uppercase">盘后复盘总结</h4>
           <p className="text-slate-500 font-medium leading-relaxed">基于当日收盘后的盘面演化，拆解主力动向，推演次日核心博弈剧本。</p>
        </div>
      </div>
    </div>
  );

  const renderPrivateSociety = () => (
    <div className="bg-slate-950 min-h-screen text-white pt-24 pb-48 px-6 animate-in fade-in zoom-in-95 duration-1000">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-6xl md:text-[14rem] font-serif font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-8 md:mb-12 uppercase leading-none">Ridou Society</h1>
        <p className="text-amber-500 font-black tracking-[0.8em] md:tracking-[2em] uppercase text-[10px] md:text-sm mb-16 md:mb-24">财富论坛 · 核心数字协作基建</p>
        
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-3xl p-8 md:p-24 rounded-[3rem] md:rounded-[4rem] border border-white/5 text-left mb-16 md:mb-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none font-serif italic text-9xl">🔱</div>
           <h3 className="text-2xl md:text-5xl font-serif font-bold italic text-white mb-10 md:mb-16 uppercase tracking-tight">入驻飞书 (Feishu) 数字底座</h3>
           <div className="space-y-10 md:space-y-16 relative z-10">
              {[
                { step: '01', title: '下载飞书协作套件', desc: '日斗唯一指定数字协作工具。请通过官网下载安装并完成注册。' },
                { step: '02', title: '隐私搜索权限 (关键)', desc: '进入隐私设置，务必勾选“通过手机号搜索我”。否则导师无法与您连接。' },
                { step: '03', title: '导师主动邀请', desc: '导师将仅通过飞书主动发起申请。日斗绝不拨打任何骚扰或推广电话。' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 md:gap-10 group">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-black shrink-0 text-xl md:text-2xl group-hover:scale-110 transition-transform">{item.step}</div>
                   <div className="flex-1">
                     <h4 className="text-xl md:text-2xl font-black mb-2 md:mb-4 italic uppercase tracking-widest text-amber-500">{item.title}</h4>
                     <p className="text-base md:text-lg text-white/40 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <button 
          onClick={() => setIsAppModalOpen(true)}
          className="bg-amber-600 text-white px-10 py-6 md:px-32 md:py-12 rounded-2xl md:rounded-[3rem] font-black text-2xl md:text-5xl shadow-2xl active-scale italic tracking-[0.1em] md:tracking-[0.2em] uppercase transition-all hover:bg-amber-500"
        >
          立即申请席位
        </button>
      </div>
    </div>
  );

  const renderAboutUs = () => (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-32 space-y-16 animate-in fade-in duration-700">
      <div className="bg-white rounded-[4rem] p-12 md:p-24 border border-slate-100 shadow-sm text-center">
         <Logo className="h-16 md:h-24 mx-auto mb-16" showText={false} />
         <h1 className="text-4xl md:text-7xl font-serif font-bold italic text-slate-900 mb-10 uppercase tracking-tight leading-tight">专注核心产业逻辑 <br/> 穿透市场波动迷雾</h1>
         <p className="text-xl md:text-3xl text-slate-400 font-medium leading-relaxed max-w-4xl mx-auto mb-20 italic">
           日斗财富论坛是由日斗投资发起的专业投研社区。作为实战派投资者的连接协议，我们坚持以“产业为锚，复利为桨”。
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left pt-20 border-t border-slate-50">
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">Official Entity</h4>
              <p className="text-lg font-black text-slate-900 italic">日斗投资咨询有限公司</p>
              <button onClick={() => handleTabChange('wechat-follow')} className="inline-flex items-center gap-4 bg-[#07C160] text-white px-8 py-4 rounded-xl font-black text-sm active-scale">
                 <i className="fab fa-weixin"></i> 关注官方公众号
              </button>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.5em]">Infrastructure</h4>
              <p className="text-lg font-medium text-slate-500 leading-relaxed">
                全线基于飞书 (Feishu) 构建数字协作矩阵。拒绝低效骚扰电话，坚持极简、合规的精英社交。
              </p>
            </div>
         </div>
      </div>
    </div>
  );

  const renderHomeContent = () => (
    <div className="px-6 md:px-12 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {indices.map(idx => (
          <div key={idx.name} className="premium-card p-8 rounded-[2rem]">
            <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.4em]">{idx.name}</p>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-black tabular-nums ${idx.change >= 0 ? 'text-red-500' : 'text-emerald-600'}`}>{idx.value}</span>
              <span className={`text-xs font-black ${idx.change >= 0 ? 'text-red-400' : 'text-emerald-500'}`}>{idx.change >= 0 ? '+' : ''}{idx.change}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => setActiveTab('strategy')} className="bg-slate-900 p-12 rounded-[3rem] text-white cursor-pointer active-scale shadow-2xl group transition-all">
               <div className="flex justify-between items-start mb-10">
                 <h3 className="text-4xl font-serif font-bold italic">日斗策略</h3>
                 <span className="text-amber-500 text-3xl opacity-40 group-hover:opacity-100 transition-opacity italic">25 articles</span>
               </div>
               <p className="font-black text-slate-400 text-sm uppercase tracking-[0.3em]">Deep Research Album</p>
            </div>
            <div onClick={() => setActiveTab('daily-talk')} className="bg-amber-600 p-12 rounded-[3rem] text-white cursor-pointer active-scale shadow-2xl group transition-all">
               <div className="flex justify-between items-start mb-10">
                 <h3 className="text-4xl font-serif font-bold italic text-slate-900">财经复盘</h3>
                 <span className="text-white text-3xl opacity-40 group-hover:opacity-100 transition-opacity italic">Daily</span>
               </div>
               <p className="font-black text-amber-900 text-sm uppercase tracking-[0.3em]">Morning & Night Feed</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
              <h3 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-6 italic uppercase tracking-tight">
                <span className="w-1.5 h-10 bg-amber-600 rounded-full"></span>
                精华投研内参
              </h3>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Intel Hub</span>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {posts.map(p => (
                <PostItem key={p.id} post={p} onClick={(post) => setSelectedPost(post)} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 sticky top-32 h-fit hidden lg:block">
          <RealtimeNewsFeed news={news} loading={loading} />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHomeContent();
      case 'strategy': return renderStrategyPage();
      case 'daily-talk': return renderDailyTalkPage();
      case 'markets': return (
        <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pt-10">
          <RealtimeQuotes indices={indices} />
        </div>
      );
      case 'private-society': return renderPrivateSociety();
      case 'about': return renderAboutUs();
      case 'wechat-follow': return (
        <div className="max-w-4xl mx-auto px-6 py-32 text-center space-y-12 animate-in fade-in duration-700">
          <div className="text-8xl">📱</div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold italic text-slate-900">关注官方公众号</h2>
          <p className="text-xl text-slate-500 font-medium">获取最及时的市场逻辑导引与深度研报推送</p>
          <div className="w-64 h-64 bg-slate-50 mx-auto rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
             <span className="text-slate-300 font-black uppercase tracking-widest text-[10px]">QR Code Placeholder</span>
          </div>
          <button onClick={() => setActiveTab('about')} className="text-amber-600 font-black uppercase tracking-widest text-xs hover:text-amber-700 transition-colors">← 返回关于我们</button>
        </div>
      );
      default: return renderHomeContent();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-[#fdfdfd] flex-col md:flex-row font-sans selection:bg-amber-100 selection:text-amber-900">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <main ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col">
          {activeTab !== 'private-society' && (
            <header className="sticky top-0 z-40 glass-nav px-8 md:px-16 py-6 md:py-10 border-b border-slate-100 flex justify-between items-center h-20 md:h-28">
              <div className="flex items-center gap-6">
                <Logo className="h-10 md:h-14" showText={false} />
                <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                <h1 className="text-xl md:text-4xl font-serif font-bold italic text-slate-900 uppercase tracking-tight">
                   {activeTab === 'home' ? '财富广场' : activeTab === 'markets' ? '行情中心' : activeTab === 'about' ? '关于日斗' : activeTab === 'strategy' ? '策略内参' : activeTab === 'daily-talk' ? '逻辑复盘' : activeTab === 'wechat-follow' ? '关注我们' : ''}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-3 md:gap-4">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Live Node</span>
                </div>
              </div>
            </header>
          )}
          
          <div className={`flex-1 ${activeTab === 'private-society' ? '' : 'pb-40 pt-6 md:pt-16'}`}>
            {renderContent()}
          </div>
        </main>
        
        {/* 移动端底部 Dock */}
        <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 px-8 py-4 pb-[calc(16px+env(safe-area-inset-bottom))] flex md:hidden justify-between items-center z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
          {[
            { id: 'home', icon: '🏠', label: '广场' },
            { id: 'markets', icon: '📈', label: '行情' },
            { id: 'private-society', icon: '🔱', label: '入驻' },
            { id: 'about', icon: '🏛️', label: '关于' }
          ].map((nav) => (
            <button key={nav.id} onClick={() => handleTabChange(nav.id)} className={`flex flex-col items-center gap-1 active-scale transition-all ${activeTab === nav.id ? 'text-amber-600' : 'text-slate-400'}`}>
              <span className={`text-xl transition-transform ${activeTab === nav.id ? 'scale-110' : ''}`}>{nav.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{nav.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 文章详情 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-scrollbar selection:bg-amber-100 animate-in slide-in-from-bottom duration-500">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 md:px-8 py-4 md:py-6 border-b flex items-center justify-between z-50 h-16 md:h-20">
            <button onClick={() => setSelectedPost(null)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-slate-50 rounded-full text-2xl text-slate-400 hover:text-slate-900 transition-all">✕</button>
            <div className="flex flex-col items-center">
               <Logo className="h-6 md:h-8" showText={false} />
               <span className="text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Intelligence</span>
            </div>
            <div className="w-10 md:w-12"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 py-12 pb-60">
            <h1 className="text-3xl md:text-7xl font-serif font-bold italic text-slate-900 leading-tight mb-8 md:mb-12">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 md:gap-6 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-12 md:mb-16 pb-6 md:pb-8 border-b border-slate-50">
               <span>Pub Date: {selectedPost.timestamp}</span>
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
               <span>Ridou Research</span>
            </div>
            <div className="text-slate-700 text-lg md:text-3xl leading-[1.8] md:leading-[1.85] whitespace-pre-wrap font-medium">
              {selectedPost.content}
            </div>
          </div>
        </div>
      )}

      {/* 外链弹窗 */}
      {confirmingLink && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-8 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
            <h3 className="text-2xl md:text-3xl font-serif font-bold italic text-slate-900 uppercase tracking-tighter mb-4 md:mb-6">{confirmingLink.title}</h3>
            <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-12 font-medium leading-relaxed">{confirmingLink.desc}</p>
            <div className="flex gap-4 md:gap-6">
              <button onClick={() => setConfirmingLink(null)} className="flex-1 py-4 md:py-5 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs active-scale">取消</button>
              <a href={confirmingLink.url} target="_blank" rel="noopener noreferrer" onClick={() => setConfirmingLink(null)} className={`flex-1 py-4 md:py-5 text-white text-center rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs shadow-xl active-scale ${confirmingLink.isWechat ? 'bg-[#07C160]' : 'bg-slate-900'}`}>确认前往 ↗</a>
            </div>
          </div>
        </div>
      )}

      {/* 席位申请模态框 - 重点修复部分 */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-2xl">
          <div className="bg-[#0f172a] w-full max-w-xl max-h-[85vh] overflow-y-auto no-scrollbar rounded-[2.5rem] md:rounded-[3.5rem] relative shadow-2xl border border-white/10 flex flex-col">
             
             {/* 粘性关闭按钮，始终在右上角 */}
             <div className="sticky top-0 w-full flex justify-end p-6 z-30 pointer-events-none">
                <button 
                  onClick={() => setIsAppModalOpen(false)} 
                  className="text-white/40 hover:text-white transition-colors text-3xl pointer-events-auto bg-slate-800/80 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center shadow-lg border border-white/5"
                >
                  ✕
                </button>
             </div>
             
             <div className="px-6 md:px-14 pb-12 md:pb-20">
               {submitSuccess ? (
                 <div className="text-center py-6 space-y-8 animate-in zoom-in duration-500">
                    <div className="text-7xl md:text-8xl mb-6">🔱</div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-white leading-tight uppercase tracking-tight">申请已同步</h2>
                    <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed max-w-xs mx-auto">
                      请开启飞书“通过手机号搜索我”权限。导师将在 24 小时内发起连接。
                    </p>
                    <button 
                      onClick={() => {setIsAppModalOpen(false); setSubmitSuccess(null);}} 
                      className="w-full bg-white text-slate-900 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-lg active-scale shadow-xl"
                    >
                      返回广场
                    </button>
                 </div>
               ) : (
                 <>
                   <div className="space-y-2 mb-10 md:mb-12">
                     <h2 className="text-4xl md:text-6xl font-serif font-bold italic text-white leading-none uppercase tracking-tighter">席位申请</h2>
                     <p className="text-amber-500 text-[10px] font-black tracking-[0.6em] md:tracking-[0.8em] uppercase opacity-80">Admission Formal Request</p>
                   </div>

                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     setSubmitSuccess("success");
                   }} className="space-y-8 md:space-y-10">
                      <div className="space-y-3 md:space-y-4">
                        <label className="text-[10px] font-black text-white/60 uppercase ml-2 tracking-widest">您的真实姓名/称呼</label>
                        <input 
                          required 
                          autoFocus
                          value={appData.name} 
                          onChange={e=>setAppData({...appData, name:e.target.value})} 
                          placeholder="请输入您的称呼" 
                          className="w-full bg-white/10 p-5 md:p-7 rounded-2xl md:rounded-[2.2rem] border border-white/20 outline-none focus:border-amber-600/60 font-black text-lg md:text-xl text-white transition-all placeholder:text-white/20 shadow-inner" 
                        />
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <label className="text-[10px] font-black text-white/60 uppercase ml-2 tracking-widest">飞书手机号 (连接唯一凭证)</label>
                        <input 
                          required 
                          type="tel" 
                          value={appData.phone} 
                          onChange={e=>setAppData({...appData, phone:e.target.value})} 
                          placeholder="必须与飞书注册号一致" 
                          className="w-full bg-white/10 p-5 md:p-7 rounded-2xl md:rounded-[2.2rem] border border-white/20 outline-none focus:border-amber-600/60 font-black text-lg md:text-xl text-white transition-all placeholder:text-white/20 shadow-inner" 
                        />
                      </div>
                      <div className="pt-4">
                        <button 
                          type="submit" 
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-2xl shadow-2xl active-scale transition-all uppercase italic tracking-widest"
                        >
                          提交正式申请
                        </button>
                      </div>
                      <p className="text-center text-white/30 text-[9px] md:text-[10px] font-bold tracking-widest leading-relaxed px-2">
                        提交即同意日斗仅通过飞书联系您，且已开启相关搜索权限。日斗绝不进行电话骚扰。
                      </p>
                   </form>
                 </>
               )}
             </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;
