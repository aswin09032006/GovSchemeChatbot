import React from 'react';
import { X, Glasses, AudioLines, Settings, Mic2, Mic } from 'lucide-react';

function VoiceView({ statusText, closeVoiceMode, toggleListening, isListening }) {
  return (
    <div className="absolute inset-0 w-full h-full z-50 flex flex-col items-center justify-between rounded-[20px] overflow-hidden">
      
      {/* Background Image (Dark Wavy Water) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=2070')` }}
      >
        <div className="absolute inset-0 bg-[#0B101D]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent opacity-90" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-8">
        <h2 className="text-white text-[26px] font-medium tracking-wide drop-shadow-xl text-center transition-all duration-500">
          {statusText}
        </h2>
      </div>

      {/* Bottom Pill */}
      <div className="z-10 mb-8 bg-[#181C27]/80 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full px-6 py-2.5 flex items-center gap-6">
        <button onClick={closeVoiceMode} className="text-gray-400 hover:text-white transition-colors p-1">
          <X size={20} />
        </button>
        <button 
          onClick={toggleListening} 
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isListening ? 'bg-[#294B9B] text-white shadow-[0_0_25px_rgba(41,75,155,0.6)] scale-110' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
        >
          <Mic size={22} />
        </button>
      </div>

    </div>
  );
}

export default VoiceView;
