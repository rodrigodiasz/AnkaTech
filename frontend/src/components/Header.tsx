"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "@/components/ui/theme-switch";

export function Header() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b shadow-sm mb-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between py-3 px-4">
        <div className="font-bold text-lg cursor-pointer" onClick={() => router.push("/")}>
          Anka Investimentos
        </div>
        <nav className="flex gap-4 items-center">
          <Button variant="ghost" onClick={() => router.push("/clientes")}>
            Clientes
          </Button>
          <Button variant="ghost" onClick={() => router.push("/ativos")}>
            Ativos
          </Button>
          <ThemeSwitch />
        </nav>
      </div>
    </header>
  );
}