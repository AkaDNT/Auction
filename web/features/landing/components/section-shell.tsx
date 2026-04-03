import type { ReactNode } from "react";

type SectionShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  align = "left",
  className = "",
}: SectionShellProps) {
  const headingAlignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-14 sm:py-16 lg:py-20 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mb-10 flex flex-col gap-4 ${headingAlignment}`}>
          <span className="theme-eyebrow">{eyebrow}</span>
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight theme-heading sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="text-base leading-7 theme-muted sm:text-lg">
              {description}
            </p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
