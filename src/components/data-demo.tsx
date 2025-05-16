"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartData = [
  {
    name: "Saúde",
    percentagem: 75,
  },
  {
    name: "Educação",
    percentagem: 60,
  },
  {
    name: "Infraestrutura",
    percentagem: 45,
  },
  {
    name: "Segurança",
    percentagem: 30,
  },
  {
    name: "Meio Ambiente",
    percentagem: 15,
  },
];

const tableData = [
  {
    politico: "David Almeida",
    promessa: "Construir 5 novas UPAs",
    status: "Em andamento",
  },
  {
    politico: "Wilson Lima",
    promessa: "Expandir programa Escola em Tempo Integral",
    status: "Concluído",
  },
  {
    politico: "Omar Aziz",
    promessa: "Revitalizar o Centro de Manaus",
    status: "Não iniciado",
  },
  {
    politico: "Eduardo Braga",
    promessa: "Implementar sistema único de segurança",
    status: "Em andamento",
  },
];

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Concluído":
      return "text-green-600";
    case "Em andamento":
      return "text-amber-600";
    case "Não iniciado":
      return "text-red-600";
    default:
      return "";
  }
};

const getBarColor = (percentage: number): string => {
  if (percentage >= 70) return "#2dd4bf";
  if (percentage >= 40) return "#facc15";
  return "#ef4444";
};

export function DataDemo() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Demo de Dados
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Veja exemplos de como visualizamos dados públicos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Chart */}
          <div className="shadow-md rounded-lg border p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">
              % de promessas cumpridas pelo prefeito de Manaus em 2023
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Cumprimento"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="percentagem" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.percentagem)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="shadow-md rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableCaption>
                Compromissos de campanha e suas situações
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Político</TableHead>
                  <TableHead>Promessa</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {row.politico}
                    </TableCell>
                    <TableCell>{row.promessa}</TableCell>
                    <TableCell className={getStatusColor(row.status)}>
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
