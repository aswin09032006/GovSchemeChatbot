import React, { useState } from 'react';
import { X, ChevronDown, ExternalLink, Sun, Moon, Monitor } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { id: 'preferences', label: 'Preferences' },
  { id: 'memory', label: 'Memory' },
  { id: 'account', label: 'Account' }
];

function SettingsModal({ 
  isOpen, onClose, 
  theme, setTheme, 
  language, setLanguage,
  ttsSpeed, setTtsSpeed,
  autoRead, setAutoRead,
  updatePreferences,
  clearAllChats,
  currentUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('preferences');

  const handleChange = (key, value) => {
    switch (key) {
      case 'ttsSpeed': setTtsSpeed(value); break;
      case 'language': setLanguage(value); break;
      case 'theme': setTheme(value); break;
      case 'autoRead': setAutoRead(value); break;
    }
    if (updatePreferences) updatePreferences({ [key]: value });
  };
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'voiceLang', 'voice', 'language', 'theme', 'ttsSpeed'

  if (!isOpen) return null;

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const CustomToggle = ({ checked, onChange }) => (
    <button 
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-[42px] h-[24px] rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-[#259B51]' : 'bg-gray-300 dark:bg-white/20'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
  );

  const CustomSelect = ({ id, value, onChange, options }) => {
    const isOpen = openDropdown === id;
    const selectedLabel = options.find(o => o.value === value)?.label || value;
    return (
      <div className="relative">
        <button
          onClick={() => handleDropdownToggle(id)}
          className={`flex items-center justify-between min-w-[100px] h-[34px] px-3 rounded-lg border text-[13px] font-medium transition-colors ${isOpen ? 'border-gray-400 dark:border-white/30 bg-gray-50 dark:bg-white/5' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'} text-gray-900 dark:text-gray-200`}
        >
          <span>{selectedLabel}</span>
          <ChevronDown size={14} className={`ml-2 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
            <div className="absolute right-0 top-[calc(100%+4px)] w-[140px] bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-20 overflow-hidden py-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-gray-100 dark:hover:bg-white/5 ${value === opt.value ? 'bg-gray-50 dark:bg-white/5 font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpenDropdown(null);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const ThemePopover = () => {
    const isOpen = openDropdown === 'theme';
    const displayLabel = theme === 'light' ? 'Day' : theme === 'dark' ? 'Night' : 'System';
    return (
      <div className="relative">
        <button
          onClick={() => handleDropdownToggle('theme')}
          className={`flex items-center justify-between min-w-[100px] h-[34px] px-3 rounded-lg border text-[13px] font-medium transition-colors ${isOpen ? 'border-gray-400 dark:border-white/30 bg-gray-50 dark:bg-white/5' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'} text-gray-900 dark:text-gray-200`}
        >
          <span>{displayLabel}</span>
          <ChevronDown size={14} className={`ml-2 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
            <div className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-[#111827] rounded-[16px] shadow-2xl border border-gray-100 dark:border-white/10 z-20 p-2 flex gap-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => { handleChange('theme', 'light'); setOpenDropdown(null); }}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[12px] transition-all ${theme === 'light' ? 'bg-[#292625] text-white dark:bg-white dark:text-black shadow-md scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'}`}
              >
                <Sun size={20} />
                <span className="text-[13px] font-medium">Day</span>
              </button>
              <button
                onClick={() => { handleChange('theme', 'dark'); setOpenDropdown(null); }}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[12px] transition-all ${theme === 'dark' ? 'bg-[#292625] text-white dark:bg-white dark:text-black shadow-md scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'}`}
              >
                <Moon size={20} />
                <span className="text-[13px] font-medium">Night</span>
              </button>
              <button
                onClick={() => { handleChange('theme', 'system'); setOpenDropdown(null); }}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-[12px] transition-all ${theme === 'system' ? 'bg-[#292625] text-white dark:bg-white dark:text-black shadow-md scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'}`}
              >
                <Monitor size={20} />
                <span className="text-[13px] font-medium">System</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      {/* Modal Container */}
      <div className="w-full max-w-[720px] h-[85vh] max-h-[720px] flex flex-col bg-[#f3f4f6] dark:bg-[#0b0f19] rounded-[32px] shadow-2xl overflow-hidden border border-gray-200 dark:border-white/5">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 flex-shrink-0">
          <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white tracking-tight">Settings</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
          
          {/* Sidebar */}
          <div className="w-[180px] flex-shrink-0 flex flex-col gap-1 py-2 overflow-y-auto custom-scrollbar">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.isExternal && setActiveTab(item.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[14px] transition-colors text-left ${
                  activeTab === item.id && !item.isExternal
                    ? 'bg-gray-200 dark:bg-white/10 font-semibold text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-[#cfcfcf] hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                }`}
              >
                <span>{item.label}</span>
                {item.isExternal && <ExternalLink size={14} strokeWidth={2} className="opacity-60" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white/80 dark:bg-[#14141c]/80 rounded-[24px] shadow-sm overflow-visible flex flex-col backdrop-blur-xl relative">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 pt-8 px-8 bg-white/95 dark:bg-[#14141c]/95 backdrop-blur-xl">
              <div className="pb-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-[18px] font-semibold text-gray-900 dark:text-white tracking-tight capitalize">
                  {activeTab}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-visible p-8 pt-6">
              
              {activeTab === 'preferences' && (
                <div className="flex flex-col max-w-[550px]">
                  {/* Rows */}
                  <div className="flex flex-col pb-8">

                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-gray-900 dark:text-[#e2e2e2] font-medium">Language</span>
                        <CustomSelect 
                          id="language"
                          value={language} 
                          onChange={(v) => handleChange('language', v)} 
                          options={[
                            {label: 'English', value: 'English'}, 
                            {label: 'Tamil', value: 'Tamil'},
                            {label: 'Hindi', value: 'Hindi'},
                            {label: 'Telugu', value: 'Telugu'},
                            {label: 'Malayalam', value: 'Malayalam'}
                          ]} 
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-gray-900 dark:text-[#e2e2e2] font-medium">Theme</span>
                        <ThemePopover />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[15px] text-gray-900 dark:text-[#e2e2e2] font-medium">Text-to-Speech Speed</span>
                        <CustomSelect 
                          id="ttsSpeed"
                          value={ttsSpeed} 
                          onChange={(v) => handleChange('ttsSpeed', v)} 
                          options={[{label: 'Slow', value: 'Slow'}, {label: 'Normal', value: 'Normal'}, {label: 'Fast', value: 'Fast'}]} 
                        />
                      </div>

                      <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-2" />

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[15px] text-gray-900 dark:text-[#e2e2e2] font-medium">Auto-read AI Responses</span>
                          <CustomToggle checked={autoRead} onChange={(v) => handleChange('autoRead', v)} />
                        </div>
                        <span className="text-[13px] text-gray-500 dark:text-gray-400">Automatically speak out loud when the chatbot replies in text mode.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'memory' && (
                <div className="flex flex-col max-w-[550px]">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <span className="text-[15px] font-medium text-gray-900 dark:text-white">Clear all conversations</span>
                      <span className="text-[13px] text-gray-500 dark:text-[#a3a3a3]">This will permanently delete all your chat history. You cannot undo this action.</span>
                      <button onClick={clearAllChats} className="w-full py-3 bg-gray-100 dark:bg-white/5 text-red-600 dark:text-[#ff7575] text-[14px] font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors mt-2 border border-transparent dark:border-white/5">
                        Clear history
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="flex flex-col max-w-[550px]">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900 dark:text-white">Name</span>
                      <span className="text-[14px] text-gray-500 dark:text-[#a3a3a3]">{currentUser?.firstName || 'User'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-900 dark:text-white">Email</span>
                      <span className="text-[14px] text-gray-500 dark:text-[#a3a3a3]">{currentUser?.email}</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <span className="text-[15px] font-medium text-gray-900 dark:text-white">Sign out</span>
                      <span className="text-[13px] text-gray-500 dark:text-[#a3a3a3]">You will need to log back in to access your saved chat history.</span>
                      <button onClick={onLogout} className="w-full py-3 bg-gray-100 dark:bg-white/5 text-red-600 dark:text-[#ff7575] text-[14px] font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors mt-2 border border-transparent dark:border-white/5">
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
