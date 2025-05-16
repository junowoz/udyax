// Path: src/components/footer.tsx - Footer component with links
import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2025 UDYAX. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/termos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Termos
          </Link>
          <Link
            href="/privacidade"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacidade
          </Link>
          <Link
            href="https://github.com/udyax"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
