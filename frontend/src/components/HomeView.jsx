import React from 'react';
import { Plus, ArrowUp, Glasses, AudioLines, Info, MoreHorizontal, MessageSquare, Landmark, Trash2 } from 'lucide-react';
import Tooltip from "./Tooltip";
import { POPULAR_SCHEMES, ROW_ONE_CHIPS, ROW_TWO_CHIPS } from "../constants";
import { formatTime } from "../utils/formatTime";

function HomeView({
  handleSend,
  input,
  setInput,
  isLoading,
  recentChats,
  switchSession,
  deleteSession,
  toggleListening,
  isListening,
  currentUser,
}) {
  const firstName = currentUser?.firstName || "Guest";

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="w-full flex flex-col items-center my-auto py-6">
        <h1 className="text-[30px] font-semibold text-gray-900 dark:text-white tracking-[-0.01em] drop-shadow-md">
          Hi {firstName}, what should we dive into today?
        </h1>

        <form
          onSubmit={handleSend}
          className="w-full max-w-[750px] bg-white/80 dark:bg-[#14141c]/80 shadow-2xl rounded-[32px] p-3 flex flex-col border border-gray-200 dark:border-white/[0.08] focus-within:border-gray-400 dark:focus-within:border-white/20 transition-all mt-4">
          <div className="flex-1 flex flex-col mb-12">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full px-3 py-1 outline-none text-[15px] bg-transparent text-gray-900 dark:text-[#e7e7e7] placeholder-gray-500 dark:placeholder-[#8a8a8f]"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-1">
              <Tooltip text="Attach File (Coming Soon)" delay={500}>
                <button
                  type="button"
                  className="p-2 text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <Plus size={18} strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip text={isListening ? "Stop Voice Input" : "Start Voice Input"} delay={500}>
                <button
                  onClick={toggleListening}
                  type="button"
                  className={`p-2 rounded-full transition-colors ${isListening ? "text-red-500 bg-red-100 dark:bg-red-500/20" : "text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"}`}>
                  <AudioLines size={18} strokeWidth={2} />
                </button>
              </Tooltip>
              {input.trim() && (
                <Tooltip text="Send Message" delay={500}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-8 h-8 bg-[#4D6285] dark:bg-[#5C7399] text-white flex items-center justify-center rounded-[10px] hover:bg-[#3D5275] dark:hover:bg-[#6C83A9] transition-colors disabled:opacity-50 ml-2">
                    <ArrowUp size={16} strokeWidth={2.5} />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </form>

      {/* Suggestion Chips */}
      <div className="flex flex-col items-center mt-6 gap-2 w-full max-w-[800px]">
        <div className="flex justify-center flex-wrap gap-2">
          {ROW_ONE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={(e) => handleSend(e, chip)}
              className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:bg-white/90 dark:hover:bg-white/5 text-[13px] text-gray-800 dark:text-[#e7e7e7] shadow-sm backdrop-blur-md transition-all whitespace-nowrap font-medium">
              {chip}
            </button>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-2">
          {ROW_TWO_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={(e) => handleSend(e, chip)}
              className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 hover:bg-white/90 dark:hover:bg-white/5 text-[13px] text-gray-800 dark:text-[#e7e7e7] shadow-sm backdrop-blur-md transition-all whitespace-nowrap font-medium">
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Area */}
      <div className="flex gap-4 w-full max-w-[800px] mt-14 mb-4">
        {/* Left Card: Popular Schemes */}
        <div className="flex-1 rounded-[24px] border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#14141c]/60 backdrop-blur-xl p-4 flex flex-col gap-4 min-h-[220px]">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <Landmark
                size={14}
                className="text-gray-500 dark:text-[#a3a3a3]"
              />
              <span className="text-[12px] font-medium text-gray-700 dark:text-[#a3a3a3]">
                Popular Gov Schemes
              </span>
            </div>
            <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-[#a3a3a3]">
              <Info size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
            {POPULAR_SCHEMES.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group justify-between"
                onClick={(e) => handleSend(e, item.title)}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-[#111111]/50 flex items-center justify-center border border-transparent dark:border-white/5 shadow-sm flex-shrink-0">
                    <Landmark
                      size={14}
                      className="text-blue-600 dark:text-[#a3a3a3]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 dark:text-[#eaeaea] truncate leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-[#8f8f8f] truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <MoreHorizontal
                  size={16}
                  strokeWidth={2}
                  className="text-gray-400 dark:text-[#777] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Recent Chats */}
        <div className="flex-1 rounded-[24px] border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#14141c]/60 backdrop-blur-xl p-4 flex flex-col gap-4 min-h-[220px]">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={14}
                className="text-gray-500 dark:text-[#a3a3a3]"
              />
              <span className="text-[12px] font-medium text-gray-700 dark:text-[#a3a3a3]">
                Keep talking to AI
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
            {recentChats.length === 0 ? (
              <div className="text-gray-500 dark:text-[#8f8f8f] text-[13px] py-4 text-center">
                No recent chats. Send a message to start!
              </div>
            ) : (
              recentChats.slice(0, 3).map((item) => (
                <div
                  key={item.sessionId}
                  onClick={() => switchSession(item.sessionId)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#111111]/50 flex items-center justify-center border border-transparent dark:border-white/5 shadow-sm flex-shrink-0">
                      <MessageSquare
                        size={14}
                        className="text-gray-500 dark:text-[#a3a3a3]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 dark:text-[#eaeaea] truncate leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-[#8f8f8f]">
                        {formatTime(item.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(item.sessionId, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-[#777] hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0 p-1">
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-white/80 dark:text-[#888] text-[11px] max-w-[600px] text-center mt-auto pb-4 drop-shadow-md font-medium">
        PolicyPilot is an AI and may make mistakes. Your conversations are
        personalized and your activity helps train AI.
        <br />
        <span className="underline cursor-pointer hover:text-white transition-colors">
          Opt out
        </span>
        .
      </p>
    </div>
    </div>
  );
}

export default HomeView;
