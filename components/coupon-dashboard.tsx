"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Clipboard, ExternalLink, PackageOpen, Search, TicketPercent } from "lucide-react";
import type { Coupon, CouponProduct } from "@/lib/woocommerce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CouponDashboardProps = { coupons: Coupon[]; totalsAvailable: boolean };

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function formatPrice(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? rupiah.format(amount) : "—";
}

function formatDiscount(coupon: Coupon) {
  if (coupon.discountType === "percent") return `${coupon.amount}%`;
  return formatPrice(coupon.amount);
}

function formatTotalDiscount(coupon: Coupon) {
  return coupon.totalDiscount === null ? "Tidak tersedia" : formatPrice(coupon.totalDiscount);
}

function formatExpiry(value: string | null) {
  if (!value) return "Tidak berakhir";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Tidak diketahui" : dateFormatter.format(date);
}

function statusVariant(status: string) {
  if (status === "publish") return "default" as const;
  if (status === "trash") return "destructive" as const;
  return "secondary" as const;
}

function CopyCouponButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button aria-label={`Salin kode ${code}`} onClick={copy} size="icon-sm" variant="ghost">
      {copied ? <Check className="text-emerald-600" /> : <Clipboard />}
    </Button>
  );
}

function ProductList({ products }: { products: CouponProduct[] }) {
  if (products.length === 0) return <span className="text-muted-foreground">Tidak ada produk spesifik</span>;

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div className="flex min-w-56 items-center gap-2" key={product.id}>
          {product.imageUrl ? (
            <Image
              alt=""
              className="size-9 rounded-md border object-cover"
              height={36}
              src={product.imageUrl}
              width={36}
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <PackageOpen className="size-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 leading-tight">
            {product.permalink ? (
              <a
                className="line-clamp-1 font-medium hover:underline"
                href={product.permalink}
                rel="noreferrer"
                target="_blank"
              >
                {product.name} <ExternalLink className="ml-0.5 inline size-3" />
              </a>
            ) : (
              <p className="line-clamp-1 font-medium">{product.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {product.available ? formatPrice(product.price) : "Produk tidak tersedia"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  return (
    <Card className="md:hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-mono text-lg">{coupon.code}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{formatDiscount(coupon)} diskon</p>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={statusVariant(coupon.status)}>{coupon.status}</Badge>
            <CopyCouponButton code={coupon.code} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductList products={coupon.products} />
        <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
          <div><p className="text-muted-foreground">Berlaku sampai</p><p>{formatExpiry(coupon.expiresAt)}</p></div>
          <div><p className="text-muted-foreground">Penggunaan</p><p>{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</p></div>
          <div className="col-span-2"><p className="text-muted-foreground">Total diskon diberikan</p><p className="font-medium">{formatTotalDiscount(coupon)}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CouponDashboard({ coupons, totalsAvailable }: CouponDashboardProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = useMemo(() => [...new Set(coupons.map((coupon) => coupon.status))].sort(), [coupons]);
  const filteredCoupons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return coupons.filter((coupon) => {
      const matchesStatus = status === "all" || coupon.status === status;
      const matchesQuery = !normalizedQuery ||
        coupon.code.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
        coupon.products.some((product) => product.name.toLocaleLowerCase("id-ID").includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [coupons, query, status]);

  const productCount = new Set(coupons.flatMap((coupon) => coupon.products.map((product) => product.id))).size;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground"><TicketPercent className="size-4" /> WooCommerce</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard Kupon</h1>
          <p className="mt-2 text-muted-foreground">Pantau kupon dan produk kursus yang terhubung.</p>
        </div>
        <p className="text-sm text-muted-foreground">Data diperbarui saat halaman dimuat.</p>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total kupon</p><p className="mt-1 text-3xl font-semibold">{coupons.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Produk terkait</p><p className="mt-1 text-3xl font-semibold">{productCount}</p></CardContent></Card>
      </section>

      <section className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Cari kupon atau produk" className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Cari kode kupon atau produk..." value={query} /></div>
        <Select onValueChange={(value) => setStatus(value ?? "all")} value={status}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </section>

      {!totalsAvailable && (
        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Total diskon tidak tersedia. Pastikan kredensial WooCommerce dapat membaca data order.
        </p>
      )}

      {filteredCoupons.length === 0 ? (
        <Card><CardContent className="flex min-h-56 flex-col items-center justify-center gap-2 text-center"><PackageOpen className="size-8 text-muted-foreground" /><h2 className="font-medium">Tidak ada kupon ditemukan</h2><p className="text-sm text-muted-foreground">Ubah kata kunci atau filter status untuk melihat data lain.</p></CardContent></Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Kupon</TableHead><TableHead>Diskon</TableHead><TableHead>Total diskon diberikan</TableHead><TableHead>Status</TableHead><TableHead>Produk terkait</TableHead><TableHead>Berlaku sampai</TableHead><TableHead>Penggunaan</TableHead></TableRow></TableHeader>
              <TableBody>{filteredCoupons.map((coupon) => <TableRow key={coupon.id}><TableCell><div className="flex items-center"><span className="font-mono font-semibold">{coupon.code}</span><CopyCouponButton code={coupon.code} /></div></TableCell><TableCell>{formatDiscount(coupon)}</TableCell><TableCell className="font-medium">{formatTotalDiscount(coupon)}</TableCell><TableCell><Badge variant={statusVariant(coupon.status)}>{coupon.status}</Badge></TableCell><TableCell><ProductList products={coupon.products} /></TableCell><TableCell>{formatExpiry(coupon.expiresAt)}</TableCell><TableCell>{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
          <div className="space-y-4 md:hidden">{filteredCoupons.map((coupon) => <CouponCard coupon={coupon} key={coupon.id} />)}</div>
        </>
      )}
    </main>
  );
}
