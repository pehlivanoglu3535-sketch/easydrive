"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Giriş yapılıyor…" : (<><LogIn size={16} /> Giriş Yap</>)}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> {state.error}
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" name="email" type="email" required autoFocus className="input" placeholder="admin@meridyendanismanlik.com" />
      </div>
      <div>
        <label className="label" htmlFor="password">Şifre</label>
        <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
      </div>
      <SubmitButton />
    </form>
  );
}
