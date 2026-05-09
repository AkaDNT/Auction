import type { ReactNode } from "react";

type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
};

export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label
      className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
