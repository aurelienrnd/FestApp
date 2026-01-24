"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin");

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

export default function Banner() {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin");
  const items = isAdminPath ? navAdminItems : navVisitorItems;

  return (
    <header className="mx-auto flex w-full items-center justify-between px-4 py-2">
      <Image src={logo} alt="Logo Hellfest" width={90} height={90} />
      <DesktopNav items={items} />
    </header>
  );
}
