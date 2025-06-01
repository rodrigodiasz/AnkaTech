import "dotenv/config";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { PrismaClient } from "@prisma/client";
import { z} from "zod";
import fastifyCors from "@fastify/cors";

const fastify: FastifyInstance = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.register(fastifyCors, {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Test route
fastify.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
  return { status: "ok" };
});

// Esquema de validação com Zod
const clienteSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().optional(),
  status: z.boolean().default(true),
});

type ClienteInput = z.infer<typeof clienteSchema>;

type ClientePartialInput = Partial<ClienteInput>;

// Criar cliente
fastify.post(
  "/clientes",
  async (
    request: FastifyRequest<{ Body: ClienteInput }>,
    reply: FastifyReply
  ) => {
    const parse = clienteSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.errors });
    }
    const { nome, email, telefone } = parse.data;
    try {
      const cliente = await prisma.cliente.create({
        data: { nome, email, telefone },
      });
      return reply.status(201).send(cliente);
    } catch (err: any) {
      if (err.code === "P2002") {
        return reply.status(409).send({ error: "E-mail já cadastrado." });
      }
      return reply.status(500).send({ error: "Erro ao criar cliente." });
    }
  }
);

// Listar clientes
fastify.get("/clientes", async (request, reply) => {
  const { page = 1, limit = 10, nome, email, status } = request.query as any;
  const where: any = {};
  if (nome) where.nome = { contains: nome };
  if (email) where.email = { contains: email };
  if (status === "true") where.status = true;
  if (status === "false") where.status = false;

  try {
    console.log("Filtro where:", where);
    const clientes = await prisma.cliente.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { id: "desc" },
    });
    const total = await prisma.cliente.count({ where });
    return reply.send({ clientes, total });
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    return reply.status(500).send({ error: "Erro ao buscar clientes." });
  }
});

// Buscar cliente por ID
fastify.get(
  "/clientes/:id",
  async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const id = Number(request.params.id);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "ID inválido." });
    }
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      return reply.status(404).send({ error: "Cliente não encontrado." });
    }
    return reply.send(cliente);
  }
);

// Buscar clientes por nome e/ou email 
fastify.get(
  "/clientes/busca",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { nome, email } = request.query as { nome?: string; email?: string };
    const where: any = {};
    if (nome) where.nome = { contains: nome };
    if (email) where.email = { contains: email };
    try {
      const clientes = await prisma.cliente.findMany({ where });
      return reply.send(clientes);
    } catch (err) {
      console.error("Erro ao buscar clientes (busca):", err);
      return reply
        .status(500)
        .send({ error: "Erro ao buscar clientes (busca)." });
    }
  }
);

// Editar cliente
fastify.put(
  "/clientes/:id",
  async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: ClientePartialInput;
    }>,
    reply: FastifyReply
  ) => {
    const id = Number(request.params.id);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "ID inválido." });
    }
    const parse = clienteSchema.partial().safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: parse.error.errors });
    }
    try {
      const cliente = await prisma.cliente.update({
        where: { id },
        data: parse.data,
      });
      return reply.send(cliente);
    } catch (err: any) {
      if (err.code === "P2025") {
        return reply.status(404).send({ error: "Cliente não encontrado." });
      }
      return reply.status(500).send({ error: "Erro ao atualizar cliente." });
    }
  }
);

// Excluir cliente
fastify.delete(
  "/clientes/:id",
  async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const id = Number(request.params.id);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "ID inválido." });
    }
    try {
      await prisma.cliente.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      if (err.code === "P2025") {
        return reply.status(404).send({ error: "Cliente não encontrado." });
      }
      return reply.status(500).send({ error: "Erro ao excluir cliente." });
    }
  }
);

// Endpoint para listar ativos financeiros estáticos
fastify.get(
  "/ativos",
  async (_request: FastifyRequest, reply: FastifyReply) => {
    const ativos = [
      { codigo: "XYZ3", nome: "Ação XYZ", tipo: "Ação", valor: 25.3 },
      { codigo: "ABC11", nome: "Fundo ABC", tipo: "FII", valor: 102.5 },
      {
        codigo: "TESOURO",
        nome: "Tesouro Direto",
        tipo: "Renda Fixa",
        valor: 1000.0,
      },
    ];
    return reply.send(ativos);
  }
);

// Criar alocação para cliente
fastify.post(
  "/clientes/:id/alocacoes",
  async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { ativo: string; valor: number };
    }>,
    reply: FastifyReply
  ) => {
    const clienteId = Number(request.params.id);
    const { ativo, valor } = request.body;
    if (!ativo || typeof valor !== "number") {
      return reply
        .status(400)
        .send({ error: "Ativo e valor são obrigatórios." });
    }
    try {
      const alocacao = await prisma.alocacao.create({
        data: { clienteId, ativo, valor },
      });
      return reply.status(201).send(alocacao);
    } catch (err) {
      return reply.status(500).send({ error: "Erro ao criar alocação." });
    }
  }
);

// Listar alocações de um cliente
fastify.get(
  "/clientes/:id/alocacoes",
  async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const clienteId = Number(request.params.id);
    const alocacoes = await prisma.alocacao.findMany({ where: { clienteId } });
    return reply.send(alocacoes);
  }
);

// Editar alocação
fastify.put(
  "/alocacoes/:alocacaoId",
  async (
    request: FastifyRequest<{
      Params: { alocacaoId: string };
      Body: { ativo?: string; valor?: number };
    }>,
    reply: FastifyReply
  ) => {
    const alocacaoId = Number(request.params.alocacaoId);
    const { ativo, valor } = request.body;
    try {
      const alocacao = await prisma.alocacao.update({
        where: { id: alocacaoId },
        data: { ativo, valor },
      });
      return reply.send(alocacao);
    } catch (err) {
      return reply.status(500).send({ error: "Erro ao atualizar alocação." });
    }
  }
);

// Excluir alocação
fastify.delete(
  "/alocacoes/:alocacaoId",
  async (
    request: FastifyRequest<{ Params: { alocacaoId: string } }>,
    reply: FastifyReply
  ) => {
    const alocacaoId = Number(request.params.alocacaoId);
    try {
      await prisma.alocacao.delete({ where: { id: alocacaoId } });
      return reply.status(204).send();
    } catch (err) {
      return reply.status(500).send({ error: "Erro ao excluir alocação." });
    }
  }
);

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT), host: process.env.HOST });
    console.log(`Server running at ${process.env.SERVER_URL}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
