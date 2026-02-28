import React, { useEffect, useState, useRef } from 'react';
import { Zap } from 'lucide-react';

// [BEE_HOOK: BEE_VISITOR_LOGIC]
const BeeVisitor = ({ isActive }) => {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [dir, setDir] = useState({ x: 2.5, y: 2.5 }); 
  const beeRef = useRef(null);
  const requestRef = useRef();
  const audioRef = useRef(new Audio('https://www.soundjay.com/nature/sounds/bee-buzz-01.mp3'));

  useEffect(() => {
    if (isActive) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.05;
      audioRef.current.play().catch(() => console.log("Hive: Click page to enable audio."));
      
      const animate = () => {
        setPos(prev => {
          const rect = beeRef.current?.getBoundingClientRect() || { width: 150, height: 40 };
          let newX = prev.x + dir.x;
          let newY = prev.y + dir.y;

          let newDirX = dir.x;
          let newDirY = dir.y;

          if (newX <= 0 || newX >= window.innerWidth - rect.width) {
            newDirX = -dir.x * (0.9 + Math.random() * 0.2);
          }
          if (newY <= 0 || newY >= window.innerHeight - rect.height) {
            newDirY = -dir.y * (0.9 + Math.random() * 0.2);
          }

          if (newDirX !== dir.x || newDirY !== dir.y) {
            setDir({ x: newDirX, y: newDirY });
          }

          return { x: newX, y: newY };
        });
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else {
      audioRef.current.pause();
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      cancelAnimationFrame(requestRef.current);
      audioRef.current.pause();
    };
  }, [isActive, dir]);

  if (!isActive) return null;

  return (
    <div 
      ref={beeRef}
      className="fixed pointer-events-none z-[9999] transition-opacity duration-1000"
      style={{ 
        left: pos.x, 
        top: pos.y,
        transform: `rotate(${dir.x > 0 ? '10deg' : '-10deg'})` 
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -top-1 -left-1 w-3 h-1 bg-white/30 rounded-full animate-ping"></div>
          <Zap size={24} className="text-amber-400 fill-current drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
        </div>
        <div className="bg-black/80 backdrop-blur-md border border-amber-500/50 px-3 py-1 rounded-full shadow-2xl">
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Sammie is Visiting...
          </p>
        </div>
      </div>
    </div>
  );
};
// [BEE_HOOK_END]

export default BeeVisitor;