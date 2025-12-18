
import React from 'react';
import Logo from './Logo';

export const MENU_ITEMS = [
  { id: 'home', icon: '🏠', label: '财富广场' },
  { id: 'strategy', icon: '🎯', label: '日斗策略' },
  { id: 'daily-talk', icon: '🎙️', label: '每日财经说' },
  { id: 'markets', icon: '📈', label: '行情中心' },
  { id: 'about', icon: '🏛️', label: '关于我们' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 hidden md:flex flex-col sticky top-0 shadow-sm z-50">
      <div className="p-8">
        <Logo className="h-10" />
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
              activeTab === item.id
                ? 'bg-amber-50 text-[#C0950E] font-black shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </div>
            {/* 视觉反馈已移动到 App 内部页面处理，侧边栏保持极简 */}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-5 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
          <p className="text-[10px] text-amber-500 font-black uppercase mb-1 tracking-widest relative z-10">Private Society</p>
          <p className="text-xs font-bold mb-4 opacity-90 leading-relaxed relative z-10">免费申请加入日斗私享会，获取专属策略通道。</p>
          <button 
            onClick={() => setActiveTab('private-society')}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl text-xs font-black hover:scale-[1.02] transition-all shadow-lg shadow-black/40 relative z-10"
          >
            免费申请加入
          </button>
          <span className="absolute -bottom-4 -right-4 text-4xl opacity-10 group-hover:rotate-12 transition-transform">🔱</span>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
