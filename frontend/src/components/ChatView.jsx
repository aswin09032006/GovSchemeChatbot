import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, ArrowUp, AudioLines, Volume2, Square, Copy, Check, Bot, ChevronDown, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import logoImg from '../assets/logo.png';
import Tooltip from './Tooltip';

const MODELS = [
  { label: 'Llama 3.1 8B', value: 'meta/llama-3.1-8b-instruct' },
  { label: 'Llama 3.1 70B', value: 'meta/llama-3.1-70b-instruct' },
  { label: 'Llama 3.1 405B', value: 'meta/llama-3.1-405b-instruct' },
  { label: 'Mixtral 8x22B', value: 'mistralai/mixtral-8x22b-instruct-v0.1' },
];

function ModelSelector({ model, setModel }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = MODELS.find(m => m.value === model)?.label || 'Model';

  return (
    <div className="relative">
      <Tooltip text="Select AI Model">
        <button 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[13px] font-medium"
        >
          <Bot size={16} />
          {selectedLabel}
          <ChevronDown size={14} className="opacity-50" />
        </button>
      </Tooltip>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-[9999] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {MODELS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => { setModel(m.value); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] flex items-center justify-between transition-colors ${
                  model === m.value 
                    ? 'bg-blue-50 dark:bg-white/10 text-blue-700 dark:text-white font-medium' 
                    : 'text-gray-700 dark:text-[#a3a3a3] hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {m.label}
                {model === m.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChatView({ messages, messagesEndRef, handleSend, input, setInput, isLoading, toggleListening, isListening, speakText, activeSpeechIndex, isStreaming, model, setModel, handleFeedback, handleRegenerate }) {
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
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-start z-10 bg-gradient-to-b from-white dark:from-[#111118] via-white/80 dark:via-[#111118]/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <ModelSelector model={model} setModel={setModel} />
        </div>
      </div>
      <div className="w-full h-full overflow-y-auto pt-20 pb-40 px-4 custom-scrollbar flex flex-col items-center">
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
                    {!(isStreaming && index === messages.length - 1) && (
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <Tooltip text={msg.feedback === 'up' ? "Remove Feedback" : "Good response"}>
                          <button 
                            onClick={() => handleFeedback(index, msg.feedback === 'up' ? null : 'up')} 
                            className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${msg.feedback === 'up' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                          >
                            <ThumbsUp size={13} className={msg.feedback === 'up' ? 'fill-current' : ''} />
                          </button>
                        </Tooltip>
                        
                        <Tooltip text={msg.feedback === 'down' ? "Remove Feedback" : "Bad response"}>
                          <button 
                            onClick={() => handleFeedback(index, msg.feedback === 'down' ? null : 'down')} 
                            className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${msg.feedback === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                          >
                            <ThumbsDown size={13} className={msg.feedback === 'down' ? 'fill-current' : ''} />
                          </button>
                        </Tooltip>

                        <Tooltip text={activeSpeechIndex === index ? "Stop Reading" : "Read Aloud"}>
                          <button 
                            onClick={() => speakText(msg.content, index)} 
                            className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${activeSpeechIndex === index ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                          >
                            {activeSpeechIndex === index ? (
                              <Square size={11} className="fill-current" />
                            ) : (
                              <Volume2 size={14} />
                            )}
                          </button>
                        </Tooltip>
                        
                        <Tooltip text={copiedIndex === index ? "Copied!" : "Copy to Clipboard"}>
                          <button 
                            onClick={() => handleCopy(msg.content, index)} 
                            className={`self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium ${copiedIndex === index ? 'text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                          >
                            {copiedIndex === index ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </Tooltip>
                        
                        <Tooltip text="Regenerate response">
                          <button 
                            onClick={() => handleRegenerate(index)} 
                            className="self-start flex items-center gap-1.5 text-[12px] transition-colors font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white"
                          >
                            <RefreshCw size={13} />
                          </button>
                        </Tooltip>
                      </div>
                    )}
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
            <div className="flex items-center gap-1">
              <Tooltip text="Attach File (Coming Soon)" delay={500}>
                <button type="button" className="p-2 text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <Plus size={18} strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip text={isListening ? "Stop Voice Input" : "Start Voice Input"} delay={500}>
                <button onClick={toggleListening} type="button" className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-100 dark:bg-red-500/20' : 'text-gray-600 dark:text-[#cfcfcf] hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'}`}>
                  <AudioLines size={18} strokeWidth={2} />
                </button>
              </Tooltip>
              {input.trim() && (
                <Tooltip text="Send Message" delay={500}>
                  <button type="submit" disabled={isLoading} className="w-8 h-8 bg-[#4D6285] dark:bg-[#5C7399] text-white flex items-center justify-center rounded-[10px] hover:bg-[#3D5275] dark:hover:bg-[#6C83A9] transition-colors disabled:opacity-50 ml-2">
                    <ArrowUp size={16} strokeWidth={2.5} />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatView;
