export default function Home() {
  return (
    <main>
      <p className="eyebrow">Affiliate Platform</p>
      <h1>Next.js, PostgreSQL, dan Docker siap digunakan.</h1>
      <p className="description">
        Aplikasi ini berjalan bersama PostgreSQL dalam satu Docker Compose application dan siap
        dideploy ke Coolify
      </p>
      <a href="/api/health">Periksa status aplikasi</a>
    </main>
  );
}
