"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const clienteSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  status: z.boolean(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

type ClienteFormProps = {
  onSubmit: (data: ClienteFormData) => void;
  defaultValues?: ClienteFormData;
  isLoading?: boolean;
  onDelete?: () => void;
  isEditMode?: boolean;
};

export function ClienteForm({
  onSubmit,
  defaultValues,
  isLoading,
  onDelete,
  isEditMode,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      ...defaultValues,
      status: defaultValues?.status ?? true,
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <form
      onSubmit={handleSubmit(
        async (data) => {
          try {
            await onSubmit(data);
            toast.success("Cliente salvo com sucesso!");
          } catch (e) {
            toast.error("Erro ao salvar cliente.");
          }
        },
        (formError) => {
          toast.error("Preencha todos os campos obrigatórios corretamente.");
        }
      )}
      className="space-y-6"
    >
      <div>
        <Input placeholder="Nome" {...register("nome")} />
        {errors.nome && (
          <span className="text-red-500 text-xs">{errors.nome.message}</span>
        )}
      </div>
      <div>
        <Input placeholder="E-mail" {...register("email")} />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
      </div>
      <div>
        <Input placeholder="Telefone" {...register("telefone")} />
        {errors.telefone && (
          <span className="text-red-500 text-xs">
            {errors.telefone.message}
          </span>
        )}
      </div>
      <div>
        <label className="flex items-center gap-2">
          <span>Status:</span>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <span>{watch("status") ? "Ativo" : "Inativo"}</span>
        </label>
        {errors.status && (
          <span className="text-red-500 text-xs">{errors.status.message}</span>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {onDelete && (
          <>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar exclusão</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-sm text-red-600">
                  Tem certeza que deseja excluir este cliente? Essa ação não
                  pode ser desfeita.
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setConfirmOpen(false);
                      onDelete();
                    }}
                  >
                    Confirmar exclusão
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditMode
              ? "Salvando..."
              : "Cadastrando..."
            : isEditMode
            ? "Salvar Alterações"
            : "Cadastrar Cliente"}
        </Button>
      </div>
    </form>
  );
}
