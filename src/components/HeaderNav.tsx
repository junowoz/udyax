"use client";

import { Alignment, Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from "@blueprintjs/core";
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
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading className="udy-brand-wrap">
            <span className="udy-brand">UDYAX</span>
            <span className="udy-subbrand">CityOS — Infraestrutura Urbana Inteligente</span>
          </NavbarHeading>
          <NavbarDivider />
          <nav aria-label="Navegação principal" className="udy-anchor-nav">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="udy-anchor-link">
                {item.label}
              </a>
            ))}
          </nav>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button small intent="primary" icon="grid-view" text="Explorar CityOS" onClick={() => {
            document.getElementById("cityos")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }} />
        </NavbarGroup>
      </Navbar>
    </header>
  );
}
