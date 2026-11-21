import { NavLink } from "react-router-dom";

export type LegalSection = { heading: string; body: string[] };

const tabs = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/rules", label: "Shop Rules" },
];

type Props = { title: string; updated: string; sections: LegalSection[] };

function LegalPage({ title, updated, sections }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm ${
                isActive ? "bg-magenta font-bold text-white" : "bg-white hover:bg-blush"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <article className="rounded-lg bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mb-6 text-sm text-neutral-500">Last updated: {updated}</p>

        {sections.map((s, i) => (
          <section key={s.heading} className="mb-6">
            <h2 className="mb-2 text-lg font-bold">
              {i + 1}. {s.heading}
            </h2>
            {s.body.map((p) => (
              <p key={p} className="mb-2 text-neutral-700">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

export default LegalPage;