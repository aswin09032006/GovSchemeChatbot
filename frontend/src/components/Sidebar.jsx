import { LogOut, PanelRight, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import logoImg from "../assets/logo.png";
import { SIDEBAR_SECTION_1, SIDEBAR_SECTION_2 } from "../constants";

function Sidebar({
  startNewChat,
  recentChats,
  switchSession,
  deleteSession,
  openSettings,
  onLogout,
  currentUser
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  // Fallback defaults if currentUser is null for some reason
  const firstName = currentUser?.firstName || "Guest";
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div
      className={`flex-shrink-0 flex flex-col justify-between py-4 h-full transition-all duration-300 ease-in-out overflow-hidden px-3 ${isExpanded ? "w-[260px]" : "w-[56px]"}`}>
      
      {/* Top Header */}
      <div className="flex items-center mb-6 h-8 w-full px-1">
        <button onClick={toggleSidebar} className={`flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "w-0 opacity-0" : "w-8 opacity-100"}`}>
          <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain rounded-md" />
        </button>
        <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 pl-1" : "w-0 opacity-0 pl-0"}`}>
          <span className="font-semibold text-gray-900 dark:text-white text-[16px] whitespace-nowrap">
            PolicyPilot
          </span>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-900 dark:text-[#a3a3a3] dark:hover:text-white transition-colors flex-shrink-0">
            <PanelRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col gap-6">
        <div className="flex flex-col gap-1 w-full">
          {SIDEBAR_SECTION_1.map(({ icon: Icon, label, action, badge, actionIcon }) => (
            <button
              key={label}
              onClick={() => { if (action === "NEW_CHAT") startNewChat(); }}
              className={`hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl flex items-center w-full p-1`}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Icon size={18} strokeWidth={1.5} className={`${label === "New chat" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#a3a3a3]"}`} />
              </div>
              <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[14px] whitespace-nowrap ${label === "New chat" ? "text-gray-900 dark:text-white font-medium" : "text-gray-700 dark:text-[#e7e7e7] font-normal"}`}>
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
        <div className={`flex flex-col gap-1 mt-2 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && recentChats?.length > 0 ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"}`}>
          {recentChats?.map((chat) => (
            <div
              key={chat.sessionId}
              onClick={() => switchSession(chat.sessionId)}
              className="px-3 py-2 text-[13px] text-gray-600 dark:text-[#a3a3a3] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg cursor-pointer flex justify-between items-center group">
              <span className="truncate pr-2 whitespace-nowrap">{chat.title}</span>
              <button
                onClick={(e) => deleteSession(chat.sessionId, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400 transition-all flex-shrink-0">
                <Trash2 size={14} />
              </button>
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
            <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}>
              <span className="text-[14px] text-gray-700 dark:text-[#e7e7e7] font-normal whitespace-nowrap">
                {label}
              </span>
            </div>
          </button>
        ))}
        <button
          onClick={openSettings}
          className={`hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl flex items-center w-full p-1`}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Settings size={18} strokeWidth={1.5} className="text-gray-500 dark:text-[#a3a3a3]" />
          </div>
          <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-2" : "w-0 opacity-0 ml-0"}`}>
            <span className="text-[14px] text-gray-700 dark:text-[#e7e7e7] font-normal whitespace-nowrap">
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
        <div className={`flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "w-full opacity-100 ml-3" : "w-0 opacity-0 ml-0"}`}>
          <div className="flex flex-col">
            <span className="text-[13px] text-gray-900 dark:text-white font-medium leading-tight whitespace-nowrap">
              {firstName}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-[#888] leading-tight whitespace-nowrap">
              Free Plan
            </span>
          </div>
          <button 
            onClick={onLogout}
            title="Log Out"
            className="text-gray-500 hover:text-red-600 dark:text-[#a3a3a3] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg p-2 transition-colors">
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
