import FirecrawlApp, {
  type CrawlStatusResponse,
  type ErrorResponse,
  type FirecrawlDocument,
} from "@mendable/firecrawl-js";

const globalForFirecrawl = globalThis as unknown as {
  firecrawlClient?: FirecrawlApp;
};

function getFirecrawlClient(): FirecrawlApp | null {
  if (!process.env.FIRECRAWL_API_KEY) {
    return null;
  }

  if (!globalForFirecrawl.firecrawlClient) {
    globalForFirecrawl.firecrawlClient = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY,
    });
  }

  return globalForFirecrawl.firecrawlClient;
}

function isErrorResponse(
  response: CrawlStatusResponse | ErrorResponse,
): response is ErrorResponse {
  return response && response.success === false;
}

export async function crawlWebsite(
  url: string,
): Promise<FirecrawlDocument<undefined>[]> {
  const client = getFirecrawlClient();
  if (!client) {
    throw new Error("Firecrawl API key is not configured.");
  }

  const response = await client.crawlUrl(
    url,
    {
      limit: 35,
      maxDepth: 3,
      ignoreQueryParameters: true,
      deduplicateSimilarURLs: true,
      scrapeOptions: {
        formats: ["markdown", "html"],
        removeBase64Images: true,
        onlyMainContent: true,
      },
    },
    4,
  );

  if (isErrorResponse(response)) {
    throw new Error(response.error ?? "Firecrawl crawl failed.");
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("Firecrawl returned no crawl data for this URL.");
  }

  return response.data;
}

export type CrawlDocument = FirecrawlDocument<undefined>;


