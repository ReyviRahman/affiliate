import Link from "next/link";
import { ArrowRight, TicketPercent, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full overflow-hidden">
        <CardContent className="flex min-h-[28rem] flex-col items-start justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TicketPercent className="size-4" />
            WooCommerce
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Kelola kupon affiliate dari satu tempat
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Pantau kupon dan produk kursus yang terhubung melalui dashboard yang ringkas dan mudah digunakan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonVariants({ size: "lg" })} href="/dashboard">
              Buka Dashboard
              <ArrowRight />
            </Link>
            <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/signup">
              <UserPlus />
              Daftar
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
