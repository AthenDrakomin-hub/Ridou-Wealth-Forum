
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
    <div className="w-72 2xl:w-80 bg-white h-screen border-r border-slate-200 hidden md:flex flex-col sticky top-0 shadow-sm z-50">
      <div className="p-10">
        <Logo className="h-12" />
      </div>
      <nav className="flex-1 px-6 py-4 space-y-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all group ${
              activeTab === item.id
                ? 'bg-amber-50 text-[#C0950E] font-black shadow-sm translate-x-1'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-2xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
              <span className="text-base tracking-tight font-medium">{item.label}</span>
            </div>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-100">
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
          <p className="text-[10px] text-amber-500 font-black uppercase mb-2 tracking-widest relative z-10">Private Society</p>
          <p className="text-sm font-bold mb-6 opacity-90 leading-relaxed relative z-10">免费申请加入日斗私享会，获取专属策略通道。</p>
          <button 
            onClick={() => setActiveTab('private-society')}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 rounded-2xl text-sm font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/40 relative z-10 uppercase tracking-widest"
          >
            免费申请
          </button>
          <span className="absolute -bottom-6 -right-6 text-6xl opacity-10 group-hover:rotate-12 transition-transform duration-700">🔱</span>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
