import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton({ className = "btn-outline", label = "Çıkış" }: { className?: string; label?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" title={label} className={className}>
        <LogOut size={16} className="shrink-0" />
        <span className="hidden md:inline">{label}</span>
      </button>
    </form>
  );
}
