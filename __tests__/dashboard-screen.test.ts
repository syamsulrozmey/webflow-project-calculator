import { coerceProject, computeMetrics } from "@/components/dashboard/dashboard-screen"
import type { ProjectSummary } from "@/lib/projects/types"

const demoSummary: ProjectSummary = {
  id: "demo",
  title: "Demo Project",
  status: "draft",
  flow: "fresh",
  persona: "agency",
  hourlyRate: 120,
  currency: "usd",
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe("dashboard helpers", () => {
  it("coerces a ProjectSummary into dashboard shape with fallback cost/hours", () => {
    const coerced = coerceProject(demoSummary)
    expect(coerced.estimatedCost).toBeGreaterThan(0)
    expect(coerced.hours).toBeGreaterThan(0)
    expect(coerced.currency).toBe("usd")
  })

  it("computes metrics with fallback when projects are empty", () => {
    const fallback = {
      totalProjects: 0,
      totalPipelineValue: 0,
      avgProjectSize: { hours: 0, cost: 0 },
      crawlsThisMonth: 0,
      projectsThisMonth: 0,
      projectsTrend: 0,
      pipelineTrend: 0,
    }
    const metrics = computeMetrics([], fallback)
    expect(metrics.summary.totalProjects).toBe(0)
    expect(metrics.pipelineByType.landingPage.count).toBe(0)
  })
})

