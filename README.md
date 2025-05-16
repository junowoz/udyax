# UDYAX Frontend

UDYAX é uma GovTech de transparência que oferece ferramentas para monitorar promessas, votações, licitações e gastos públicos.

## Tecnologias Utilizadas

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui para componentes
- Lucide React para ícones
- Recharts para gráficos

## Funcionalidades

1. **Landing Page**

   - Header com navegação responsiva
   - Seção hero com título e chamada para ação
   - Seção "Como Funciona" destacando as principais ferramentas
   - Demonstração de dados com gráficos e tabelas
   - Footer com links úteis

2. **Chat Embutido**
   - Interface de chat para consulta de dados
   - Opções de escopo: Promessômetro, Votações, Licitações e Gastos
   - Integração com API para consultas

## Primeiros Passos

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/yourusername/udyax.git
cd udyax/udyax-front

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
udyax-front/
├── public/              # Arquivos estáticos
├── src/
│   ├── app/             # Páginas (App Router)
│   │   ├── api/         # Rotas de API
│   │   └── page.tsx     # Página principal
│   ├── components/      # Componentes React
│   │   ├── ui/          # Componentes shadcn/ui
│   │   └── ...          # Componentes específicos
│   └── lib/             # Utilitários e funções
└── ...                  # Arquivos de configuração
```

## Desenvolvimento

Para adicionar novos componentes shadcn/ui:

```bash
npx shadcn add [nome-do-componente]
```

## API

O frontend se comunica com uma API REST que fornece dados para as consultas do chat. A API espera requisições no formato:

```json
{
  "scope": "promessometro|votacoes|licitacoes|gastos",
  "query": "<texto do usuário>"
}
```

## Licença

Este projeto está licenciado sob a licença ISC.
