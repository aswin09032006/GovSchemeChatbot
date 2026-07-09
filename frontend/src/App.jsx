import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SquareArrowOutUpRight, Minus, Square, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('govSchemeSessionId') || '');
  const [recentChats, setRecentChats] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('govSchemeTheme') || 'system');
  const [language, setLanguage] = useState(localStorage.getItem('govSchemeLanguage') || 'English');
  const [voiceLang, setVoiceLang] = useState('Auto-detect');
  const [voice, setVoice] = useState('Wave');
  const [ttsSpeed, setTtsSpeed] = useState('Normal');
  const [autoRead, setAutoRead] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const isChatView = messages.length > 0;

  // Voice Mode State
  const [isVoiceModeState, setIsVoiceModeState] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("I'm listening...");
  const isVoiceModeRef = useRef(false);

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

  const setIsVoiceMode = (val) => {
    setIsVoiceModeState(val);
    isVoiceModeRef.current = val;
    if (val) {
      setVoiceStatus("I'm listening...");
      startListening();
    } else {
      stopListening();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  };

  // --- FIX 2: keep a live ref to handleSend so the recognition handler
  // (registered once on mount) always calls the CURRENT version, with
  // up-to-date sessionId/language/etc, instead of a stale closure. ---
  const handleSendRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (isVoiceModeRef.current) {
          // use the latest handleSend, not the one captured at mount
          handleSendRef.current(null, transcript, true);
        } else {
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (isVoiceModeRef.current && event.error === 'no-speech') {
          // auto restart if no speech
          setTimeout(() => { if (isVoiceModeRef.current) startListening(); }, 100);
        }
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
    if (!isVoiceModeState) {
      setIsVoiceMode(true);
    } else {
      if (isListening) {
        stopListening();
      } else {
        stopSpeaking(); // Interrupt the bot if it's currently speaking
        setVoiceStatus("I'm listening...");
        startListening();
      }
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

    const cleanText = text.replace(/[*#_`~]/g, '');

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
      setSessionId('');
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
      // Ensure token is attached before requesting
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      axios.get(`${API_URL}/${sessionId}`)
        .then(res => setMessages(res.data.messages || []))
        .catch(err => console.error("Error fetching chat history", err));
    }
  }, [sessionId, authToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatView]);

  const handleSend = async (e, customInput = null, fromVoice = false) => {
    if (e) e.preventDefault();
    const messageContent = customInput || input;
    if (!messageContent.trim()) return;

    if (fromVoice && isVoiceModeRef.current) {
      setVoiceStatus("Thinking...");
      stopListening();
    }

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(API_URL, {
        sessionId: sessionId || null,
        content: messageContent,
        language: language
      });
      if (!sessionId) {
        setSessionId(res.data.sessionId);
        localStorage.setItem('govSchemeSessionId', res.data.sessionId);
      }
      setMessages(prev => [...prev, res.data.message]);
      fetchSessions(); // Refresh recent chats after sending a message

      if (fromVoice && isVoiceModeRef.current) {
        setVoiceStatus("Speaking...");
        speakText(res.data.message.content, 'voice_mode', () => {
          if (isVoiceModeRef.current) {
            setVoiceStatus("I'm listening...");
            startListening();
          }
        });
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
      if (fromVoice && isVoiceModeRef.current) {
        setVoiceStatus("Error occurred.");
        setTimeout(() => {
          if (isVoiceModeRef.current) {
            setVoiceStatus("I'm listening...");
            startListening();
          }
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // keep handleSendRef pointed at the latest handleSend on every render
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const startNewChat = () => {
    setSessionId('');
    localStorage.removeItem('govSchemeSessionId');
    setMessages([]);
  };

  const switchSession = (id) => {
    setSessionId(id);
    localStorage.setItem('govSchemeSessionId', id);
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation(); // Prevent clicking the chat item
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      if (sessionId === id) {
        startNewChat();
      }
      fetchSessions();
    } catch (err) {
      console.error("Error deleting session", err);
    }
  };

  const clearAllChats = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all chat history?")) return;
    try {
      await axios.delete(`${API_URL}/all`);
      setRecentChats([]);
      startNewChat();
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
        openSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
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

        {isVoiceModeState ? (
          <VoiceView
            statusText={voiceStatus}
            closeVoiceMode={() => setIsVoiceMode(false)}
            toggleListening={toggleListening}
            isListening={isListening}
          />
        ) : !isChatView ? (
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
          />
        ) : (
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
          />
        )}

      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme} setTheme={setTheme}
        language={language} setLanguage={setLanguage}
        voiceLang={voiceLang} setVoiceLang={setVoiceLang}
        voice={voice} setVoice={setVoice}
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