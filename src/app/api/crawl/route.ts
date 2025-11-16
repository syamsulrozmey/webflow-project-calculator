import { NextResponse } from "next/server";
import { z } from "zod";

import { crawlWebsite } from "@/lib/firecrawl";
import { cacheGet, cacheSet } from "@/lib/cache";
import { ApiError, handleApiError } from "@/lib/http";
import { rateLimitByKey } from "@/lib/rate-limit";
import {
  hashUrl,
  normalizeUrl,
  summarizeCrawl,
  type CrawlSummary,
} from "@/lib/crawler/summary";

const CrawlRequestSchema = z.object({
  url: z.string().min(4, "URL is required"),
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const rate = await rateLimitByKey(`crawl:${ip}`, 5, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429 },
      );
    }

    if (!process.env.FIRECRAWL_API_KEY) {
      throw new ApiError("Crawler is not configured.", 503);
    }

    const payload = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const { url } = CrawlRequestSchema.parse(payload);

    const normalizedUrl = normalizeUrl(url);
    const cacheKey = `crawl:${hashUrl(normalizedUrl)}`;

    const cached = await cacheGet<CrawlSummary>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const documents = await crawlWebsite(normalizedUrl);
    const summary = summarizeCrawl(normalizedUrl, documents);
    cacheSet(cacheKey, summary).catch(() => {});

    return NextResponse.json({ ...summary, cached: false });
  } catch (error) {
    return handleApiError(error);
  }
}


