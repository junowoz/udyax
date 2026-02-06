import type { ReactNode } from "react";
import type { SectionId } from "@/types/landing";

type SectionProps = {
  id: SectionId;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="udy-section" aria-labelledby={`${id}-title`}>
      <div className="udy-section-header">
        <h2 id={`${id}-title`} className="udy-section-title text-balance">
          {title}
        </h2>
        {subtitle ? <p className="udy-section-subtitle text-pretty">{subtitle}</p> : null}
      </div>
      <div className="udy-section-content">{children}</div>
    </section>
  );
}
