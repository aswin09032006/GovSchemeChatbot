import React, { useState } from 'react';
import { 
  MapPin, Navigation, ExternalLink, Copy, Check, Clock, 
  Building2, Phone, Compass, Layers, Maximize2, Minimize2 
} from 'lucide-react';

export default function MapBlock({ data }) {
  if (!data) return null;

  const places = Array.isArray(data.places) && data.places.length > 0 
    ? data.places 
    : (data.query ? [{ name: data.title || 'Location', query: data.query, address: data.query }] : []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map' | 'cards'
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  const activePlace = places[activeIndex] || places[0];

  const mapQuery = activePlace 
    ? (activePlace.query || `${activePlace.name} ${activePlace.address || ''}`.trim()) 
    : (data.query || 'Government Office');

  const encodedQuery = encodeURIComponent(mapQuery);
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  const handleCopyAddress = (e, addr, idx) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePlaceSelect = (idx) => {
    if (idx !== activeIndex) {
      setMapLoading(true);
      setActiveIndex(idx);
    }
  };

  return (
    <div className={`w-full max-w-full my-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161821] shadow-lg shadow-black/5 overflow-hidden transition-all duration-300 min-w-0 ${isExpanded ? 'ring-2 ring-emerald-500/50' : ''}`}>
      {/* Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1b1e2a] dark:via-[#161821] dark:to-[#1b1e2a] border-b border-gray-150 dark:border-white/10 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13.5px] sm:text-[14.5px] font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
              <span className="truncate">{data.title || "Nearby Service Centers & Offices"}</span>
              {places.length > 0 && (
                <span className="text-[10px] sm:text-[11px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                  {places.length}
                </span>
              )}
            </h4>
            {activePlace?.name && (
              <p className="text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 truncate">
                Active: <span className="font-medium text-gray-700 dark:text-gray-300">{activePlace.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* View Mode & Actions Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {places.length > 1 && (
            <div className="hidden sm:flex items-center p-0.5 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200/80 dark:border-white/5 text-[12px]">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${viewMode === 'split' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${viewMode === 'cards' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                List
              </button>
            </div>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] sm:text-[12.5px] font-medium shadow-sm transition-all shrink-0"
            title="Get Turn-by-Turn Directions"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Directions</span>
          </a>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0"
            title={isExpanded ? "Collapse map height" : "Expand map height"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`w-full ${viewMode === 'cards' ? 'hidden' : 'block'}`}>
        {/* Interactive Map Iframe Container */}
        <div className={`relative w-full bg-gray-100 dark:bg-black/30 transition-all duration-300 ${isExpanded ? 'h-[460px]' : 'h-[280px] sm:h-[340px]'}`}>
          {mapLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 dark:bg-[#161821]/90 backdrop-blur-sm z-10 transition-opacity">
              <div className="relative">
                <MapPin className="w-8 h-8 text-emerald-500 animate-bounce" />
                <div className="w-6 h-2 bg-emerald-500/20 rounded-full mx-auto blur-[2px]" />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">Loading interactive map...</p>
            </div>
          )}

          <iframe
            key={embedUrl}
            title={activePlace?.name || data.title || "Location Map"}
            src={embedUrl}
            onLoad={() => setMapLoading(false)}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Quick Floating Badge on Top of Map */}
          <div className="absolute top-3 left-3 z-[5] max-w-[85%] bg-white/95 dark:bg-[#1b1e2a]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-white/10 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="truncate">
              <p className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                {activePlace?.name || data.title}
              </p>
            </div>
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 ml-1 transition-colors"
              title="Open full map view"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Place Cards Section */}
      {viewMode !== 'map' && places.length > 0 && (
        <div className="p-4 bg-gray-50/70 dark:bg-[#13141c]/60 border-t border-gray-150 dark:border-white/5">
          <div className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
            <span>Locations & Contact Details ({places.length})</span>
            <span className="text-[11px] font-normal normal-case text-gray-400">Click a card to focus map</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {places.map((place, idx) => {
              const isSelected = idx === activeIndex;
              const placeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.query || `${place.name} ${place.address || ''}`)}`;

              return (
                <div
                  key={idx}
                  onClick={() => handlePlaceSelect(idx)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#1f2333] border-emerald-500 dark:border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-white/80 dark:bg-[#181a24] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/15 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top row: Type badge + Selection radio */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' 
                          : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300'
                      }`}>
                        <Building2 className="w-3 h-3" />
                        {place.type || 'Government Office'}
                      </span>

                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Focused
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Place Name */}
                    <h5 className="font-semibold text-[14px] text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {place.name}
                    </h5>

                    {/* Address */}
                    {place.address && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-gray-600 dark:text-gray-300 leading-snug">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="flex-1">{place.address}</span>
                      </div>
                    )}

                    {/* Timings & Phone */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-gray-500 dark:text-gray-400">
                      {place.timings && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {place.timings}
                        </span>
                      )}
                      {place.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${place.phone}`} onClick={(e) => e.stopPropagation()} className="hover:underline hover:text-emerald-500">
                            {place.phone}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                    {place.address ? (
                      <button
                        type="button"
                        onClick={(e) => handleCopyAddress(e, place.address, idx)}
                        className="flex items-center gap-1 text-[11.5px] text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Copy Address"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <a
                        href={placeDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11.5px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline"
                      >
                        <Navigation className="w-3 h-3" />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
