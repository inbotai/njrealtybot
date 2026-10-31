/**
 * Search and answer crawlers may read public pages.
 * Training and scraper crawlers are named in robots.txt and refused with HTTP 403.
 * Matching is a case-insensitive substring of the User-Agent header.
 */

export const SEARCH_ANSWER_BOTS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "Perplexity-User",
  "DuckDuckBot",
  "Applebot",
] as const;

/** Link-unfurl crawlers. They follow the same public-page rules as search bots. */
export const SOCIAL_PREVIEW_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "WhatsApp",
  "TelegramBot",
  "Discordbot",
  "Pinterestbot",
  "redditbot",
] as const;

export const ALLOWED_BOTS = [...SEARCH_ANSWER_BOTS, ...SOCIAL_PREVIEW_BOTS] as const;

export const TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "claude-web",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "PerplexityBot",
  "meta-externalagent",
  "meta-webindexer",
  "Amazonbot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "AI2Bot",
  "TongyiBot",
  "DeepSeekBot",
  "omgili",
  "Omgilibot",
  "PetalBot",
  "YouBot",
  "img2dataset",
  "FirecrawlAgent",
  "Timpibot",
  "GoogleOther",
  "Google-CloudVertexBot",
  "TikTokSpider",
  "bedrockbot",
  "KimiBot",
  "MistralAI-Index",
  "ICC-Crawler",
] as const;

const TRAINING_TOKENS = TRAINING_CRAWLERS.map((name) => name.toLowerCase());

export function isTrainingCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return TRAINING_TOKENS.some((token) => ua.includes(token));
}
