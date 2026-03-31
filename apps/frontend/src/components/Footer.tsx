"use client";
// Import
import { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModalCloseButton from "./ModalCloseButton";
import LegalMention from "./LegalMention";
import ContactUs from "./ContactUs";
import { legalLinks, socialLinks, type LegalLinkId } from "@/config/footer";

/** Affiche le footer avec les liens legaux et les reseaux sociaux.
 * Ouvre une modale au clic sur "Mentions legales" ou "Nous contacter".
 */
export default function Footer() {
  // Stocke si la modale est ouverte et initialise react-modal sur body.
  const [activeModal, setActiveModal] = useState<LegalLinkId | null>(null);

  return (
    <>
      <footer className="w-full bg-(--color-bg) flex flex-col gap-(--space-md) px-(--space-md) py-(--space-lg) min-md:flex-row min-md:items-center min-md:justify-between">
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
          className="footer-separator bg-(--color-3)"
          aria-hidden="true"
        />

        <ul className="flex items-center justify-center gap-(--space-md)">
          {socialLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="social-btn bg-(--color-1) text-white transition-(--anim-btn-transition) duration-(--anim-btn-duration) hover:scale-(--anim-btn-scale)"
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
