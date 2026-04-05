import { HomeShell } from "@/components/home/home-shell";

interface HomePageProps {
  searchParams: Promise<{ selected?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  return <HomeShell initialSelectedId={params.selected ?? null} />;
}
