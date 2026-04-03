const users = [
  { name: "Ava Nguyen", role: "Marketplace Director", status: "Active" },
  { name: "Daniel Park", role: "Product Strategy", status: "Active" },
  { name: "Sophia Reed", role: "Operations Lead", status: "Pending" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Users
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Access and identity management
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Keep internal operators, sellers, and buyers organized with clean role
          visibility.
        </p>
      </section>

      <section className="theme-card rounded-[1.75rem] p-6">
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.name}
              className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold theme-heading">{user.name}</p>
                <p className="mt-1 text-sm theme-muted">{user.role}</p>
              </div>
              <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                {user.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
