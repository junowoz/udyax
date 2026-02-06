"use client";

import { Alignment, Button, Navbar, NavbarGroup, NavbarHeading } from "@blueprintjs/core";
import { Flex } from "@blueprintjs/labs";
import Image from "next/image";
import type { NavItem } from "@/types/landing";

const navItems: NavItem[] = [
  { id: "manifesto", label: "Manifesto" },
  { id: "cityos", label: "CityOS" },
  { id: "fases", label: "3 Atos" },
  { id: "evidencias", label: "Urban Signals" },
  { id: "casos", label: "Referências" },
];

export default function HeaderNav() {
  return (
    <header className="udy-header-shell">
      <Navbar fixedToTop className="udy-header bp6-dark">
        <Flex className="udy-header-inner" alignItems="center">
          <NavbarGroup align={Alignment.LEFT} className="udy-nav-left">
            <NavbarHeading className="udy-brand-wrap">
              <span className="udy-brand" aria-label="UDYAX">
                <Image src="/logo.svg" alt="UDYAX" width={140} height={34} priority />
              </span>
            </NavbarHeading>
          </NavbarGroup>
          <NavbarGroup align={Alignment.LEFT} className="udy-nav-center">
            <nav aria-label="Navegação principal" className="udy-anchor-nav">
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="udy-anchor-link">
                  {item.label}
                </a>
              ))}
            </nav>
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT} className="udy-nav-right">
            <Button
              small
              intent="primary"
              icon="grid-view"
              text="Explorar CityOS"
              onClick={() => {
                document.getElementById("cityos")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </NavbarGroup>
        </Flex>
      </Navbar>
    </header>
  );
}
