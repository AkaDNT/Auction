import { teamMembers } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function TeamSection() {
  return (
    <SectionShell
      id="team"
      eyebrow="Team"
      title="The team behind marketplace operations and product rigor"
      description="A senior operating model is reflected visually through high-confidence people cards and crisp hierarchy."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <article
            key={member.name}
            className="theme-card rounded-[1.75rem] p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] text-lg font-semibold theme-primary">
                {member.initials}
              </div>
              <div>
                <h3 className="text-xl font-semibold theme-heading">
                  {member.name}
                </h3>
                <p className="text-sm uppercase tracking-[0.3em] theme-primary">
                  {member.role}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 theme-muted">{member.bio}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
