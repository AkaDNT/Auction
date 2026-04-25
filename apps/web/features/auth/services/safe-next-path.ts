export function safeNextPath(value: string | null): string {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost") {
      return "";
    }

    if (!url.pathname.startsWith("/")) {
      return "";
    }

    if (url.pathname.startsWith("//")) {
      return "";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}
