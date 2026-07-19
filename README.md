# Affiliate

Starter project Next.js, Prisma, PostgreSQL, dan Docker Compose. Production menjalankan aplikasi dan database dalam satu Compose application, sehingga dapat langsung dipakai di Coolify.

## Prasyarat

- Docker Desktop atau Docker Engine dengan Docker Compose
- Node.js 24+ dan npm, hanya jika ingin menjalankan aplikasi tanpa Docker

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`.
2. Ganti `POSTGRES_PASSWORD` dengan secret alfanumerik yang panjang. Sesuaikan juga bagian password pada `DATABASE_URL` bila menjalankan Prisma dari host.
3. Untuk menjalankan Next.js langsung dari host dan hanya menjalankan PostgreSQL di Docker, gunakan:

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db
npm run dev
```

Perintah tersebut membuka PostgreSQL pada `localhost:5432` untuk development. Konfigurasi produksi pada `docker-compose.yml` tetap tidak mempublikasikan port database.

4. Untuk menjalankan seluruh stack Docker, jalankan `docker compose up --build`.
5. Buka `http://localhost:3000`.
6. Periksa status pada `http://localhost:3000/api/health`.

PostgreSQL hanya memakai `POSTGRES_USER`, `POSTGRES_PASSWORD`, dan `POSTGRES_DB` ketika volume pertama dibuat. Jika mengubah salah satu nilai tersebut pada local development, reset database lokal sebelum menjalankan Compose lagi:

```sh
docker compose down --volumes
docker compose up --build
```

Perintah reset tersebut menghapus seluruh data database lokal.

Database tidak dipublikasikan ke host. Untuk menjalankan Prisma dari host, jalankan `docker compose exec app npx prisma studio` atau sementara tambahkan port database untuk kebutuhan development.

## Database

Schema Prisma berada di `prisma/schema.prisma`. Migration production berada di `prisma/migrations` dan otomatis diterapkan oleh container aplikasi saat mulai.

Perintah yang berguna bila menjalankan dengan Node.js di host:

```sh
npm install
npm run db:generate
npm run db:migrate -- --name nama_migration
npm run db:studio
```

## Deploy ke Coolify

1. Push repository ini ke Git provider.
2. Buat resource baru bertipe **Docker Compose** di Coolify dan hubungkan repository.
3. Pilih file `docker-compose.yml`.
4. Tambahkan environment variables pada resource: `POSTGRES_USER`, `POSTGRES_PASSWORD`, dan `POSTGRES_DB`. Gunakan password alfanumerik panjang agar valid sebagai bagian dari connection URL.
5. Hubungkan domain ke service `app` pada port `3000`.
6. Set health check HTTP ke `/api/health` bila tersedia pada konfigurasi Coolify.
7. Deploy.

Service `db` tidak memiliki port publik dan hanya dapat diakses oleh `app` melalui hostname internal `db`. Data PostgreSQL tersimpan pada named volume `postgres_data`, sehingga redeploy aplikasi tidak menghapus database. Tetap buat backup terjadwal menggunakan Cron Job Coolify atau `pg_dump`; volume persisten bukan pengganti backup.

## Environment variables

| Variable | Keterangan |
| --- | --- |
| `POSTGRES_USER` | Nama user PostgreSQL. |
| `POSTGRES_PASSWORD` | Password PostgreSQL alfanumerik. Jangan commit nilainya. |
| `POSTGRES_DB` | Nama database PostgreSQL. |
| `APP_PORT` | Port host untuk local Compose, default `3000`. |
| `DATABASE_URL` | Hanya dipakai ketika menjalankan Prisma/Next.js langsung dari host. Compose membentuk URL internalnya sendiri. |
| `WOOCOMMERCE_URL` | URL dasar WordPress/WooCommerce, misalnya `https://yantotanjung.com`. |
| `WOOCOMMERCE_CONSUMER_KEY` | Consumer key WooCommerce read-only untuk dashboard kupon dan order. Jangan commit nilainya. |
| `WOOCOMMERCE_CONSUMER_SECRET` | Consumer secret WooCommerce read-only untuk dashboard kupon dan order. Jangan commit nilainya. |
