"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  navVisitorItems,
  navAdminItems,
  type NavItem,
} from "../config/navigation";
import logo from "../../public/header_logo.png";

function BtnTiket() {
  return (
    <li>
      <a
        href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
        className="btn-cta"
        target="_blank"
        rel="noopener noreferrer"
      >
        Billetterie
      </a>
    </li>
  );
}

function DesktopNav({
  items,
  pathname,
  isAdminPath,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
}) {
  return (
    <nav>
      <ul className="flex items-center gap-6 tracking-wides">
        {items.map((item) => {
          const isActive = pathname === item.path;

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={
                  isActive
                    ? "border-b border-(--collor-1)"
                    : "border-b border-transparent transition-colors hover:border-(--collor-1)"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {isAdminPath ? null : <BtnTiket />}
      </ul>
    </nav>
  );
}

function MobilNav({
  items,
  pathname,
  isAdminPath,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <nav>
      <ul className="flex items-center gap-6 tracking-wides">
        <li>
          <button
            className="mobil-menu"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            M
          </button>
        </li>
        {isAdminPath ? null : <BtnTiket />}
      </ul>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Menu"
        className="mobile-nav-modal"
        overlayClassName="mobile-nav-modal-overlay"
      >
        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(false)}
          contentLabel="Menu"
          className="mobile-nav-modal"
          overlayClassName="mobile-nav-modal-overlay"
        >
          <div className="flex w-full justify-end">
            <button type="button" onClick={() => setIsOpen(false)}>
              X
            </button>
          </div>

          <nav>
            <ul className="flex flex-col gap-6">
              {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li
                    key={item.path}
                    className={
                      isActive
                        ? "bg-(--collor-1) w-50 p-2"
                        : "bg-black text-white w-30 p-2"
                    }
                  >
                    <Link href={item.path} className="block w-full text-right">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Modal>

        <nav>
          <ul className="flex flex-col gap-6">
            {items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={
                      isActive
                        ? "bg-(--collor-1) px-2"
                        : "bg-black text-white hover:bg-(--collor-1) px-2"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Modal>
    </nav>
  );
}

export default function Banner() {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin") ?? false;
  const items = isAdminPath ? navAdminItems : navVisitorItems;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktop(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="mx-auto flex w-full items-center justify-between px-4 py-2">
      <Image src={logo} alt="Logo Hellfest" width={90} height={90} />
      {isDesktop ? (
        <DesktopNav
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
        />
      ) : (
        <MobilNav items={items} pathname={pathname} isAdminPath={isAdminPath} />
      )}
    </header>
  );
}
