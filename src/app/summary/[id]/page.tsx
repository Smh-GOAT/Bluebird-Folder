import { SummaryShell } from "@/components/summary/summary-shell";

interface SummaryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { id } = await params;
  return <SummaryShell summaryId={id} />;
}
