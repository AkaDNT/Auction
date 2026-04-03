const settingsSections = [
  { title: "Branding", description: "Logo, colors, and marketplace identity" },
  { title: "Security", description: "Roles, sessions, and MFA policies" },
  {
    title: "Notifications",
    description: "Email and platform event preferences",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Settings
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Platform configuration
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          These controls are presented as a simple operations console for future
          configuration work.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <article
            key={section.title}
            className="theme-card rounded-[1.5rem] p-6"
          >
            <p className="text-xl font-semibold theme-heading">
              {section.title}
            </p>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {section.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
