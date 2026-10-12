import React, { useState } from 'react';
import { Send, ChevronRight } from 'lucide-react';

export default function InteractiveForm({ data, onSubmit }) {
  const [selections, setSelections] = useState({});
  const [textInputs, setTextInputs] = useState({});

  const handleSelect = (questionId, option) => {
    setSelections(prev => ({ ...prev, [questionId]: option }));
  };

  const handleTextInput = (questionId, value) => {
    setTextInputs(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const allAnswers = {};
      
      if (data.questions) {
        data.questions.forEach(q => {
          if (!q.options) {
            allAnswers[q.label] = textInputs[q.id] || '';
          } else {
            allAnswers[q.label] = selections[q.id] || '';
          }
        });
      }

      const summary = Object.entries(allAnswers)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      
      onSubmit(`I have provided: ${summary}. Please find matching schemes and guide me.`);
    }
  };

  if (!data || !data.questions) return null;

  return (
    <div className="w-full bg-white dark:bg-[#0c0c14] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mt-4 mb-4 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02]">
        <h3 className="font-semibold text-[16px] text-gray-900 dark:text-white">
          {data.title || "Let me help you find the right information"}
        </h3>
        {data.description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 leading-relaxed">{data.description}</p>
        )}
      </div>
      
      {/* Form Questions */}
      <div className="p-5 space-y-7">
        {data.questions.map((q, idx) => (
          <div key={q.id || idx}>
            <label className="block font-medium text-[14px] text-gray-800 dark:text-gray-200 mb-2.5">
              {q.label}
              {q.optional && <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">(optional)</span>}
            </label>

            {/* Text / Number / Generic Input */}
            {(!q.type || q.type === 'text' || q.type === 'number' || (q.type !== 'radio' && q.type !== 'checkbox' && q.type !== 'textarea')) && !q.options && (
              <input
                type={q.type === 'number' ? 'number' : 'text'}
                placeholder={q.placeholder || ''}
                value={textInputs[q.id] || ''}
                onChange={(e) => handleTextInput(q.id, e.target.value)}
                className="w-full bg-white dark:bg-[#14141e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            )}

            {/* Textarea */}
            {q.type === 'textarea' && (
              <textarea
                placeholder={q.placeholder || ''}
                value={textInputs[q.id] || ''}
                onChange={(e) => handleTextInput(q.id, e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-[#14141e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
              />
            )}

            {/* Radio Options (default) */}
            {(!q.type || q.type === 'radio') && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selections[q.id] === opt;
                  return (
                    <label 
                      key={oIdx} 
                      onClick={() => handleSelect(q.id, opt)} 
                      className={`flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' 
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected 
                          ? 'border-emerald-500' 
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Checkbox Options */}
            {q.type === 'checkbox' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const selected = (selections[q.id] || []);
                  const isChecked = Array.isArray(selected) && selected.includes(opt);
                  return (
                    <label 
                      key={oIdx}
                      onClick={() => {
                        const prev = Array.isArray(selections[q.id]) ? selections[q.id] : [];
                        const next = isChecked ? prev.filter(x => x !== opt) : [...prev, opt];
                        setSelections(p => ({ ...p, [q.id]: next }));
                      }}
                      className={`flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${isChecked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="p-5 pt-2">
        <button 
          onClick={handleSubmit}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>{data.buttonText || "Find schemes matching my profile"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
