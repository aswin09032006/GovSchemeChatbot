import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Plus, ArrowUp, AudioLines, Volume2, Square, Copy, Check, Bot, ChevronDown, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import logoImg from '../assets/logo.png';
import Tooltip from './Tooltip';

import InteractiveForm from './InteractiveForm';
import ScholarshipList from './ScholarshipList';
import LinksBlock from './LinksBlock';
import TableBlock from './TableBlock';
import MapBlock from './MapBlock';

import { parse } from 'partial-json';

const parseMessageBlocks = (content) => {
  const jsonStart = content.indexOf('{');
  
  if (jsonStart !== -1) {
    const jsonStr = content.slice(jsonStart);
    try {
      const parsed = parse(jsonStr);
      if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
        const preText = content.slice(0, jsonStart).trim();
        const blocks = [...parsed.blocks];
        
        // If there was any text before the JSON (like tool status messages), add it as a markdown block first
        if (preText) {
          blocks.unshift({ type: 'markdown', content: preText });
        }
        
        return blocks;
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  // Fallback for raw text (e.g. user messages, errors, old messages)
  return [{ type: 'markdown', content }];
};

const cleanMarkdownContent = (content) => {
  if (!content || typeof content !== 'string') return '';
  let text = content;

  // Convert obvious section titles (without #) into Markdown ### headers
  text = text.replace(/^(Application Steps[^\n]*|Important Points[^\n]*|Eligibility Criteria[^\n]*|Required Documents[^\n]*|Key Benefits[^\n]*):?/gim, '\n\n### $1\n\n');

  // Convert lines starting with "Title:" or "**Title:**" into bullet points if not already a list
  text = text.replace(/^([A-Z][A-Za-z0-9\s()/-]{2,40}):\s+(.*)$/gm, '- **$1:** $2');

  // Ensure lines with single line breaks have breathing room
  text = text.replace(/([^\n])\n(?!\n|[#\-*\d>])/g, '$1\n\n');

  return text.trim();
};

function ChatView({ messages, messagesEndRef, handleSend, input, setInput, isLoading, toggleListening, isListening, speakText, activeSpeechIndex, isStreaming, handleFeedback, handleRegenerate }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleDownloadPDF = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/form/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Application_${formData.schemeName ? formData.schemeName.replace(/\s+/g, '_') : 'Form'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full overflow-y-auto pt-8 pb-40 px-4 custom-scrollbar flex flex-col items-center">
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
                    <div className="flex flex-col w-full gap-4">
                      {parseMessageBlocks(msg.content).map((block, bIdx) => {
                        if (block.type === 'markdown') {
                          return (
                            <div key={bIdx} className="w-full text-gray-800 dark:text-gray-200">
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-3">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mt-5 mb-2">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 mb-3.5">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="space-y-2.5 my-3 list-disc pl-5 marker:text-emerald-500">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="space-y-2.5 my-3 list-decimal pl-5 text-gray-800 dark:text-gray-200 marker:font-medium marker:text-gray-500 dark:marker:text-gray-400">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children, ...props }) => {
                                    // Check if this li is inside an ol by looking at props or relying on CSS. 
                                    // ReactMarkdown passes ordered={true} for OL items in older versions, but just standard props here.
                                    // To avoid breaking OL decimal numbers, we render a clean LI.
                                    // For UL, we can add a custom dot via pseudo-elements or a span if we detect unordered.
                                    // An easier way is just relying on clean Tailwind list styles.
                                    return (
                                      <li className="text-[14.5px] sm:text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 relative pl-1">
                                        {children}
                                      </li>
                                    );
                                  },
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-900 dark:text-white">
                                      {children}
                                    </strong>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-2.5 rounded-r-xl my-3 text-sm text-gray-700 dark:text-gray-300">
                                      {children}
                                    </blockquote>
                                  )
                                }}
                              >
                                {cleanMarkdownContent(block.content || '')}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                        if (block.type === 'form' && !(isStreaming && index === messages.length - 1)) {
                          return <InteractiveForm key={bIdx} data={block.data} onSubmit={(query) => { setInput(query); handleSend({ preventDefault: () => {} }); }} />;
                        }
                        if (block.type === 'scholarships' && !(isStreaming && index === messages.length - 1)) {
                          return <ScholarshipList key={bIdx} data={block.data} />;
                        }
                        if (block.type === 'links' && !(isStreaming && index === messages.length - 1)) {
                          return <LinksBlock key={bIdx} data={block.data} />;
                        }
                        if (block.type === 'table' && !(isStreaming && index === messages.length - 1)) {
                          return <TableBlock key={bIdx} data={block.data} />;
                        }
                        if (block.type === 'map' && !(isStreaming && index === messages.length - 1)) {
                          return <MapBlock key={bIdx} data={block.data} />;
                        }
                        if (block.type === 'form_complete' && !(isStreaming && index === messages.length - 1)) {
                          return (
                            <div key={bIdx} className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-xl flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-blue-900 dark:text-blue-100">Application Form Ready</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">Click below to download your pre-filled PDF.</div>
                              </div>
                              <button 
                                onClick={() => handleDownloadPDF(block.data)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                Download PDF
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
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
