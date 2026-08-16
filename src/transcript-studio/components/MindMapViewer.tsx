import React, { useState } from 'react';
import { MindMapNode } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Network } from 'lucide-react';

interface MindMapViewerProps {
  mindMapData?: MindMapNode;
  fileName: string;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({ mindMapData, fileName }) => {
  const [zoom, setZoom] = useState(1);

  const defaultRoot: MindMapNode = mindMapData || {
    id: 'root',
    label: fileName.replace(/\.[^/.]+$/, ''),
    type: 'root',
    color: '#6366f1',
    children: [
      {
        id: 'b1',
        label: 'Conversation Goals',
        type: 'branch',
        color: '#38bdf8',
        children: [
          { id: 'l1', label: 'Present website mockup preview', type: 'leaf' },
          { id: 'l2', label: 'Address mobile booking issues', type: 'leaf' }
        ]
      },
      {
        id: 'b2',
        label: 'Client Discussion',
        type: 'branch',
        color: '#ec4899',
        children: [
          { id: 'l3', label: 'Clarify permission & sandbox hosting', type: 'leaf' },
          { id: 'l4', label: 'Discuss customer feedback on booking', type: 'leaf' }
        ]
      },
      {
        id: 'b3',
        label: 'Scheduled Next Steps',
        type: 'branch',
        color: '#10b981',
        children: [
          { id: 'l5', label: 'Live walkthrough Friday 10:30 AM', type: 'leaf' },
          { id: 'l6', label: 'Review mobile checkout flow', type: 'leaf' }
        ]
      }
    ]
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Network className="w-4 h-4 text-indigo-400" />
          <span>Interactive Topic Diagram</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-white/10 backdrop-blur-sm">
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-300 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(1.6, prev + 0.15))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            title="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="flex-1 p-6 overflow-auto flex items-center justify-center min-h-[360px]">
        <div 
          className="transition-transform duration-200 origin-center flex flex-col items-center gap-8 max-w-lg w-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Root Node */}
          <div className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400/40 text-center">
            {defaultRoot.label}
          </div>

          {/* Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {defaultRoot.children?.map((branch, idx) => (
              <div 
                key={branch.id || idx}
                className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 shadow-lg relative group hover:border-indigo-400/50 backdrop-blur-sm transition-all"
              >
                <div 
                  className="w-full text-center py-1.5 px-2 rounded-lg font-semibold text-xs text-white"
                  style={{ backgroundColor: `${branch.color || '#6366f1'}33`, borderColor: branch.color || '#6366f1' }}
                >
                  {branch.label}
                </div>

                <div className="w-full space-y-2">
                  {branch.children?.map((leaf, leafIdx) => (
                    <div 
                      key={leaf.id || leafIdx}
                      className="text-[11px] text-slate-200 bg-white/5 rounded-lg p-2 border border-white/5 leading-tight"
                    >
                      • {leaf.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
