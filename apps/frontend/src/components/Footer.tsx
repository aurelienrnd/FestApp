import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const byPrefixAndName = {
  fab: {
    instagram: faInstagram,
    facebook: faFacebookF,
    youtube: faYoutube,
  },
};

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
    <footer className="w-full bg-(--collor-bg) text-(--collor-text) flex flex-col gap-6 px-6 py-8 min-md:flex-row min-md:items-center min-md:justify-between">
      <nav>
        <ul className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wide md:text-sm justify-center ">
          {legalLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition-opacity hover:opacity-70">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="h-0.5 w-40 bg-(--collor-3) mx-auto md:mx-0 md:w-80"
        aria-hidden="true"
      />

      <ul className="flex items-center justify-center gap-4">
        {socialLinks.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="inline-flex h-9 w-9 items-center justify-center rounded bg-(--collor-1) text-xs text-white transition-transform duration-200 hover:scale-110"
            >
              {item.label === "Instagram" ? (
                <FontAwesomeIcon icon={byPrefixAndName.fab["instagram"]} />
              ) : item.label === "Facebook" ? (
                <FontAwesomeIcon icon={byPrefixAndName.fab["facebook"]} />
              ) : item.label === "YouTube" ? (
                <FontAwesomeIcon icon={byPrefixAndName.fab["youtube"]} />
              ) : (
                item.shortLabel
              )}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
