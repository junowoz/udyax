"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-2xl">
            UDYAX
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Início
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Como Funciona
          </Link>
          <Link
            href="#sobre"
            className="text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Sobre
          </Link>
          <Link
            href="#contato"
            className="text-sm font-medium hover:text-primary/80 transition-colors"
          >
            Contato
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium hover:text-primary/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              href="#sobre"
              className="text-sm font-medium hover:text-primary/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link
              href="#contato"
              className="text-sm font-medium hover:text-primary/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
