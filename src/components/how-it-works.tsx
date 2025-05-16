import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BarChart3, Vote, Search } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card className="border shadow-sm h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-md text-primary">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export function HowItWorks() {
  const features = [
    {
      title: "Promessômetro",
      description:
        "Acompanhe o status de cumprimento das promessas feitas por políticos durante suas campanhas eleitorais.",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "Votações",
      description:
        "Visualize os resultados de votações importantes no âmbito federal e estadual, por parlamentar ou projeto.",
      icon: <Vote className="h-5 w-5" />,
    },
    {
      title: "Licita-Radar",
      description:
        "Monitore licitações em aberto e contratos firmados por órgãos públicos em diferentes esferas.",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "Dashboard de Gastos",
      description:
        "Explore gráficos interativos com informações detalhadas sobre gastos públicos por setor e município.",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Como Funciona
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            A UDYAX oferece ferramentas para monitorar diversas facetas da
            transparência pública.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
