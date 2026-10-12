import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SquareArrowOutUpRight, Minus, Square, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import SettingsModal from './components/SettingsModal';
import AuthView from './components/AuthView';
import bgImage from './assets/bg.png';

const API_URL = 'http://localhost:5000/api/chat';

const getLocaleCode = (lang) => {
  switch (lang) {
    case 'Tamil': return 'ta-IN';
    case 'Hindi': return 'hi-IN';
    case 'Telugu': return 'te-IN';
    case 'Malayalam': return 'ml-IN';
    case 'English':
    default: return 'en-US';
  }
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine sessionId from URL instead of state
  const sessionIdMatch = location.pathname.match(/^\/c\/([^\/]+)$/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : '';
  const isNavigatingToNewChat = useRef(false);

  const [recentChats, setRecentChats] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('govSchemeTheme') || 'system');
  const [language, setLanguage] = useState(localStorage.getItem('govSchemeLanguage') || 'English');
  const [ttsSpeed, setTtsSpeed] = useState('Normal');
  const [autoRead, setAutoRead] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const isChatView = location.pathname.startsWith('/c/');

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = getLocaleCode(language);
      try { recognitionRef.current.start(); } catch (e) {}
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendRef.current(null, transcript, true);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking(); // Interrupt the bot if it's currently speaking
      startListening();
    }
  };

  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechIndex(null);
  };

  // --- FIX 1: Updated speakText for Edge compatibility ---
  const speakText = (text, messageId, onEndCallback) => {
    // If clicking the same message that's currently speaking, toggle it off
    if (activeSpeechIndex === messageId && messageId !== null) {
      stopSpeaking();
      if (onEndCallback) onEndCallback();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      if (onEndCallback) onEndCallback();
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    setActiveSpeechIndex(messageId);

    // Strip markdown formatting for natural reading
    const cleanText = text
      .replace(/[-=]{2,}/g, '')              // Remove markdown dividers like --- or ===
      .replace(/[*_~`#=]/g, '')              // Remove bold, italic, strikethrough, code, headers, and equals symbols
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')    // Replace links with just their display text
      .replace(/^\s*[-*+]\s+/gm, '')         // Remove bullet point markers
      .replace(/^\s*\d+\.\s+/gm, '')         // Remove numbered list markers
      .replace(/>\s*/g, '')                  // Remove blockquote markers
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = getLocaleCode(language);
    utterance.lang = targetLang;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let voiceMatch = voices.find(v => v.lang === targetLang && v.name.includes('Natural')) 
                    || voices.find(v => v.lang === targetLang) 
                    || voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (voiceMatch) {
        utterance.voice = voiceMatch;
      }
    }

    if (ttsSpeed === 'Slow') utterance.rate = 0.8;
    else if (ttsSpeed === 'Fast') utterance.rate = 1.2;
    else utterance.rate = 1.0;

    utterance.onend = () => {
      setActiveSpeechIndex(prev => prev === messageId ? null : prev);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      setActiveSpeechIndex(prev => prev === messageId ? null : prev);
      if (onEndCallback) onEndCallback();
    };

    window.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Force browsers (like Edge) to preload voices in the background
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('govSchemeTheme', theme);

    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('govSchemeLanguage', language);
  }, [language]);

  const [authToken, setAuthToken] = useState(localStorage.getItem('govSchemeAuthToken') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('govSchemeUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Axios interceptor for setting Auth Header immediately
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      fetchSessions();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setMessages([]);
      setRecentChats([]);
      navigate('/', { replace: true });
    }
  }, [authToken]);

  const fetchSessions = () => {
    if (!authToken) return;
    axios.get(`${API_URL}/sessions`)
      .then(res => setRecentChats(res.data || []))
      .catch(err => console.error("Error fetching sessions", err));
  };

  useEffect(() => {
    if (sessionId && authToken) {
      if (isNavigatingToNewChat.current) {
        isNavigatingToNewChat.current = false;
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      axios.get(`${API_URL}/${sessionId}`)
        .then(res => setMessages(res.data.messages || []))
        .catch(err => {
          console.error("Error fetching chat history", err);
          if (err.response && err.response.status === 404) {
            navigate('/', { replace: true });
          }
        });
    } else {
      setMessages([]);
    }
  }, [sessionId, authToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatView]);

  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async (e, customInput = null, fromVoice = false) => {
    if (e) e.preventDefault();
    const messageContent = customInput || input;
    if (!messageContent.trim()) return;

    if (fromVoice) {
      stopListening();
    }

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionId: sessionId || null,
          content: messageContent,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const aiMessageIndex = messages.length + 1; // Predict index of the incoming AI message
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiResponseContent = '';
      let isFirstChunk = true;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE events are separated by double newlines
        const events = buffer.split('\n\n');
        // Keep the last partial event in the buffer
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.trim().slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  console.error("Stream error:", parsed.error);
                  break;
                }
                if (parsed.sessionId && !sessionId) {
                  isNavigatingToNewChat.current = true;
                  navigate(`/c/${parsed.sessionId}`, { replace: true });
                }
                if (parsed.content) {
                  if (isFirstChunk) {
                    // Hide bouncing dots and show the first word
                    setIsLoading(false);
                    setIsStreaming(true);
                    aiResponseContent = parsed.content;
                    setMessages(prev => [...prev, { role: 'assistant', content: aiResponseContent }]);
                    isFirstChunk = false;
                  } else {
                    aiResponseContent += parsed.content;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = { role: 'assistant', content: aiResponseContent };
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                // Ignore partial or malformed JSON chunks
              }
            }
          }
        }
      }

      setIsStreaming(false);
      fetchSessions(); // Refresh recent chats after sending a message

      if (fromVoice && aiResponseContent) {
        speakText(aiResponseContent, aiMessageIndex, () => {});
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // keep handleSendRef pointed at the latest handleSend on every render
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const startNewChat = () => {
    navigate('/');
  };

  const switchSession = (id) => {
    navigate(`/c/${id}`);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation(); // Prevent clicking the chat item
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      if (sessionId === id) {
        navigate('/');
      }
      fetchSessions();
    } catch (err) {
      console.error("Error deleting session", err);
    }
  };

  const handleFeedback = async (messageIndex, feedbackType) => {
    try {
      setMessages(prev => prev.map((msg, i) => 
        i === messageIndex ? { ...msg, feedback: feedbackType } : msg
      ));
      await axios.put(`${API_URL}/${sessionId}/message/${messageIndex}/feedback`, { feedback: feedbackType });
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  const handleRegenerate = async (messageIndex) => {
    if (!sessionId) return;
    setIsLoading(true);
    setIsStreaming(true);
    
    // The new length of messages will be messageIndex (truncating the AI message and beyond)
    setMessages(prev => prev.slice(0, messageIndex));
    
    try {
      const response = await fetch(`${API_URL}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionId,
          messageIndex,
          language
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiResponseContent = '';
      let isFirstChunk = true;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim();
              if (dataStr === '[DONE]') {
                setIsStreaming(false);
                if (autoRead) {
                  speakText(aiResponseContent, messageIndex, () => {});
                }
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.sessionId && !sessionId) {
                  navigate(`/c/${data.sessionId}`, { replace: true });
                } else if (data.error) {
                  console.error("Server Error:", data.error);
                } else if (data.content) {
                  aiResponseContent += data.content;
                  if (isFirstChunk) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      newMessages[messageIndex] = { role: 'assistant', content: data.content };
                      return newMessages;
                    });
                    isFirstChunk = false;
                  } else {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      newMessages[messageIndex] = { role: 'assistant', content: aiResponseContent };
                      return newMessages;
                    });
                  }
                }
              } catch (e) {
                // Ignore incomplete JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to regenerate', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      fetchSessions();
    }
  };

  const renameSession = async (id, newTitle) => {
    try {
      await axios.put(`${API_URL}/${id}`, { title: newTitle });
      fetchSessions();
    } catch (err) {
      console.error("Error renaming session", err);
    }
  };

  const pinSession = async (id, isPinned) => {
    try {
      await axios.put(`${API_URL}/${id}`, { isPinned });
      fetchSessions();
    } catch (err) {
      console.error("Error pinning session", err);
    }
  };

  const clearAllChats = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all chat history?")) return;
    try {
      await axios.delete(`${API_URL}/all`);
      setRecentChats([]);
      navigate('/');
    } catch (err) {
      console.error("Failed to clear chat history", err);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await axios.put(`${API_URL.replace('/chat', '/auth')}/preferences`, newPrefs);
      const updatedUser = { ...currentUser, preferences: res.data.preferences };
      setCurrentUser(updatedUser);
      localStorage.setItem('govSchemeUser', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('govSchemeAuthToken', token);
    localStorage.setItem('govSchemeUser', JSON.stringify(user));
    setAuthToken(token);
    setCurrentUser(user);

    if (user.preferences) {
      setTheme(user.preferences.theme || 'system');
      setLanguage(user.preferences.language || 'English');
      setVoiceLang(user.preferences.voiceLang || 'Auto-detect');
      setVoice(user.preferences.voice || 'Wave');
      setTtsSpeed(user.preferences.ttsSpeed || 'Normal');
      setAutoRead(user.preferences.autoRead || false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('govSchemeAuthToken');
    localStorage.removeItem('govSchemeSessionId');
    localStorage.removeItem('govSchemeUser');
    setAuthToken(null);
    setCurrentUser(null);
  };

  if (!authToken) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] dark:bg-[#0b0f19] text-gray-900 dark:text-[#e7e7e7] p-2 gap-2 selection:bg-blue-500/30">

      <Sidebar
        startNewChat={startNewChat}
        recentChats={recentChats}
        switchSession={switchSession}
        deleteSession={deleteSession}
        renameSession={renameSession}
        pinSession={pinSession}
        openSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        currentSessionId={sessionId}
      />

      {/* Main Container */}
      <div className={`relative z-10 flex-1 h-full flex flex-col items-center transition-all duration-500 overflow-x-hidden rounded-[20px] border border-gray-200 dark:border-white/[0.08] ${isChatView ? 'overflow-hidden justify-between' : 'overflow-y-auto'}`}>

        {/* Confined Nature Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-[-2]"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        {!isChatView && <div className="absolute inset-0 bg-transparent dark:bg-black/30 pointer-events-none z-[-1]" />}
        {isChatView && <div className="absolute inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-2xl z-[-1]" />}

        {isListening && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[0] animate-breathe voice-gradient-light dark:voice-gradient-dark transition-opacity duration-300" />
        )}

        <Routes>
          <Route path="/" element={
            <HomeView
              handleSend={handleSend}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              recentChats={recentChats}
              switchSession={switchSession}
              deleteSession={deleteSession}
              toggleListening={toggleListening}
              isListening={isListening}
              currentUser={currentUser}
              handleFeedback={handleFeedback}
              handleRegenerate={handleRegenerate}
            />
          } />
          <Route path="/c/:id" element={
            <ChatView
              messages={messages}
              messagesEndRef={messagesEndRef}
              handleSend={handleSend}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              toggleListening={toggleListening}
              isListening={isListening}
              speakText={speakText}
              activeSpeechIndex={activeSpeechIndex}
              isStreaming={isStreaming}
              handleFeedback={handleFeedback}
              handleRegenerate={handleRegenerate}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme} setTheme={setTheme}
        language={language} setLanguage={setLanguage}
        ttsSpeed={ttsSpeed} setTtsSpeed={setTtsSpeed}
        autoRead={autoRead} setAutoRead={setAutoRead}
        updatePreferences={updatePreferences}
        clearAllChats={clearAllChats}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
