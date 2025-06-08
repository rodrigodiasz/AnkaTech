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

export interface ClienteFormData {
  nome: string;
  email: string;
  telefone?: string;
  status: boolean;
}

type ClienteFormProps = {
  onSubmit: (data: ClienteFormData) => void;
  defaultValues?: Partial<ClienteFormData>;
  isLoading?: boolean;
  onDelete?: () => void;
  isEditMode?: boolean;
};

const clienteSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome é obrigatório e deve ter pelo menos 3 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  telefone: z
    .string()
    .regex(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      "Telefone deve estar no formato (99) 99999-9999"
    ),
  status: z.boolean().default(true),
});

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
    resolver: zodResolver(clienteSchema) as any,
    defaultValues: {
      status: true,
      ...defaultValues,
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const isActive = watch("status");

  // Função para formatar o telefone
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handleDelete = () => {
    if (isActive) {
      toast.error(
        "Não é possível excluir um cliente ativo. Desative o cliente primeiro."
      );
      setConfirmOpen(false);
      return;
    }
    onDelete?.();
    setConfirmOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit(
        async (data) => {
          try {
            await onSubmit(data);
          } catch (e) {
            toast.error("Erro ao salvar cliente.");
          }
        },
        (formError) => {
          const errorMessages = Object.values(formError).map(
            (error) => error.message
          );
          toast.error(
            errorMessages[0] ||
              "Preencha todos os campos obrigatórios corretamente."
          );
        }
      )}
      className="space-y-6"
    >
      <div>
        <Input placeholder="Nome *" {...register("nome")} />
        {errors.nome && (
          <span className="text-red-500 text-xs mt-1 block">
            {errors.nome.message}
          </span>
        )}
      </div>
      <div>
        <Input placeholder="E-mail *" {...register("email")} />
        {errors.email && (
          <span className="text-red-500 text-xs mt-1 block">
            {errors.email.message}
          </span>
        )}
      </div>
      <div>
        <Input
          placeholder="Telefone (99) 99999-9999"
          {...register("telefone", {
            onChange: (e) => {
              e.target.value = formatPhoneNumber(e.target.value);
            },
          })}
        />
        {errors.telefone && (
          <span className="text-red-500 text-xs mt-1 block">
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
                  {isActive
                    ? "Não é possível excluir um cliente ativo. Desative o cliente primeiro."
                    : "Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita."}
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
                    onClick={handleDelete}
                    disabled={isActive}
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
