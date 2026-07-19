import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3"><Skeleton className="h-5 w-28" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-96 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-96 w-full" />
    </main>
  );
}
