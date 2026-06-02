"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/intl/navigation";

export function LogoutButton() {
  const t = useTranslations("auth");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="min-h-touch min-w-touch"
      onClick={handleLogout}
      aria-label={t("logout")}
    >
      <LogOut className="size-4" />
    </Button>
  );
}
