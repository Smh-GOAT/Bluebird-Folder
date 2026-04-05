export async function register() {
  // Server-side only: start periodic cleanup of stale temp directories
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPeriodicCleanup } = await import("@/lib/services/cleanup/temp-cleaner");
    startPeriodicCleanup();
  }
}
