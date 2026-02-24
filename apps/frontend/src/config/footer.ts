import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faInstagram,
  faFacebookF,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// Type
export type LegalLinkId = (typeof legalLinks)[number]["id"];

// Liens du footer qui ouvrent les modales legales.
export const legalLinks = [
  { id: "mentions", label: "Mentions legales" },
  { id: "contact", label: "Nous contacter" },
] as const;

// Liens externes des reseaux sociaux affiches dans le footer.
export const socialLinks = [
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
