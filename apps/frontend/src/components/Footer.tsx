"use client";
import { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebookF,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import ModalCloseButton from "./ModalCloseButton";
import LegalMention from "./LegalMention";
import ContactUs from "./ContactUs";

type LegalLinkId = "mentions" | "contact";

const legalLinks: { id: LegalLinkId; label: string }[] = [
  { id: "mentions", label: "Mentions legales" },
  { id: "contact", label: "Nous contacter" },
];

const socialLinks: { label: string; href: string; icon: IconDefinition }[] = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: faInstagram },
  { label: "Facebook", href: "https://www.facebook.com/", icon: faFacebookF },
  { label: "YouTube", href: "https://www.youtube.com/", icon: faYoutube },
];

/** Affiche le footer avec les liens legaux et les reseaux sociaux.
 * Ouvre une modale au clic sur "Mentions legales" ou "Nous contacter".
 */
export default function Footer() {
  // Stocke si la modale est ouverte et initialise react-modal sur body.
  const [activeModal, setActiveModal] = useState<LegalLinkId | null>(null);

  return (
    <>
      <footer className="w-full bg-(--color-bg) flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
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
          className="h-0.5 w-40 md:w-80 mx-auto bg-(--color-3)"
          aria-hidden="true"
        />

        <ul className="flex items-center justify-center gap-6">
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded text-xs text-white bg-(--color-1) transition-(--anim-btn-transition) duration-(--anim-btn-duration) hover:scale-(--anim-btn-scale)"
              >
                <FontAwesomeIcon icon={item.icon} aria-hidden={true} />
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
