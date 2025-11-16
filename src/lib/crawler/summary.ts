import { createHash } from "crypto";

import type { CrawlDocument } from "@/lib/firecrawl";

export interface CrawlSummary {
  id: string;
  url: string;
  normalizedUrl: string;
  timestamp: string;
  metrics: {
    pages: number;
    avgWordsPerPage: number;
    images: number;
    videos: number;
    forms: number;
  };
  stack: {
    platform: string;
    hosting: string;
    technologies: string[];
  };
  pageTypes: Array<{ label: string; count: number }>;
  recommendations: string[];
  warnings: string[];
  complexityScore: number;
  estimatedHours: number;
  source: "api";
}

const DEFAULT_PAGE_TYPES = [
  "Marketing & Overview",
  "Blog & Resources",
  "Landing / Campaigns",
  "Contact & Forms",
] as const;

export function normalizeUrl(raw: string): string {
  const trimmed = raw?.trim();
  if (!trimmed) {
    throw new Error("URL is required.");
  }
  const prefixed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(prefixed);
  parsed.hash = "";
  const normalized = parsed.toString().replace(/\/$/, "");
  return normalized;
}

export function hashUrl(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function summarizeCrawl(
  normalizedUrl: string,
  documents: CrawlDocument[],
): CrawlSummary {
  const timestamp = new Date().toISOString();
  const stats = aggregateMetrics(documents);
  const stack = detectStack(documents);
  const pageTypes = buildPageTypes(documents);
  const complexityScore = computeComplexityScore(stats, stack);
  const estimatedHours = estimateHours(stats, complexityScore);

  return {
    id: hashUrl(`${normalizedUrl}:${timestamp}`),
    url: normalizedUrl,
    normalizedUrl,
    timestamp,
    metrics: stats,
    stack,
    pageTypes,
    recommendations: buildRecommendations(stats, stack, complexityScore),
    warnings: buildWarnings(stats, stack),
    complexityScore,
    estimatedHours,
    source: "api",
  };
}

function aggregateMetrics(documents: CrawlDocument[]) {
  const pages = documents.length || 1;
  let totalWords = 0;
  let images = 0;
  let videos = 0;
  let forms = 0;

  documents.forEach((doc) => {
    const markdown = doc.markdown ?? "";
    const html = doc.html ?? doc.rawHtml ?? "";
    const textSource = markdown || stripHtml(html);
    totalWords += countWords(textSource);
    images +=
      countMatches(markdown, /!\[[^\]]*\]\([^)]+\)/g) + countMatches(html, /<img\b/gi);
    videos += countMatches(html, /<video\b/gi) + countMatches(html, /(youtube|vimeo|wistia|loom)\.com/gi);
    forms += countMatches(html, /<form\b/gi);
  });

  return {
    pages,
    avgWordsPerPage: pages > 0 ? Math.round(totalWords / pages) : 0,
    images,
    videos,
    forms,
  };
}

function detectStack(documents: CrawlDocument[]) {
  const markdownBlob = documents.map((doc) => doc.markdown ?? "").join("\n");
  const htmlBlob = documents.map((doc) => doc.html ?? doc.rawHtml ?? "").join("\n");
  const blob = `${markdownBlob}\n${htmlBlob}`.toLowerCase();

  const platform = detectPlatform(blob);
  const hosting = detectHosting(blob);
  const technologies = Array.from(detectTechnologies(blob));

  return {
    platform,
    hosting,
    technologies,
  };
}

function detectPlatform(blob: string): string {
  if (/wp-content|wordpress|woocommerce/.test(blob)) return "WordPress";
  if (/cdn\.shopify|shopify\.com|shop-pay/.test(blob)) return "Shopify";
  if (/squarespace\.com/.test(blob)) return "Squarespace";
  if (/data-wf-site|webflow/.test(blob)) return "Webflow";
  if (/wixstatic|wixsite/.test(blob)) return "Wix";
  return "Custom / Unknown";
}

function detectHosting(blob: string): string {
  if (/cloudflare/.test(blob)) return "Cloudflare";
  if (/vercel|next\.js/i.test(blob)) return "Vercel";
  if (/netlify/.test(blob)) return "Netlify";
  if (/akamai|fastly/.test(blob)) return "Enterprise CDN";
  return "Unknown";
}

function detectTechnologies(blob: string) {
  const techs = new Set<string>();
  if (/hubspot/i.test(blob)) techs.add("HubSpot");
  if (/marketo/i.test(blob)) techs.add("Marketo");
  if (/segment/i.test(blob)) techs.add("Segment");
  if (/ga4|gtag|google-analytics/i.test(blob)) techs.add("Google Analytics");
  if (/intercom/i.test(blob)) techs.add("Intercom");
  if (/drift/i.test(blob)) techs.add("Drift");
  if (/zapier/i.test(blob)) techs.add("Zapier");
  if (/algolia/i.test(blob)) techs.add("Algolia Search");
  return techs;
}

function buildPageTypes(documents: CrawlDocument[]) {
  const counts: Record<string, number> = {};
  for (const label of DEFAULT_PAGE_TYPES) {
    counts[label] = 0;
  }

  documents.forEach((doc) => {
    if (!doc.url) return;
    const label = categorizePath(doc.url);
    counts[label] = (counts[label] ?? 0) + 1;
  });

  return Object.entries(counts).map(([label, count]) => ({ label, count }));
}

function categorizePath(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path === "/" || /(about|services|work|pricing|solutions)/.test(path)) {
      return "Marketing & Overview";
    }
    if (/(blog|article|news|insights|resources)/.test(path)) {
      return "Blog & Resources";
    }
    if (/(campaign|landing|signup|demo|cta)/.test(path)) {
      return "Landing / Campaigns";
    }
    if (/(contact|support|quote|request)/.test(path)) {
      return "Contact & Forms";
    }
  } catch {
    // ignore parse errors
  }
  return "Marketing & Overview";
}

function buildRecommendations(
  metrics: ReturnType<typeof aggregateMetrics>,
  stack: ReturnType<typeof detectStack>,
  complexityScore: number,
) {
  const recs = new Set<string>();
  if (metrics.pages > 20) {
    recs.add("Plan CMS mappings before migration to handle high page count.");
  }
  if (metrics.forms > 3) {
    recs.add("Budget extra time for advanced forms and integrations.");
  }
  if (stack.platform === "WordPress") {
    recs.add("Include content model mapping for WordPress → Webflow CMS.");
  }
  if (complexityScore > 70) {
    recs.add("Allocate QA / performance tuning time due to high complexity.");
  }
  if (stack.technologies.includes("Google Analytics") === false) {
    recs.add("Confirm analytics & marketing pixels during rebuild.");
  }
  if (recs.size === 0) {
    recs.add("Standard migration effort — validate content inventory before kickoff.");
  }
  return Array.from(recs);
}

function buildWarnings(
  metrics: ReturnType<typeof aggregateMetrics>,
  stack: ReturnType<typeof detectStack>,
) {
  const warnings = new Set<string>();
  if (metrics.images / Math.max(metrics.pages, 1) > 8) {
    warnings.add("Heavy imagery detected — watch total asset weight.");
  }
  if (metrics.videos > 4) {
    warnings.add("Multiple video embeds — ensure CDN + lazy loading.");
  }
  if (stack.platform === "Custom / Unknown") {
    warnings.add("Platform unknown — scope discovery to avoid surprises.");
  }
  return Array.from(warnings);
}

function computeComplexityScore(
  metrics: ReturnType<typeof aggregateMetrics>,
  stack: ReturnType<typeof detectStack>,
) {
  const score =
    metrics.pages * 1.5 +
    metrics.forms * 4 +
    metrics.videos * 3 +
    stack.technologies.length * 2 +
    metrics.avgWordsPerPage / 40;
  return Math.min(100, Math.round(Math.max(score, 10)));
}

function estimateHours(
  metrics: ReturnType<typeof aggregateMetrics>,
  complexityScore: number,
) {
  const hours =
    metrics.pages * 3 +
    metrics.forms * 5 +
    metrics.videos * 4 +
    complexityScore;
  return Math.max(40, Math.round(hours));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function countWords(value: string) {
  if (!value) return 0;
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function countMatches(source: string, regex: RegExp) {
  if (!source) return 0;
  const matches = source.match(regex);
  return matches ? matches.length : 0;
}


