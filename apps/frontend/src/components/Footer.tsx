"use client";
// Import
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faInstagram,
  faFacebookF,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import ModalCloseButton from "./ModalCloseButton";

// Lien btn
const legalLinks = [
  { id: "mentions", label: "Mentions legales" },
  { id: "contact", label: "Nous contacter" },
] as const;
type LegalLinkId = (typeof legalLinks)[number]["id"];

// Lien reseaux sociaux
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


/** Affiche le footer avec les liens légaux et les réseaux sociaux.
 * Ouvre une modal unique au clic sur "Mentions legales" ou "Nous contacter"
 * @children Modal Fenêtre modale partagée dont le titre dépend de `activeModal`.
 */
export default function Footer() {
  const [activeModal, setActiveModal] = useState<LegalLinkId | null>(null);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <>
      <footer className="w-full bg-(--collor-bg) text-(--collor-text) flex flex-col gap-6 px-6 py-8 min-md:flex-row min-md:items-center min-md:justify-between">
        <nav>
          <ul className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wide md:text-sm justify-center ">
            {legalLinks.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveModal(item.id)}
                  className="transition-opacity hover:opacity-70"
                >
                  {item.label}
                </button>
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

      <Modal
        isOpen={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
        contentLabel={activeModal === "mentions" ? "Mentions legales" : "Nous contacter"}
        className="mobile-nav-modal"
        overlayClassName="mobile-nav-modal-overlay"
      >
        <ModalCloseButton onClose={() => setActiveModal(null)} />

        <h2 className="text-4xl font-black uppercase">
          {activeModal === "mentions" ? "Mentions legales" : "Nous contacter"}
        </h2>
      </Modal>
    </>
  );
}
