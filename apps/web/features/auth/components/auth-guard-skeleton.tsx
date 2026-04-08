export function AuthGuardSkeleton() {
  return (
    <div className="theme-page min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="theme-surface w-full max-w-md rounded-3xl border border-(--border) p-6 sm:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 rounded-full bg-[color:var(--primary-soft)]" />
            <div className="h-8 w-3/4 rounded-full bg-[color:var(--primary-soft)]" />
            <div className="h-4 w-full rounded-full bg-[color:var(--primary-soft)]" />
            <div className="h-4 w-5/6 rounded-full bg-[color:var(--primary-soft)]" />
            <div className="mt-6 space-y-3">
              <div className="h-12 rounded-2xl bg-[color:var(--primary-soft)]" />
              <div className="h-12 rounded-2xl bg-[color:var(--primary-soft)]" />
              <div className="h-12 rounded-full bg-[color:var(--primary-soft)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
