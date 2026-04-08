export function safeNextPath(value: string | null): string {
  if (!value) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost") {
      return "/dashboard";
    }

    if (!url.pathname.startsWith("/")) {
      return "/dashboard";
    }

    if (url.pathname.startsWith("//")) {
      return "/dashboard";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
