"use client";

import type { SummaryStructured, SummaryTemplate } from "@/types/summary";
import { GenericSummaryTemplate } from "./templates/generic-summary-template";
import { TravelSummaryTemplate } from "./templates/travel-summary-template";
import { AcademicSummaryTemplate } from "./templates/academic-summary-template";
import { InterviewSummaryTemplate } from "./templates/interview-summary-template";
import { TutorialSummaryTemplate } from "./templates/tutorial-summary-template";
import { NewsSummaryTemplate } from "./templates/news-summary-template";
import { MeetingSummaryTemplate } from "./templates/meeting-summary-template";
import { PodcastSummaryTemplate } from "./templates/podcast-summary-template";
import { ReviewSummaryTemplate } from "./templates/review-summary-template";
import { VlogSummaryTemplate } from "./templates/vlog-summary-template";

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
    case "interview":
      return (
        <InterviewSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "tutorial":
      return (
        <TutorialSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "news":
      return (
        <NewsSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "meeting":
      return (
        <MeetingSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "podcast":
      return (
        <PodcastSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "review":
      return (
        <ReviewSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
    case "vlog":
      return (
        <VlogSummaryTemplate
          summaryJson={summaryJson}
          summaryMarkdown={summaryMarkdown}
        />
      );
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
