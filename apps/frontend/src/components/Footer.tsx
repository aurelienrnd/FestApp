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
import LegalMention from "./LegalMention";
import ContactUs from "./ContactUs";

// Liens boutons
const legalLinks = [
  { id: "mentions", label: "Mentions legales" },
  { id: "contact", label: "Nous contacter" },
] as const;
type LegalLinkId = (typeof legalLinks)[number]["id"];

// Liens reseaux sociaux
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

/** Affiche le footer avec les liens legaux et les reseaux sociaux.
 * Ouvre une modale unique au clic sur "Mentions legales" ou "Nous contacter".
 */
export default function Footer() {
  // Stocke si la modale est ouverte et initialise react-modal sur body.
  const [activeModal, setActiveModal] = useState<LegalLinkId | null>(null);
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  return (
    <>
      <footer className="w-full bg-(--collor-bg) flex flex-col gap-6 px-6 py-8 min-md:flex-row min-md:items-center min-md:justify-between">
        <nav>
          <ul className="nav-list justify-center ">
            {legalLinks.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveModal(item.id)}
                  className="btn-type-2"
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
                className="inline-flex h-9 w-9 items-center justify-center rounded bg-(--collor-1) text-xs text-white transition-(--anim-btn-transition) duration-(--anim-btn-duration) hover:scale-(--anim-btn-scale)"
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
        contentLabel={
          activeModal === "mentions" ? "Mentions legales" : "Nous contacter"
        }
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setActiveModal(null)} />

        <h2 className="title-modal">
          {activeModal === "mentions" ? "Mentions legales" : "Nous contacter"}
        </h2>

        {activeModal === "mentions" ? <LegalMention /> : null}
        {activeModal === "contact" ? <ContactUs /> : null}
      </Modal>
    </>
  );
}
