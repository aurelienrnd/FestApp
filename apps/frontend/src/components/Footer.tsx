import Link from "next/link";

const legalLinks = [
  { label: "Mentions legales", href: "/mentions-legales" },
  { label: "Nous contacter", href: "/contact" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    shortLabel: "IG",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    shortLabel: "FB",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    shortLabel: "YT",
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-(--collor-2) bg-(--collor-bg) text-(--collor-text)">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <nav>
          <ul className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wide md:text-sm">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="h-0.5 w-40 bg-(--collor-3) md:w-80" aria-hidden="true" />

        <ul className="flex items-center gap-4">
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded bg-(--collor-1) text-xs text-white transition-transform duration-200 hover:scale-110"
              >
                {item.shortLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
