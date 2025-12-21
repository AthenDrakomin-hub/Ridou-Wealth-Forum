
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8", showText = true, color = "#C0950E" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto drop-shadow-sm">
        {/* 外围古典纹饰框 */}
        <path d="M50 5C25.1 5 5 25.1 5 50C5 74.9 25.1 95 50 95C74.9 95 95 74.9 95 50C95 25.1 74.9 5 50 5ZM50 90C27.9 90 10 72.1 10 50C10 27.9 27.9 10 50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90Z" fill={color} fillOpacity="0.2"/>
        <path d="M50 12C52.2 12 54 13.8 54 16C54 18.2 52.2 20 50 20C47.8 20 46 18.2 46 16C46 13.8 47.8 12 50 12Z" fill={color}/>
        <path d="M84 50C84 52.2 82.2 54 80 54C77.8 54 76 52.2 76 50C76 47.8 77.8 46 80 46C82.2 46 84 47.8 84 50Z" fill={color}/>
        <path d="M24 50C24 52.2 22.2 54 20 54C17.8 54 16 52.2 16 50C16 47.8 17.8 46 20 46C22.2 46 24 47.8 24 50Z" fill={color}/>
        <path d="M50 88C52.2 88 54 86.2 54 84C54 81.8 52.2 80 50 80C47.8 80 46 81.8 46 84C46 86.2 47.8 88 50 88Z" fill={color}/>
        
        {/* 复杂的装饰线条 */}
        <path d="M35 25C30 30 25 40 25 50C25 60 30 70 35 75" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M65 25C70 30 75 40 75 50C75 60 70 70 65 75" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        
        {/* 公牛头图标 */}
        <path d="M50 35L42 45H58L50 35Z" fill={color}/> 
        <path d="M42 45L40 60C40 65.5 44.5 70 50 70C55.5 70 60 65.5 60 60L58 45H42Z" fill={color}/> 
        <path d="M42 45C38 42 32 40 30 35C32 40 38 43 42 45Z" fill={color}/>
        <path d="M58 45C62 42 68 40 70 35C68 40 62 43 58 45Z" fill={color}/>
        <circle cx="46" cy="52" r="1.5" fill="white"/>
        <circle cx="54" cy="52" r="1.5" fill="white"/>
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tighter text-slate-800" style={{ fontFamily: 'serif' }}>日斗财富论坛</span>
          <span className="text-[8px] font-bold tracking-[0.2em] text-[#C0950E] uppercase opacity-80">Ridou Wealth Forum</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
