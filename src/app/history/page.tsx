import { mockHistory } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">历史记录（占位）</h1>
      <ul className="mt-4 space-y-2">
        {mockHistory.map((item) => (
          <li key={item.id} className="rounded-lg border bg-white p-3 text-sm">
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {item.platform.toUpperCase()} · {item.createdAt}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
