import z from 'zod';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  score?: number;
}

interface SearXNGResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

interface SearXNGResponse {
  results: SearXNGResult[];
}

const SEARXNG_URL = process.env.SEARXNG_URL || 'http://searxng:8080';

async function searchSearXNG(
  query: string,
  categories: string[] = ['general'],
  language: string = 'en-US',
  maxResults: number = 10
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    categories: categories.join(','),
    language: language,
    pageno: '1',
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${SEARXNG_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`SearXNG responded with status: ${response.status}`);
    }

    const data = (await response.json()) as SearXNGResponse;

    return data.results.slice(0, maxResults).map((result: SearXNGResult): SearchResult => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
      source: 'searxng',
      score: result.score,
    }));
  } finally {
    clearTimeout(timeoutId);
  }
}

async function searchDuckDuckGo(
  query: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query });

  const response = await fetch(`https://html.duckduckgo.com/html/?${params.toString()}`, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo responded with status: ${response.status}`);
  }

  const html = await response.text();

  const results: SearchResult[] = [];

  const linkRegex = /class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
  const snippetRegex = /class="result__snippet"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/a>/g;

  const links: Array<{ url: string; title: string }> = [];
  let linkMatch: RegExpExecArray | null;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const rawUrl = linkMatch[1];
    const title = linkMatch[2].trim();

    let url = rawUrl;
    try {
      const uddgParam = new URL(rawUrl).searchParams.get('uddg');
      if (uddgParam) {
        url = decodeURIComponent(uddgParam);
      }
    } catch {
      // keep original url
    }

    if (url && title) {
      links.push({ url, title });
    }
  }

  const snippetMatches: string[] = [];
  const snippetSimpleRegex = /class="result__snippet"[^>]*>(.*?)<\/a>/gs;
  let snippetMatch: RegExpExecArray | null;

  while ((snippetMatch = snippetSimpleRegex.exec(html)) !== null) {
    const snippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
    snippetMatches.push(snippet);
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    const link = links[i];
    const snippet = snippetMatches[i] || '';

    results.push({
      title: link.title,
      url: link.url,
      snippet,
      source: 'duckduckgo',
    });
  }

  return results;
}

const inputSchema = z.object({
  query: z.string().describe('Search query'),
  categories: z
    .array(z.string())
    .optional()
    .default(['general'])
    .describe('Search categories (e.g. general, news, images, videos, science, it)'),
  language: z.string().optional().default('en-US').describe('Search language'),
  max_results: z
    .number()
    .optional()
    .default(10)
    .transform((val) => Math.min(val, 20))
    .describe('Maximum number of results to return (capped at 20)'),
});

export const searxngTool = {
  name: 'searxng_search',
  description:
    'Search the web using a self-hosted SearXNG instance with automatic fallback to DuckDuckGo. Returns relevant search results including titles, URLs, and snippets.',
  inputSchema,
  execute: async (input: z.infer<typeof inputSchema>): Promise<{
    results: SearchResult[];
    count: number;
    query: string;
    source: string;
  }> => {
    const { query, categories, language, max_results } = input;

    let results: SearchResult[] = [];
    let source = 'searxng';

    try {
      results = await searchSearXNG(query, categories, language, max_results);

      if (results.length === 0) {
        throw new Error('No results from SearXNG');
      }
    } catch (error) {
      source = 'duckduckgo';
      try {
        results = await searchDuckDuckGo(query, max_results);
      } catch (fallbackError) {
        const searxngError = error instanceof Error ? error.message : String(error);
        const ddgError = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        throw new Error(
          `Both SearXNG and DuckDuckGo searches failed. SearXNG: ${searxngError}. DuckDuckGo: ${ddgError}`
        );
      }
    }

    return {
      results,
      count: results.length,
      query,
      source,
    };
  },
};

