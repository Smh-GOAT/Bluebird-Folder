"use client";

import type { SummaryStructured, SummaryTemplate } from "@/types/summary";
import { GenericSummaryTemplate } from "./templates/generic-summary-template";
import { TravelSummaryTemplate } from "./templates/travel-summary-template";
import { AcademicSummaryTemplate } from "./templates/academic-summary-template";

interface SummaryTemplateRouterProps {
  template?: SummaryTemplate | string | null;
  summaryJson?: SummaryStructured | null;
  summaryMarkdown?: string | null;
}

export function SummaryTemplateRouter({
  template,
  summaryJson,
  summaryMarkdown
}: SummaryTemplateRouterProps) {
  const normalizedTemplate = (template ?? "general") as SummaryTemplate;

  switch (normalizedTemplate) {
    case "travel":
      return (
        <TravelSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "academic":
      return (
        <AcademicSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "general":
    default:
      return (
        <GenericSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
  }
}
