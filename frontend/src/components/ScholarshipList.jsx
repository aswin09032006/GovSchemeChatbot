import React, { useState, useEffect } from 'react';
import { Landmark, ExternalLink, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SchemeCard = ({ item, idx }) => {
  const [imageSrc, setImageSrc] = useState(item.image || null);
  const [sourceInfo, setSourceInfo] = useState(item.sourceInfo || null);
  const [loading, setLoading] = useState(!item.image);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // If image is already provided and not failed, we can use it
    if (item.image && !loadFailed) {
      setImageSrc(item.image);
      setLoading(false);
      return;
    }

    // Otherwise, fetch real web image from our search pipeline
    if (item.title) {
      setLoading(true);
      fetch(`${API_BASE}/api/images/search?q=${encodeURIComponent(item.title)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then((data) => {
          if (isMounted && data?.imageUrl) {
            setImageSrc(data.imageUrl);
            setSourceInfo({
              domain: data.sourceDomain || 'Government Portal',
              url: data.sourceUrl,
              title: data.sourceTitle
            });
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
            setLoadFailed(true);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [item.title, item.image, loadFailed]);

  const handleImageError = () => {
    if (!loadFailed && item.title) {
      // Trigger search if original URL failed
      setLoadFailed(true);
    }
  };

  const getDynamicLinkLabel = () => {
    if (item.linkLabel) return item.linkLabel;
    if (item.linkText) return item.linkText;
    
    // Check if title has an acronym e.g. "Paramparagat Krishi Vikas Yojana (PKVY)" -> "Official PKVY portal"
    const matchAcronym = item.title?.match(/\(([A-Z0-9-]+)\)/);
    if (matchAcronym && matchAcronym[1]) {
      return `Official ${matchAcronym[1]} portal`;
    }

    const cleanTitle = (item.title || '').replace(/\(.*?\)/g, '').trim();
    if (cleanTitle) {
      if (cleanTitle.length > 28) {
        return `${cleanTitle.slice(0, 25)}...`;
      }
      return `${cleanTitle}`;
    }

    if (item.link) {
      try {
        const domain = new URL(item.link).hostname.replace(/^www\./, '');
        return `${domain} portal`;
      } catch {}
    }

    return 'Official scheme portal';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/[0.04] transition-all hover:bg-gray-100 dark:hover:bg-[#1e1e24]">
      {/* Cover Image Frame */}
      <div className="flex-shrink-0 w-full sm:w-[180px] h-[130px] rounded-xl overflow-hidden bg-gray-200 dark:bg-black/30 flex items-center justify-center relative shadow-sm border border-black/5 dark:border-white/[0.02]">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        ) : imageSrc && !loadFailed ? (
          <img
            src={imageSrc}
            alt={item.title || 'Scheme Cover'}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Landmark className="w-7 h-7 text-gray-300 dark:text-gray-700" />
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="flex flex-col justify-start w-full py-0.5">
        <div>
          {/* Title */}
          <h4 className="font-bold text-[16px] text-gray-900 dark:text-gray-100 leading-snug mb-1.5">
            {idx + 1}. {item.title}
          </h4>

          {/* Tag / Deadline */}
          {item.deadline && (
            <div className="mb-3">
              <span className="inline-block px-2 py-0.5 rounded bg-[#0f3c2b] text-[#34d399] font-semibold uppercase tracking-wider text-[10px]">
                {item.deadline.split(',')[0]}
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-gray-700 dark:text-[#b4b4c0] text-[14px] leading-relaxed mb-3">
              {item.description}
            </p>
          )}

          {/* Key Points */}
          {item.points && item.points.length > 0 && (
            <ul className="list-disc pl-4 text-[14px] text-gray-700 dark:text-[#b4b4c0] flex flex-col gap-1.5 mb-4 marker:text-gray-500">
              {item.points.map((point, pIdx) => {
                const parts = point.split('**');
                return (
                  <li key={pIdx}>
                    {parts.map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="text-gray-900 dark:text-gray-200 font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Link at bottom right */}
        {item.link && (
          <div className="mt-auto flex justify-end">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium text-[13px] transition-colors"
            >
              <span>{getDynamicLinkLabel()}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ScholarshipList({ data }) {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="w-full flex flex-col gap-10 mt-6 mb-6">
      {data.map((item, idx) => (
        <SchemeCard key={idx} item={item} idx={idx} />
      ))}
    </div>
  );
}
