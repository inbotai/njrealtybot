export const INDEXNOW_KEY = "6f8a9d2e4b1c7f305a8e9c4d2b7f1a6e";
export const INDEXNOW_HOST = "gardenstate.ai";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}${INDEXNOW_KEY_PATH}`;
export const INDEXNOW_BATCH_SIZE = 10000;

export const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
] as const;

export interface IndexNowBody {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowBatchResult {
  endpoint: string;
  status: number;
  ok: boolean;
}

export interface IndexNowSubmitResult {
  submitted: number;
  batches: number;
  results: IndexNowBatchResult[];
}

/** Keep only absolute gardenstate.ai URLs. IndexNow rejects other hosts. */
export function indexNowUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const raw of urls) {
    const url = raw.trim();
    if (!url.startsWith(`https://${INDEXNOW_HOST}/`) && url !== `https://${INDEXNOW_HOST}`) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    clean.push(url);
  }
  return clean;
}

export function chunkUrls(urls: string[], size = INDEXNOW_BATCH_SIZE): string[][] {
  if (size < 1) throw new Error("IndexNow batch size must be positive");
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += size) chunks.push(urls.slice(i, i + size));
  return chunks;
}

export function indexNowBody(urlList: string[]): IndexNowBody {
  return {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  };
}

export async function submitIndexNow(
  urls: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<IndexNowSubmitResult> {
  const clean = indexNowUrls(urls);
  const chunks = chunkUrls(clean);
  const results: IndexNowBatchResult[] = [];
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    for (const urlList of chunks) {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(indexNowBody(urlList)),
      });
      results.push({
        endpoint,
        status: res.status,
        ok: res.status === 200 || res.status === 202,
      });
    }
  }
  return { submitted: clean.length, batches: chunks.length, results };
}
