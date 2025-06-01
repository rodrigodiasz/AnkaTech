import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BarChart2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-8">
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Bem-vindo ao Sistema Anka
          </CardTitle>
          <p className="text-center text-gray-500 mt-2 text-base">
            Gerencie clientes e visualize ativos financeiros de forma simples e
            eficiente.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 items-center">
          <Link href="/clientes" className="w-full">
            <Button
              className="w-full flex items-center gap-2 text-lg"
              size="lg"
            >
              <Users className="w-5 h-5" />
              Gerenciar Clientes
            </Button>
          </Link>
          <Link href="/ativos" className="w-full">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-lg"
              size="lg"
            >
              <BarChart2 className="w-5 h-5" />
              Ver Ativos
            </Button>
          </Link>
        </CardContent>
      </Card>
      <footer className="mt-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Anka Tech
      </footer>
    </div>
  );
}
