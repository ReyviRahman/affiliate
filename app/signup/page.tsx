import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Daftar | Affiliate",
  description: "Buat akun untuk aplikasi Affiliate",
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-12 sm:px-6">
      <div className="w-full space-y-4">
        <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/">
          <ArrowLeft className="size-4" />
          Kembali ke beranda
        </Link>
        <Card>
          <CardHeader className="pb-2">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UserPlus className="size-5" />
            </div>
            <CardTitle className="text-2xl">Buat akun</CardTitle>
            <CardDescription>Daftarkan diri Anda untuk mulai menggunakan aplikasi Affiliate.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
