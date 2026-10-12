import React, { useState, useRef, useEffect } from 'react';
import { Landmark, ArrowUpRight, Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

function RichHoverCard({ children, popupContent }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showPopup = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 4,
          left: rect.left
        });
        setIsVisible(true);
      }
    }, 200);
  };

  const hidePopup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // Add a 200ms grace period so the user can move their mouse into the popup
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={showPopup}
      onMouseLeave={hidePopup}
      className="inline-flex"
    >
      {children}
      {isVisible && createPortal(
        <div 
          style={{ 
            top: coords.top, 
            left: Math.max(10, Math.min(window.innerWidth - 310, coords.left)) 
          }}
          className="fixed z-[10000] min-w-[200px] max-w-[calc(100vw-20px)] sm:max-w-[320px] bg-[#2a2a2a] text-white p-3 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
          onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsVisible(true); }}
          onMouseLeave={hidePopup}
        >
          {popupContent}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function LinksBlock({ data }) {
  const [copiedUrl, setCopiedUrl] = useState(null);

  const handleCopy = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="w-full flex flex-col gap-6 mt-4 mb-6">
      {data.map((link, idx) => {
        let domain = '';
        try {
          const urlObj = new URL(link.url);
          domain = urlObj.hostname.replace('www.', '');
        } catch (e) {
          domain = 'Website';
        }
        
        const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=32`;

        return (
          <div key={idx} className="flex items-start gap-4 group">
            <div className="mt-0.5 text-gray-500 dark:text-gray-400">
              <Landmark className="w-[18px] h-[18px]" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-[15px] text-gray-900 dark:text-white">
                {link.title}
              </span>
              
              {link.description && (
                <span className="text-[14px] text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                  {link.description}
                </span>
              )}

              <div className="mt-3 flex items-center gap-3">
                
                {/* URL Link with Copy Popup */}
                <RichHoverCard 
                  popupContent={
                    <div className="flex items-center gap-3 w-full">
                      <img src={faviconUrl} alt="icon" className="w-4 h-4 rounded-sm" onError={(e) => e.target.style.display = 'none'} />
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-gray-200 hover:text-emerald-400 hover:underline truncate flex-1 flex items-center gap-1.5 cursor-pointer">
                        {link.url}
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </a>
                      <button onClick={(e) => handleCopy(e, link.url)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors shrink-0 ml-1">
                        {copiedUrl === link.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-white" />}
                      </button>
                    </div>
                  }
                >
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-900 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-b border-dashed border-gray-400 dark:border-gray-600 hover:border-emerald-500 pb-0.5"
                  >
                    Open the official portal
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </RichHoverCard>
                
                {/* Domain Badge with Detail Popup */}
                <RichHoverCard
                  popupContent={
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <img src={faviconUrl} alt="icon" className="w-4 h-4 rounded-sm" onError={(e) => e.target.style.display = 'none'} />
                        <span className="text-[12px] font-medium text-gray-400">{domain}</span>
                      </div>
                      <span className="text-[14px] font-semibold text-white leading-tight">
                        {link.title}
                      </span>
                    </div>
                  }
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/[0.05] cursor-default hover:bg-gray-200 dark:hover:bg-white/[0.12] transition-colors">
                    <img 
                      src={faviconUrl} 
                      alt="favicon"
                      className="w-3.5 h-3.5 rounded-sm opacity-80"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                      {domain}
                    </span>
                  </div>
                </RichHoverCard>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
