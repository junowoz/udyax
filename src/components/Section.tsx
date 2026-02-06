import type { ReactNode } from "react";
import type { SectionId } from "@/types/landing";
import { Box } from "@blueprintjs/labs";

type SectionProps = {
  id: SectionId;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function Section({ id, title, subtitle, children }: SectionProps) {
  return (
    <section id={id} className="udy-section" aria-labelledby={`${id}-title`}>
      <Box className="udy-section-header" marginBottom={3}>
        <Box asChild margin={0}>
          <h2 id={`${id}-title`} className="udy-section-title text-balance">
            {title}
          </h2>
        </Box>
        {subtitle ? (
          <Box asChild margin={0}>
            <p className="udy-section-subtitle text-pretty">{subtitle}</p>
          </Box>
        ) : null}
      </Box>
      <Box className="udy-section-content" display="grid" gap={3}>
        {children}
      </Box>
    </section>
  );
}
