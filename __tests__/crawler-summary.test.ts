import type { CrawlDocument } from "@/lib/firecrawl";
import {
  hashUrl,
  normalizeUrl,
  summarizeCrawl,
} from "@/lib/crawler/summary";

describe("crawler summary helpers", () => {
  it("normalizes URLs", () => {
    expect(normalizeUrl("example.com/")).toBe("https://example.com");
    expect(normalizeUrl("https://example.com/path")).toBe(
      "https://example.com/path",
    );
  });

  it("hashes URLs deterministically", () => {
    const value = hashUrl("https://example.com");
    expect(value).toHaveLength(64);
    expect(value).toBe(hashUrl("https://example.com"));
  });

  it("builds crawl summary from documents", () => {
    const docs: CrawlDocument[] = [
      {
        url: "https://example.com/",
        markdown: "Welcome to our services page",
        html: "<html><body><img src='hero.png'><form></form></body></html>",
      },
      {
        url: "https://example.com/blog/post",
        markdown: "Blog article about Webflow",
        html: "<html><body><img src='img.png'></body></html>",
      },
    ];

    const summary = summarizeCrawl("https://example.com", docs);

    expect(summary.metrics.pages).toBe(2);
    expect(summary.metrics.images).toBeGreaterThan(0);
    expect(summary.metrics.forms).toBe(1);
    expect(summary.pageTypes.length).toBeGreaterThan(0);
    expect(summary.stack.platform).toBeTruthy();
    expect(summary.source).toBe("api");
  });
});


