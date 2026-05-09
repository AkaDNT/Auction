type StatusMessageProps = {
  kind: "success" | "error";
  message: string | null;
};

export function StatusMessage({ kind, message }: StatusMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={
        kind === "success"
          ? "rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200"
          : "rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200"
      }
    >
      {message}
    </p>
  );
}
