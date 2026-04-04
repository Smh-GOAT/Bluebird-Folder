interface VideoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;
  return (
    <main
      className="mx-auto max-w-4xl p-6"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>视频详情（占位）</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>当前视频 ID: {id}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Milestone 1 开始接入真实解析、字幕与播放器。
      </p>
    </main>
  );
}
