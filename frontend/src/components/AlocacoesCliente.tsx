"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

type Alocacao = {
  id: number;
  ativo: string;
  valor: number;
};

type Ativo = {
  codigo: string;
  nome: string;
  tipo: string;
  valor: number;
};

export function AlocacoesCliente({ clienteId }: { clienteId: number }) {
  const queryClient = useQueryClient();
  const [novoAtivo, setNovoAtivo] = useState("");
  const [novoValor, setNovoValor] = useState<number>(0);
  const [editando, setEditando] = useState<Alocacao | null>(null);
  const [editAtivo, setEditAtivo] = useState("");
  const [editValor, setEditValor] = useState<number>(0);

  // Buscar alocações
  const { data: alocacoes, isLoading } = useQuery<Alocacao[]>({
    queryKey: ["alocacoes", clienteId],
    queryFn: async () =>
      (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${clienteId}/alocacoes`)).data,
  });

  // Buscar ativos fixos
  const { data: ativos } = useQuery<Ativo[]>({
    queryKey: ["ativos"],
    queryFn: async () => (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ativos`)).data,
  });

  // Adicionar alocação
  const addMutation = useMutation({
    mutationFn: () =>
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${clienteId}/alocacoes`, {
        ativo: novoAtivo,
        valor: novoValor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alocacoes", clienteId] });
      setNovoAtivo("");
      setNovoValor(0);
      toast.success("Alocação adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao adicionar alocação.");
    },
  });

  // Excluir alocação
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/alocacoes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alocacoes", clienteId] });
      toast.success("Alocação adicionada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir alocação.");
    },
  });

  // Editar alocação
  const editMutation = useMutation({
    mutationFn: () =>
      axios.put(`${process.env.NEXT_PUBLIC_API_URL}/alocacoes/${editando?.id}`, {
        ativo: editAtivo,
        valor: editValor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alocacoes", clienteId] });
      setEditando(null);
      toast.success("Alocação editada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao editar alocação.");
    },
  });

  return (
    <div>
      <h3 className="font-semibold mb-2">Alocações</h3>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <ul className="mb-4">
          {alocacoes?.map((a) => {
            const precoAtual = ativos?.find(
              (at) => at.codigo === a.ativo
            )?.valor;
            return (
              <li key={a.id} className="flex justify-between items-center mb-2">
                <span>
                  {a.ativo} — {a.valor.toFixed(0)} Alocações
                  {precoAtual !== undefined && (
                    <span className="ml-2 text-xs text-gray-500">
                      — Preço atual: R$ {precoAtual.toFixed(2)}
                    </span>
                  )}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditando(a);
                      setEditAtivo(a.ativo);
                      setEditValor(a.valor);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(a.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addMutation.mutate();
        }}
      >
        <select
          className="border border-zinc-200 dark:border-zinc-700 rounded dark:bg-zinc-900 px-2 py-1"
          value={novoAtivo}
          onChange={(e) => setNovoAtivo(e.target.value)}
          required
        >
          <option value="">Selecione o ativo</option>
          {ativos?.map((ativo) => (
            <option key={ativo.codigo} value={ativo.codigo}>
              {ativo.nome} ({ativo.codigo})
            </option>
          ))}
        </select>
        <div className="flex flex-col">
          {novoAtivo && (
            <div className="text-xs text-gray-500 mb-2">
              Preço atual: R${" "}
              {ativos?.find((a) => a.codigo === novoAtivo)?.valor?.toFixed(2) ??
                "-"}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Valor"
              type="number"
              value={novoValor}
              onChange={(e) => setNovoValor(Number(e.target.value))}
              required
            />
            <Button type="submit" disabled={addMutation.isPending}>
              Adicionar
            </Button>
          </div>
        </div>
      </form>
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl w-full max-w-xs border border-zinc-200 dark:border-zinc-700 transition-all animate-modal-pop">
            <h4 className="font-semibold mb-2">Editar Alocação</h4>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate();
              }}
            >
              <select
                className="border rounded px-2 py-1"
                value={editAtivo}
                onChange={(e) => setEditAtivo(e.target.value)}
                required
              >
                <option value="">Selecione o ativo</option>
                {ativos?.map((ativo) => (
                  <option key={ativo.codigo} value={ativo.codigo}>
                    {ativo.nome} ({ativo.codigo})
                  </option>
                ))}
              </select>
              {editAtivo && (
                <div className="text-xs text-gray-500 mb-2">
                  Preço atual: R${" "}
                  {ativos
                    ?.find((a) => a.codigo === editAtivo)
                    ?.valor?.toFixed(2) ?? "-"}
                </div>
              )}
              <Input
                placeholder="Valor"
                type="number"
                value={editValor}
                onChange={(e) => setEditValor(Number(e.target.value))}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={editMutation.isPending}>
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
