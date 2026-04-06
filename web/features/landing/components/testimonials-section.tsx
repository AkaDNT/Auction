import { testimonialItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function TestimonialsSection() {
  return (
    <SectionShell
      id="testimonials"
      eyebrow="Nhận xét"
      title="Bằng chứng cho trải nghiệm cao cấp của cả người mua lẫn người bán"
      description="Các thẻ này cung cấp bằng chứng xã hội nhưng vẫn giữ ngôn ngữ thị giác trang trọng và phù hợp doanh nghiệp."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {testimonialItems.map((testimonial) => (
          <article
            key={testimonial.name}
            className="theme-card rounded-[1.75rem] p-6"
          >
            <p className="theme-primary">“</p>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {testimonial.quote}
            </p>
            <div className="mt-6 border-t border-[color:var(--border)] pt-4">
              <p className="text-base font-semibold theme-heading">
                {testimonial.name}
              </p>
              <p className="text-sm theme-muted">{testimonial.role}</p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
