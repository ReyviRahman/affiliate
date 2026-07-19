"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signup, type SignupFormState } from "./actions";

const initialState: SignupFormState = undefined;

type FieldProps = {
  autoComplete: string;
  errors?: string[];
  id: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
};

function FormField({ autoComplete, errors, id, label, name, placeholder, type = "text" }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <Input
        aria-describedby={errors ? errorId : undefined}
        aria-invalid={Boolean(errors)}
        autoComplete={autoComplete}
        id={id}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
      {errors && <p className="text-sm text-destructive" id={errorId}>{errors.join(" ")}</p>}
    </div>
  );
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField
        autoComplete="name"
        errors={state?.errors?.name}
        id="name"
        label="Nama"
        name="name"
        placeholder="Nama lengkap"
      />
      <FormField
        autoComplete="email"
        errors={state?.errors?.email}
        id="email"
        label="Email"
        name="email"
        placeholder="nama@contoh.com"
        type="email"
      />
      <FormField
        autoComplete="new-password"
        errors={state?.errors?.password}
        id="password"
        label="Password"
        name="password"
        placeholder="Minimal 8 karakter"
        type="password"
      />
      <FormField
        autoComplete="new-password"
        errors={state?.errors?.confirmPassword}
        id="confirmPassword"
        label="Konfirmasi password"
        name="confirmPassword"
        placeholder="Ulangi password"
        type="password"
      />

      {state?.message && (
        <p aria-live="polite" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Membuat akun..." : "Buat akun"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah ingin melihat kupon?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/dashboard">
          Buka dashboard
        </Link>
      </p>
    </form>
  );
}
