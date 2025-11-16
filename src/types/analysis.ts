export type AnalysisSource = "api" | "simulated";

export interface AnalysisResult {
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
  source: AnalysisSource;
}

