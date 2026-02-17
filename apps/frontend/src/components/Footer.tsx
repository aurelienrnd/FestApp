import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faInstagram,
  faFacebookF,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const legalLinks = [
  { label: "Mentions legales", href: "/mentions-legales" },
  { label: "Nous contacter", href: "/contact" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: faInstagram as unknown as IconProp,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: faFacebookF as unknown as IconProp,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: faYoutube as unknown as IconProp,
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
              className="inline-flex h-9 w-9 items-center justify-center rounded bg-(--collor-1) text-xs text-white transition-(--btn-anim-transition) duration-(--btn-anim-duration) hover:scale-(--btn-anim-scale)"
            >
              <FontAwesomeIcon icon={item.icon} />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
