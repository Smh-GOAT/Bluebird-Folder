import { redirect } from "next/navigation";

interface SummaryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { id } = await params;
  redirect(`/?selected=${encodeURIComponent(id)}`);
}
