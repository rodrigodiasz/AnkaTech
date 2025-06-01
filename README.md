# AnkaTech

Aplicação desenvolvida como parte do case técnico da Anka Tech para gerenciar clientes e exibir informações básicas sobre ativos financeiros.

## 🧠 Descrição do Projeto

A solução proposta simula o sistema de um escritório de investimentos. Com foco em organização e escalabilidade, a aplicação permite:

- Cadastro, listagem e edição de clientes.
- Visualização de ativos financeiros disponíveis.
- Visualização da alocação de ativos por cliente.

Toda a aplicação é implementada 100% em TypeScript, dividida em dois projetos: Backend (Node.js/Fastify) e Frontend (Next.js), orquestrados com Docker.

---

## 🛠️ Tecnologias Utilizadas

### 📦 Backend (Node.js + Fastify)

- **Fastify** — Framework web leve e performático.
- **Prisma ORM** — Mapeamento objeto-relacional com banco MySQL.
- **Zod** — Validação de esquemas e payloads.
- **MySQL** — Banco de dados relacional em contêiner Docker.

#### Funcionalidades:

- CRUD de clientes (`nome`, `email`, `status`)
- Endpoint de ativos financeiros com dados mockados
- Validação de dados com `Zod`
- Integração com MySQL usando `Prisma`

---

### 💻 Frontend (Next.js + React)

- **Next.js** — Framework React fullstack.
- **ShadCN/UI** — Componentes reutilizáveis para interface limpa e funcional.
- **React Hook Form** — Formulários reativos.
- **Zod** — Validação dos dados nos formulários.
- **React Query** — Gerenciamento de requisições.
- **Axios** — Cliente HTTP para comunicação com o backend.

#### Funcionalidades:

- Página para cadastro, listagem e edição de clientes.
- Página de visualização de ativos.
- Interface funcional baseada em componentes reutilizáveis do ShadCN.

---

## 🐳 Docker

A aplicação é totalmente containerizada usando Docker Compose:

- **db**: Contêiner com MySQL configurado com senha segura.
- **backend**: API Fastify conectada ao banco via Prisma.
- **frontend**: Aplicação Next.js consumindo a API.

### ⚙️ Variáveis de Ambiente

Exemplo para o backend (`.env`):

```
DATABASE_URL=mysql://root:root@db:3306/anka
```

---

## 🗃️ Scripts e Migrações Prisma

⚙️ Configuracao do Prisma

schema.prisma
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Cliente {
  id        Int      @id @default(autoincrement())
  nome      String
  email     String   @unique
  telefone  String?
  status    Boolean  @default(true) 
  criadoEm  DateTime @default(now())
  atualizadoEm DateTime @updatedAt
  alocacoes Alocacao[]
}

model Alocacao {
  id         Int      @id @default(autoincrement())
  clienteId  Int
  ativo      String
  valor      Float
  cliente    Cliente  @relation(fields: [clienteId], references: [id])
}
```

Antes de rodar o backend, aplique as migrações com:

```bash
npx prisma migrate dev --name init
```

Isso criará as tabelas necessárias no banco de dados.

---

## ▶️ Como Executar o Projeto

Certifique-se de ter o Docker e Docker Compose instalados. Em seguida, execute:

```bash
docker compose up --build
```

A aplicação estará disponível em:

- Backend: [http://localhost:3001](http://localhost:3001)
- Frontend: [http://localhost:3002](http://localhost:3002)

---

## 📁 Estrutura do Projeto

```
AnkaTech/
├── backend/             # API Fastify + Prisma
├── frontend/            # Aplicação Next.js
├── docker-compose.yml   # Orquestração dos serviços
└── README.md
```

