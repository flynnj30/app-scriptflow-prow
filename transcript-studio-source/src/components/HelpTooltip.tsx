import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  icon?: 'help' | 'info';
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  icon = 'help',
  className = '',
  side = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const IconComponent = icon === 'info' ? Info : HelpCircle;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }[side];

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-indigo-300 focus:outline-none transition-colors p-0.5 rounded-full hover:bg-white/10 cursor-help"
        aria-label={title || 'Help info'}
      >
        <IconComponent className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={`absolute ${positionClasses} z-50 w-60 sm:w-68 p-3 rounded-xl bg-slate-950/95 border border-white/20 text-slate-100 shadow-2xl backdrop-blur-xl pointer-events-auto text-left animate-in fade-in zoom-in-95 duration-150`}
        >
          {title && (
            <div className="font-bold text-xs text-white mb-1 flex items-center gap-1.5 border-b border-white/10 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>{title}</span>
            </div>
          )}
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans font-normal">
            {content}
          </p>
        </div>
      )}
    </div>
  );
};
