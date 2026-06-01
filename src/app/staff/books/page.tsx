import { StaffBooksPage } from "@/features/catalog/components/StaffBooksPage";

type StaffBooksRouteProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function StaffBooksRoute({ searchParams }: StaffBooksRouteProps) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;

  return <StaffBooksPage initialQuery={query ?? ""} />;
}
