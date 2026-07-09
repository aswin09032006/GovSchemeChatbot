import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, ArrowUp, AudioLines, Volume2, Square, Copy, Check } from 'lucide-react';
import logoImg from '../assets/logo.png';

function ChatView({ messages, messagesEndRef, handleSend, input, setInput, isLoading, toggleListening, isListening, speakText, activeSpeechIndex }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="w-full h-full relative">
      {/* Scrollable Container (Full Width) */}
      <div className="w-full h-full overflow-y-auto pt-8 pb-40 px-4 custom-scrollbar flex flex-col items-center">
        {/* Messages Wrapper (Max Width) */}
        <div className="w-full max-w-[800px] flex flex-col">
          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                  <img src={logoImg} alt="AI Logo" className="w-7 h-7 object-contain rounded-md" />
                </div>
              )}

              <div className={`max-w-[85%] text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-gray-200 dark:bg-white/10 px-5 py-3 rounded-2xl rounded-tr-sm text-gray-900 dark:text-[#eee]' : 'text-gray-800 dark:text-[#d1d1d1]'}`}>
                {msg.role === 'assistant' ? (
                  <div className="flex flex-col">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => speakText(msg.content, index)} 
                        className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${activeSpeechIndex === index ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                      >
                        {activeSpeechIndex === index ? (
                          <><Square size={11} className="fill-current" /> Stop Reading</>
                        ) : (
                          <><Volume2 size={14} /> Read Aloud</>
                        )}
                      </button>
                      <button 
                        onClick={() => handleCopy(msg.content, index)} 
                        className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${copiedIndex === index ? 'text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                      >
                        {copiedIndex === index ? (
                          <><Check size={14} /> Copied!</>
                        ) : (
                          <><Copy size={13} /> Copy</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex w-full mb-8 justify-start">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                <img src={logoImg} alt="AI Logo" className="w-7 h-7 object-contain rounded-md" />
              </div>
              <div className="max-w-[85%] text-[15px] leading-relaxed text-gray-800 dark:text-[#d1d1d1] flex items-center gap-1.5 pt-2">
                <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-[#888] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-[#888] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-[#888] rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full absolute bottom-0 left-0 flex justify-center px-4 bg-gradient-to-t from-[#f3f4f6] dark:from-[#0b0f19] via-[#f3f4f6]/90 dark:via-[#0b0f19]/90 to-transparent pt-20 pb-8 rounded-b-[20px] pointer-events-none">
        <form
          onSubmit={handleSend}
          className="w-full max-w-[750px] bg-white/90 dark:bg-[#14141c]/90 shadow-2xl rounded-3xl p-3 flex flex-col border border-gray-200 dark:border-white/[0.08] focus-within:border-gray-400 dark:focus-within:border-white/20 transition-all pointer-events-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full px-3 py-1 mb-3 outline-none text-[15px] bg-transparent text-gray-900 dark:text-[#e7e7e7] placeholder-gray-500 dark:placeholder-[#8a8a8f]"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2">
              <button type="button" className="p-2 text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <Plus size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleListening} type="button" className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-500/20' : 'text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>
                <AudioLines size={18} strokeWidth={2} />
              </button>
              {input.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-8 h-8 bg-[#4D6285] dark:bg-[#5C7399] text-white flex items-center justify-center rounded-[10px] hover:bg-[#3D5275] dark:hover:bg-[#6C83A9] transition-colors disabled:opacity-50 ml-2"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatView;
