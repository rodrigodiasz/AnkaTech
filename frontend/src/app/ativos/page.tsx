"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
type Ativo = {
  codigo: string;
  nome: string;
  tipo: string;
  valor: number;
};

const fetchAtivos = async (): Promise<Ativo[]> => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ativos`);
  return res.data;
};

export default function AtivosPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ativos"],
    queryFn: fetchAtivos,
  });

  if (isLoading) return <div className="flex justify-center gap-2 items-center h-screen"><Loader2 className="w-10 h-10 animate-spin" /> Carregando
  </div>;
  if (error) return <div>Erro ao carregar ativos.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Ativos Financeiros</CardTitle>
          <Button variant="outline" onClick={() => refetch()}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {(Array.isArray(data) ? data : []).map((ativo) => (
              <li key={ativo.codigo} className="border-b pb-2">
                <div className="font-semibold">
                  {ativo.nome} ({ativo.codigo})
                </div>
                <div>Tipo: {ativo.tipo}</div>
                <div>Valor: R$ {ativo.valor.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </CardContent>       
      </Card>
    </div>
  );
}
