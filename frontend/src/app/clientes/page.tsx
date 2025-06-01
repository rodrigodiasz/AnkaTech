"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClienteForm, ClienteFormData } from "@/components/ClienteForm";
import { Loader2, ArrowRight, ArrowLeft, Pencil } from "lucide-react";
import { AlocacoesCliente } from "@/components/AlocacoesCliente";
import { Input } from "@/components/ui/input";

type Cliente = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  status: boolean;
};

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [appliedNome, setAppliedNome] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const limit = 10;

  // Buscar clientes
  const { data, isLoading } = useQuery({
    queryKey: ["clientes", page, appliedNome, appliedEmail, appliedStatus],
    queryFn: async () => {
      if (appliedNome || appliedEmail) {
        const params = new URLSearchParams({
          ...(appliedNome && { nome: appliedNome }),
          ...(appliedEmail && { email: appliedEmail }),
        });
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/clientes/busca?${params}`);
        return { clientes: res.data, total: res.data.length };
      }
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(appliedStatus && { status: appliedStatus }),
      });
      return (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/clientes?${params}`)).data;
    },
  });

  // Adicionar cliente
  const addMutation = useMutation({
    mutationFn: (data: ClienteFormData) =>
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setOpen(false);
    },
  });

  // Editar cliente
  const editMutation = useMutation({
    mutationFn: (data: ClienteFormData) =>
      axios.put(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${editing?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setEditing(null);
      setOpen(false);
    },
  });

  // Excluir cliente
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl">Clientes</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <ClienteForm
                onSubmit={editing ? editMutation.mutate : addMutation.mutate}
                defaultValues={editing || undefined}
                isLoading={
                  editing ? editMutation.isPending : addMutation.isPending
                }
                onDelete={
                  editing
                    ? () => {
                        deleteMutation.mutate(editing.id);
                        setOpen(false);
                      }
                    : undefined
                }
                isEditMode={!!editing}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Input
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md dark:bg-zinc-800 px-2"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
            <Button
              onClick={async () => {
                setFilterLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Debounce para evitar múltiplas requisições
                setAppliedNome(nome);
                setAppliedEmail(email);
                setAppliedStatus(status);
                setPage(1);
                setFilterLoading(false);
              }}
              disabled={filterLoading}
            >
              {filterLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Filtrando...
                </span>
              ) : (
                "Filtrar"
              )}
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Carregando...
            </div>
          ) : (
            <ul className="space-y-2">
              {data?.clientes?.map((cliente: Cliente) => (
                <li
                  key={cliente.id}
                  className="border-b flex flex-row gap-1 py-2"
                >
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {cliente.nome}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1"
                        onClick={() => {
                          setEditing(cliente);
                          setOpen(true);
                        }}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 break-all">
                      {cliente.email}
                    </div>
                    <div className="text-sm">
                      Status: {cliente.status ? "Ativo" : "Inativo"}
                    </div>
                    {cliente.telefone && (
                      <div className="text-sm">
                        Telefone: {cliente.telefone}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary">Ver Alocações</Button>
                      </DialogTrigger>
                      <DialogContent className="border border-zinc-700">
                        <DialogHeader>
                          <DialogTitle>Alocações de {cliente.nome}</DialogTitle>
                        </DialogHeader>
                        <AlocacoesCliente clienteId={cliente.id} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 justify-center items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span>Página {page}</span>
            <Button
              variant="outline"
              disabled={data && page * limit >= data.total}
              onClick={() => setPage(page + 1)}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
