import type { Metadata } from "next";

import { ProjectsDashboard } from "@/components/projects/projects-dashboard";

export const metadata: Metadata = {
  title: "Projects · Webflow Project Calculator",
  description:
    "Manage saved Webflow project scopes, duplicate estimates, and reopen questionnaires.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] via-[#060714] to-[#090d1b] pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <ProjectsDashboard />
      </div>
    </main>
  );
}

