import { LogOut, PanelRight, Plus, Settings, Trash2, MoreHorizontal, Edit2, Pin, PinOff, Check, X as XIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import logoImg from "../assets/logo.png";
import { SIDEBAR_SECTION_1, SIDEBAR_SECTION_2 } from "../constants";
import Tooltip from "./Tooltip";

function Sidebar({
  startNewChat,
  recentChats,
  switchSession,
  deleteSession,
  renameSession,
  pinSession,
  openSettings,
  onLogout,
  currentUser,
  currentSessionId,
  isMobileOpen,
  setIsMobileOpen
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [menuConfig, setMenuConfig] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Fallback defaults if currentUser is null for some reason
  const firstName = currentUser?.firstName || "Guest";
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={closeMobile}
        />
      )}

      <div
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 flex-shrink-0 flex flex-col justify-between py-4 h-full bg-[#f8f9fa] dark:bg-[#0e131f] md:bg-transparent transition-all duration-300 ease-in-out px-3 border-r border-gray-200 dark:border-white/10 md:border-r-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${isExpanded ? "w-[280px] md:w-[260px]" : "w-[280px] md:w-[56px]"}`}
      >
        {/* Top Header */}
        <div className="flex items-center mb-6 h-8 w-full px-1 justify-between">
          <div className="flex items-center flex-1 overflow-hidden">
            <Tooltip text="Expand Sidebar" delay={500}>
              <button
                onClick={toggleSidebar}
                className={`hidden md:flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? "w-0 opacity-0" : "w-8 opacity-100"
                }`}
              >
                <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain rounded-md" />
              </button>
            </Tooltip>
            <div
              className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "w-full opacity-100 pl-1" : "w-full md:w-0 opacity-100 md:opacity-0 pl-1 md:pl-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain rounded-md md:hidden" />
                <span className="font-semibold text-gray-900 dark:text-white text-[16px] whitespace-nowrap">
                  PolicyPilot
                </span>
              </div>
              <Tooltip text="Collapse Sidebar" delay={500}>
                <button
                  onClick={toggleSidebar}
                  className="hidden md:block text-gray-500 hover:text-gray-900 dark:text-[#a3a3a3] dark:hover:text-white transition-colors flex-shrink-0"
                >
                  <PanelRight size={20} strokeWidth={1.5} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Close button on Mobile */}
          <button
            onClick={closeMobile}
            className="md:hidden text-gray-500 hover:text-gray-900 dark:text-[#a3a3a3] dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
            aria-label="Close sidebar"
          >
            <XIcon size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="flex flex-col gap-1 w-full">
            {SIDEBAR_SECTION_1.map(({ icon: Icon, label, action, badge, actionIcon }) => (
              <button
                key={label}
                onClick={() => {
                  if (action === "NEW_CHAT") {
                    startNewChat();
                    closeMobile();
                  }
                }}
                className={`hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl flex items-center w-full p-1`}
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className={`${label === "New chat" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#a3a3a3]"}`}
                  />
                </div>
                <div
                  className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? "w-full opacity-100 ml-2" : "w-full md:w-0 opacity-100 md:opacity-0 ml-2 md:ml-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[15px] whitespace-nowrap ${
                        label === "New chat" ? "text-gray-900 dark:text-white font-medium" : "text-gray-700 dark:text-[#e7e7e7] font-normal"
                      }`}
                    >
                      {label}
                    </span>
                    {badge && (
                      <span className="text-[9px] font-bold bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-white/10 text-gray-600 dark:text-[#aaa] px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {badge}
                      </span>
                    )}
                  </div>
                  {actionIcon === "PLUS" && (
                    <Plus size={16} className="text-gray-500 dark:text-[#a3a3a3] mr-2 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Recent Chats Section */}
          <div
            className={`flex flex-col mt-2 transition-all duration-300 ease-in-out ${
              (isExpanded || isMobileOpen) && recentChats?.length > 0
                ? "opacity-100 max-h-[1000px] overflow-visible"
                : "opacity-100 md:opacity-0 max-h-[1000px] md:max-h-0 overflow-visible md:overflow-hidden"
            }`}
          >
            {recentChats?.map((chat) => (
              <div
                key={chat.sessionId}
                onClick={() => {
                  if (editingChatId !== chat.sessionId) {
                    switchSession(chat.sessionId);
                    closeMobile();
                  }
                }}
                className={`px-3 py-1.5 mb-[2px] text-[14px] rounded-xl cursor-pointer flex justify-between items-center group transition-colors relative ${
                  chat.sessionId === currentSessionId
                    ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-[#a3a3a3] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
              
              {editingChatId === chat.sessionId ? (
                <div className="flex items-center w-full gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if(editTitle.trim()) renameSession(chat.sessionId, editTitle);
                        setEditingChatId(null);
                      } else if (e.key === 'Escape') {
                        setEditingChatId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 bg-white dark:bg-[#111] text-gray-900 dark:text-white border border-blue-500 rounded px-2 py-1 text-[13px] outline-none"
                  />
                  <button onClick={(e) => { e.stopPropagation(); if(editTitle.trim()) renameSession(chat.sessionId, editTitle); setEditingChatId(null); }} className="text-green-600 dark:text-green-400 p-1 flex-shrink-0 hover:bg-green-100 dark:hover:bg-green-500/20 rounded">
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingChatId(null); }} className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 flex-shrink-0 hover:bg-gray-200 dark:hover:bg-white/20 rounded">
                    <XIcon size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {chat.isPinned && <Pin size={12} className="flex-shrink-0 text-blue-500 dark:text-blue-400 fill-current" />}
                    <span className="truncate pr-2 whitespace-nowrap">{chat.title}</span>
                  </div>
                  
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (menuConfig?.id === chat.sessionId) {
                          setMenuConfig(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuConfig({
                            id: chat.sessionId,
                            x: rect.right,
                            y: rect.bottom,
                            chat
                          });
                        }
                      }}
                      className={`transition-all p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 ${menuConfig?.id === chat.sessionId ? 'opacity-100 text-gray-900 dark:text-white' : 'opacity-0 group-hover:opacity-100 text-gray-500 dark:text-[#a3a3a3]'}`}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-4 w-full">
        {SIDEBAR_SECTION_2.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={`hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl flex items-center w-full p-1`}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Icon size={18} strokeWidth={1.5} className="text-gray-500 dark:text-[#a3a3a3]" />
            </div>
            <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-2" : "w-full md:w-0 opacity-100 md:opacity-0 ml-2 md:ml-0"}`}>
              <span className="text-[14px] text-gray-700 dark:text-[#e7e7e7] font-normal whitespace-nowrap">
                {label}
              </span>
            </div>
          </button>
        ))}
        <button
          onClick={() => {
            openSettings();
            closeMobile();
          }}
          className={`hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl flex items-center w-full p-1`}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Settings size={18} strokeWidth={1.5} className="text-gray-500 dark:text-[#a3a3a3]" />
          </div>
          <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-2" : "w-full md:w-0 opacity-100 md:opacity-0 ml-2 md:ml-0"}`}>
            <span className="text-[15px] text-gray-700 dark:text-[#e7e7e7] font-normal whitespace-nowrap">
              Settings
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Profile */}
      <div className="mt-4 pt-4 flex items-center flex-shrink-0 border-t border-gray-200 dark:border-white/10 w-full">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-[#3d2f5c] text-blue-700 dark:text-[#c9b6ff] flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {initial}
        </div>
        <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-3" : "w-full md:w-0 opacity-100 md:opacity-0 ml-3 md:ml-0"}`}>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] text-gray-900 dark:text-white font-medium leading-tight whitespace-nowrap truncate">
              {firstName}
            </span>
            <span className="text-[12px] text-gray-500 dark:text-[#888] leading-tight whitespace-nowrap truncate">
              {currentUser?.email || 'guest@example.com'}
            </span>
          </div>
          <button 
            onClick={() => {
              onLogout();
              closeMobile();
            }}
            title="Log Out"
            className="text-gray-500 hover:text-red-600 dark:text-[#a3a3a3] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg p-2 transition-colors">
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {menuConfig && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setMenuConfig(null); }} />
          <div 
            style={{ 
              top: menuConfig.y + 4, 
              left: Math.max(10, Math.min(window.innerWidth - 140, menuConfig.x - 128)), 
            }}
            className="fixed w-32 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-[9999] py-1 overflow-hidden animate-in zoom-in-95 duration-100" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { pinSession(menuConfig.chat.sessionId, !menuConfig.chat.isPinned); setMenuConfig(null); }}
              className="w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 text-gray-700 dark:text-[#cfcfcf] transition-colors">
              {menuConfig.chat.isPinned ? <><PinOff size={14}/> Unpin</> : <><Pin size={14}/> Pin</>}
            </button>
            <button
              onClick={() => { setEditTitle(menuConfig.chat.title); setEditingChatId(menuConfig.chat.sessionId); setMenuConfig(null); }}
              className="w-full text-left px-3 py-2 text-[14px] hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2 text-gray-700 dark:text-[#cfcfcf] transition-colors">
              <Edit2 size={14}/> Rename
            </button>
            <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-1" />
            <button
              onClick={(e) => { deleteSession(menuConfig.chat.sessionId, e); setMenuConfig(null); }}
              className="w-full text-left px-3 py-2 text-[14px] hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors">
              <Trash2 size={14}/> Delete
            </button>
          </div>
        </>,
        document.body
      )}

      </div>
    </>
  );
}

export default Sidebar;
