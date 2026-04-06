import { stepItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function HowItWorksSection() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrow="Quy trình"
      title="Mô hình vận hành rõ ràng từ onboarding đến tất toán"
      description="Trải nghiệm được chia thành một luồng đơn giản, lặp lại được để mọi người dùng đều biết bước tiếp theo là gì."
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {stepItems.map((step) => (
          <article key={step.step} className="theme-card rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Bước {step.step}
            </p>
            <h3 className="mt-4 text-xl font-semibold theme-heading">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
