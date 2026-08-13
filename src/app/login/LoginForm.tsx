"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-red-600/10">
          <AlertCircle size={16} className="shrink-0" /> {state.error}
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" name="email" type="email" className="input" placeholder="ornek@firma.com" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Şifre</label>
        <input id="password" name="password" type="password" className="input" placeholder="••••••••" required />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        <LogIn size={16} /> {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
