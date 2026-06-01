import { StaffBooksPage } from "@/features/catalog/components/StaffBooksPage";

type AdminBooksRouteProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function AdminBooksRoute({ searchParams }: AdminBooksRouteProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;

  return <StaffBooksPage mode="admin" initialQuery={query ?? ""} />;
}
