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
- Validação de telefone no formato (99) 99999-9999
- Formatação automática de telefone durante digitação
- Mensagens de erro claras e validações em tempo real
- Notificações toast para feedback de ações
- Criptografia de dados sensíveis (número de alocações) usando AES-256-GCM
- Gerenciamento seguro de chaves de criptografia
- Decodificação automática de dados criptografados

---

### 💻 Frontend (Next.js + React)

- **Next.js** — Framework React fullstack.
- **ShadCN/UI** — Componentes reutilizáveis para interface limpa e funcional.
- **React Hook Form** — Formulários reativos.
- **Zod** — Validação dos dados nos formulários.
- **React Query** — Gerenciamento de requisições.
- **Axios** — Cliente HTTP para comunicação com o backend.
- **Sonner** — Notificações toast elegantes.

#### Funcionalidades:

- Página para cadastro, listagem e edição de clientes.
- Página de visualização de ativos.
- Interface funcional baseada em componentes reutilizáveis do ShadCN.
- Validação de formulários com feedback visual.
- Formatação automática de campos (ex: telefone).
- Notificações toast para sucesso/erro nas operações.
- Filtros de busca por nome, email e status.
- Paginação de resultados.

---

## 🐳 Docker

A aplicação é totalmente containerizada usando Docker Compose:

- **db**: Contêiner com MySQL configurado com senha segura.
- **backend**: API Fastify conectada ao banco via Prisma.
- **frontend**: Aplicação Next.js consumindo a API.

### ⚙️ Variáveis de Ambiente

**Importante:** Para que a criptografia funcione corretamente, é necessário definir uma chave de criptografia válida no arquivo `.env` do backend. Esta chave deve ter exatamente 32 caracteres para garantir a segurança adequada do algoritmo AES-256-GCM.

Exemplo para o backend (`.env`):

```
DATABASE_URL=mysql://root:root@db:3306/anka
SERVER_URL="http://localhost:3001"
HOST="0.0.0.0"
PORT="3001"
FRONTEND_URL="http://localhost:3002"
ENCRYPTION_KEY="sua-chave-secreta-de-32-caracteres" # Chave para criptografia AES-256-GCM
```

Exemplo para o Frontend (`.env`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001

```

### 📄 Variáveis de Ambiente com Docker Compose

O arquivo `docker-compose.yml` está configurado para utilizar variáveis de ambiente externas, facilitando a configuração e aumentando a segurança.
Essas variáveis devem ser definidas em um arquivo `.env` na raiz do projeto.

**Exemplo de `.env`:**

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=anka
MYSQL_USER=anka_user
MYSQL_PASSWORD=anka_pass
DATABASE_URL=mysql://root:root@mysql:3306/anka
```

No `docker-compose.yml`, as variáveis são referenciadas assim:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  MYSQL_DATABASE: ${MYSQL_DATABASE}
  MYSQL_USER: ${MYSQL_USER}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

**Importante:**

- Para rodar, basta garantir que o `.env` está presente e executar normalmente:
  ```bash
  docker-compose up
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

## 🐳 Rodando com Docker e Prisma Migrate

Após subir os containers com Docker Compose, é necessário aplicar as migrations do Prisma para criar as tabelas no banco de dados.

### 1. Subindo os containers

```bash
docker-compose up --build
```

### 2. Aplicando as migrations do Prisma

Abra um novo terminal e execute:

```bash
docker-compose exec backend npx prisma migrate deploy
```

Se quiser resetar o banco (apaga todos os dados e recria as tabelas):

```bash
docker-compose exec backend npx prisma migrate reset
```

### 3. Observações importantes

- **Variável de ambiente do banco:**
  No arquivo `.env` do backend, a variável `DATABASE_URL` deve ser:

  ```
  DATABASE_URL="mysql://root:root@mysql:3306/anka"
  ```

  (O host deve ser `mysql`, que é o nome do serviço no Docker Compose.)

- **Resetando tudo:**
  Para apagar todos os dados e subir do zero:
  ```bash
  docker-compose down -v
  docker-compose up --build
  docker-compose exec backend npx prisma migrate deploy
  ```

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
│   ├── Dockerfile       # Dockerfile do backend
│   └── .env             # Variáveis de ambiente do backend
├── frontend/            # Aplicação Next.js
│   ├── Dockerfile       # Dockerfile do frontend
│   └── .env             # Variáveis de ambiente do frontend
├── docker-compose.yml   # Orquestração dos serviços
├── .env                 # Variáveis de ambiente do compose
└── README.md
```
