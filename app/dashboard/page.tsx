import type { Metadata } from "next";
import { CouponDashboard } from "@/components/coupon-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import type { CouponDashboardData } from "@/lib/woocommerce";
import { getCouponDashboard, getCouponDashboardErrorMessage } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Dashboard Kupon",
  description: "Dashboard kupon WooCommerce",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let dashboard: CouponDashboardData | null = null;
  let errorMessage: string | null = null;

  try {
    dashboard = await getCouponDashboard();
  } catch (error) {
    errorMessage = getCouponDashboardErrorMessage(error);
  }

  if (dashboard) return <CouponDashboard {...dashboard} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <Card className="w-full">
        <CardContent className="space-y-2 pt-4">
          <h1 className="text-xl font-semibold">Data kupon belum tersedia</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">Periksa konfigurasi environment WooCommerce lalu muat ulang halaman.</p>
        </CardContent>
      </Card>
    </main>
  );
}
