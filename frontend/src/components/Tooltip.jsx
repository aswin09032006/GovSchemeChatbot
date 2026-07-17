import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ text, children, delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: null, triggerWidth: 0 });
  const [placement, setPlacement] = useState({ y: 'top', x: 'center' });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        
        let newPlacementY = 'top';
        let newPlacementX = 'center';
        let topCoord = rect.top - 32;
        let leftCoord = rect.left + rect.width / 2;
        let rightCoord = null;

        if (rect.top < 40) {
          // Not enough space above, position below
          newPlacementY = 'bottom';
          topCoord = rect.bottom + 8;
        }

        // Horizontal checks
        if (rect.left < 60) {
          newPlacementX = 'left';
          leftCoord = rect.left;
        } else if (window.innerWidth - rect.right < 60) {
          newPlacementX = 'right';
          leftCoord = null;
          rightCoord = window.innerWidth - rect.right;
        }

        setPlacement({ y: newPlacementY, x: newPlacementX });
        setCoords({
          top: topCoord,
          left: leftCoord,
          right: rightCoord,
          triggerWidth: rect.width
        });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getArrowStyles = () => {
    if (placement.x === 'center') return { left: '50%', transform: 'translateX(-50%)' };
    if (placement.x === 'left') return { left: coords.triggerWidth / 2, transform: 'translateX(-50%)' };
    if (placement.x === 'right') return { right: coords.triggerWidth / 2, transform: 'translateX(50%)' };
  };

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex items-center justify-center"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          style={{ 
            top: coords.top, 
            ...(coords.left !== null ? { left: coords.left } : {}),
            ...(coords.right !== null ? { right: coords.right } : {}),
            transform: placement.x === 'center' ? 'translateX(-50%)' : 'none'
          }}
          className={`fixed z-[10000] px-2.5 py-1.5 bg-gray-900 dark:bg-[#e0e0e0] text-white dark:text-gray-900 text-[11px] font-semibold tracking-wide rounded-md shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${placement.y === 'top' ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1'}`}
        >
          {text}
          {placement.y === 'top' ? (
            <div 
              className="absolute top-full border-4 border-transparent border-t-gray-900 dark:border-t-[#e0e0e0]"
              style={getArrowStyles()}
            />
          ) : (
            <div 
              className="absolute bottom-full border-4 border-transparent border-b-gray-900 dark:border-b-[#e0e0e0]"
              style={getArrowStyles()}
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
