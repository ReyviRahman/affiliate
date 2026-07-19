import "server-only";

export type CouponStatus = "publish" | "draft" | "pending" | "private" | "trash" | string;

export type CouponProduct = {
  id: number;
  name: string;
  price: string;
  imageUrl: string | null;
  permalink: string | null;
  available: boolean;
};

export type Coupon = {
  id: number;
  code: string;
  amount: string;
  discountType: string;
  status: CouponStatus;
  expiresAt: string | null;
  usageCount: number;
  usageLimit: number | null;
  totalDiscount: string | null;
  products: CouponProduct[];
};

export type CouponDashboardData = {
  coupons: Coupon[];
  totalsAvailable: boolean;
};

type WooCouponResponse = {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  status: CouponStatus;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number | null;
  product_ids: number[];
};

type WooProductResponse = {
  id: number;
  name: string;
  price: string;
  permalink: string;
  images: Array<{ src?: string }>;
};

type WooOrderResponse = {
  coupon_lines: WooCouponLineResponse[];
};

type WooCouponLineResponse = {
  id: number;
  code: string;
  discount: string;
  meta_data: Array<{ key?: string; value?: unknown }>;
};

class WooCommerceError extends Error {}

function getApiUrl() {
  const baseUrl = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!baseUrl || !key || !secret) {
    throw new WooCommerceError("Konfigurasi WooCommerce belum lengkap.");
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new WooCommerceError("URL WooCommerce tidak valid.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new WooCommerceError("URL WooCommerce tidak valid.");
  }

  url.pathname = `${url.pathname.replace(/\/$/, "")}/wp-json/wc/v3/`;
  return {
    apiUrl: url.toString(),
    authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

async function request<T>(path: string): Promise<{ data: T; response: Response }> {
  const { apiUrl, authorization } = getApiUrl();
  const response = await fetch(new URL(path, apiUrl), {
    cache: "no-store",
    headers: { Authorization: authorization },
  });

  if (!response.ok) {
    throw new WooCommerceError(
      response.status === 401 || response.status === 403
        ? "Kredensial WooCommerce tidak dapat digunakan."
        : "Data WooCommerce tidak dapat dimuat.",
    );
  }

  return { data: (await response.json()) as T, response };
}

async function getCoupons(): Promise<WooCouponResponse[]> {
  const coupons: WooCouponResponse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data, response } = await request<WooCouponResponse[]>(
      `coupons?status=any&per_page=100&page=${page}`,
    );

    if (!Array.isArray(data)) {
      throw new WooCommerceError("Format data kupon tidak valid.");
    }

    coupons.push(...data);
    const headerTotal = Number(response.headers.get("x-wp-totalpages"));
    totalPages = Number.isFinite(headerTotal) && headerTotal > 0 ? headerTotal : page;

    if (data.length < 100) break;
    page += 1;
  }

  return coupons;
}

async function getOrders(status: "completed" | "refunded"): Promise<WooOrderResponse[]> {
  const orders: WooOrderResponse[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data, response } = await request<WooOrderResponse[]>(
      `orders?status=${status}&per_page=100&page=${page}`,
    );

    if (!Array.isArray(data)) {
      throw new WooCommerceError("Format data order tidak valid.");
    }

    orders.push(...data);
    const headerTotal = Number(response.headers.get("x-wp-totalpages"));
    totalPages = Number.isFinite(headerTotal) && headerTotal > 0 ? headerTotal : page;

    if (data.length < 100) break;
    page += 1;
  }

  return orders;
}

const MONEY_SCALE = BigInt(1_000_000);
const ZERO_MONEY = BigInt(0);

function parseMoney(value: string) {
  const match = value.trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) throw new WooCommerceError("Nilai diskon order tidak valid.");

  const fraction = (match[3] ?? "").padEnd(6, "0").slice(0, 6);
  const result = BigInt(match[2]) * MONEY_SCALE + BigInt(fraction || "0");
  return match[1] === "-" ? -result : result;
}

function formatMoney(value: bigint) {
  const sign = value < ZERO_MONEY ? "-" : "";
  const absolute = value < ZERO_MONEY ? -value : value;
  const whole = absolute / MONEY_SCALE;
  const fraction = (absolute % MONEY_SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return `${sign}${whole}${fraction ? `.${fraction}` : ""}`;
}

function getCouponId(couponLine: WooCouponLineResponse) {
  const couponInfo = couponLine.meta_data.find((item) => item.key === "coupon_info")?.value;
  const couponData = couponLine.meta_data.find((item) => item.key === "coupon_data")?.value;

  if (typeof couponInfo === "string") {
    try {
      const parsed = JSON.parse(couponInfo);
      if (Array.isArray(parsed) && typeof parsed[0] === "number") return parsed[0];
    } catch {
      return null;
    }
  }

  if (Array.isArray(couponInfo) && typeof couponInfo[0] === "number") return couponInfo[0];
  if (couponData && typeof couponData === "object" && "id" in couponData) {
    const id = (couponData as { id?: unknown }).id;
    if (typeof id === "number") return id;
  }

  return null;
}

async function getDiscountTotals(coupons: WooCouponResponse[]) {
  try {
    const couponIds = new Set(coupons.map((coupon) => coupon.id));
    const couponIdsByCode = new Map(coupons.map((coupon) => [coupon.code.toLowerCase(), coupon.id]));
    const totals = new Map<number, bigint>();
    const [completedOrders, refundedOrders] = await Promise.all([
      getOrders("completed"),
      getOrders("refunded"),
    ]);

    for (const order of [...completedOrders, ...refundedOrders]) {
      for (const couponLine of order.coupon_lines) {
        const couponIdFromMetadata = getCouponId(couponLine);
        const couponId = couponIdFromMetadata && couponIds.has(couponIdFromMetadata)
          ? couponIdFromMetadata
          : couponIdsByCode.get(couponLine.code.toLowerCase());

        if (!couponId) continue;
        totals.set(couponId, (totals.get(couponId) ?? ZERO_MONEY) + parseMoney(couponLine.discount));
      }
    }

    return new Map([...totals].map(([couponId, total]) => [couponId, formatMoney(total)]));
  } catch {
    return null;
  }
}

async function getProduct(id: number): Promise<CouponProduct> {
  try {
    const { data } = await request<WooProductResponse>(`products/${id}`);
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      imageUrl: data.images[0]?.src ?? null,
      permalink: data.permalink || null,
      available: true,
    };
  } catch {
    return {
      id,
      name: `Produk #${id}`,
      price: "",
      imageUrl: null,
      permalink: null,
      available: false,
    };
  }
}

export async function getCouponDashboard(): Promise<CouponDashboardData> {
  const couponResponses = await getCoupons();
  const productIds = [...new Set(couponResponses.flatMap((coupon) => coupon.product_ids))];
  const [productEntries, discountTotals] = await Promise.all([
    Promise.all(productIds.map(async (id) => [id, await getProduct(id)] as const)),
    getDiscountTotals(couponResponses),
  ]);
  const products = new Map(productEntries);

  return {
    coupons: couponResponses.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      amount: coupon.amount,
      discountType: coupon.discount_type,
      status: coupon.status,
      expiresAt: coupon.date_expires,
      usageCount: coupon.usage_count,
      usageLimit: coupon.usage_limit,
      totalDiscount: discountTotals ? (discountTotals.get(coupon.id) ?? "0") : null,
      products: coupon.product_ids.map((productId) => products.get(productId)!).filter(Boolean),
    })),
    totalsAvailable: discountTotals !== null,
  };
}

export function getCouponDashboardErrorMessage(error: unknown) {
  return error instanceof WooCommerceError
    ? error.message
    : "Terjadi masalah saat memuat data kupon.";
}
