const imageCache = new Map();

/**
 * Search DuckDuckGo / Bing CDN for scheme images
 */
async function searchDdgImages(query) {
  try {
    const searchQuery = `${query} scheme india`;
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await tokenRes.text();
    const vqd = html.match(/vqd=([0-9-]+)/)?.[1];
    if (!vqd) return null;

    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(searchQuery)}&vqd=${vqd}&f=,,,`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://duckduckgo.com/'
        }
      }
    );
    const data = await imgRes.json();
    if (!data.results || data.results.length === 0) return null;

    const top = data.results[0];
    let sourceHost = 'Government Portal';
    try {
      sourceHost = new URL(top.url).hostname.replace(/^www\./, '');
    } catch {}

    return {
      imageUrl: top.thumbnail || top.image,
      sourceUrl: top.url,
      sourceTitle: top.title,
      sourceDomain: sourceHost
    };
  } catch (err) {
    console.warn(`[ImageSearch] DDG search failed for "${query}":`, err.message);
    return null;
  }
}

/**
 * Fallback to Wikimedia Commons
 */
async function searchWikimedia(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'GovSchemeBot/1.0 (Mozilla/5.0)' } });
    const data = await res.json();
    if (!data.query || !data.query.pages) return null;
    const pages = Object.values(data.query.pages);
    for (const p of pages) {
      const u = p.imageinfo?.[0]?.url;
      if (u && (u.includes('.jpg') || u.includes('.png') || u.includes('.jpeg'))) {
        return {
          imageUrl: u,
          sourceUrl: p.imageinfo[0].descriptionurl,
          sourceTitle: p.title.replace(/^File:/, ''),
          sourceDomain: 'wikimedia.org'
        };
      }
    }
  } catch (err) {
    console.warn(`[ImageSearch] Wikimedia fallback failed for "${query}":`, err.message);
  }
  return null;
}

/**
 * Find image with fallback cascade and caching
 */
export async function getSchemeImage(query) {
  if (!query || typeof query !== 'string') return null;

  const normalizedKey = query.trim().toLowerCase();
  if (imageCache.has(normalizedKey)) {
    return imageCache.get(normalizedKey);
  }

  // 1. Web Image Search
  let result = await searchDdgImages(query);

  // 2. Wikimedia fallback
  if (!result) {
    result = await searchWikimedia(query);
  }

  // 3. Pollinations AI fallback
  if (!result) {
    const cleanWords = query.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join(' ');
    const aiPrompt = `${cleanWords} beautiful realistic photography, indian agriculture, natural, highly detailed, no text, no watermark, no logo`;
    result = {
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=400&height=300&nologo=true`,
      sourceUrl: '',
      sourceTitle: query,
      sourceDomain: 'AI Illustrative'
    };
  }

  if (result) {
    imageCache.set(normalizedKey, result);
  }

  return result;
}
